import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as jose from "https://esm.sh/jose@5";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VERIFY_JWT_SECRET = Deno.env.get("VERIFY_JWT_SECRET")!;

// If you know your production domain(s), you can tighten this.
// For thesis/prototype, "*" is usually fine.
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, prefer",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  // Only allow GET
  if (req.method !== "GET") {
    return json(
      { valid: false, reason: "server_error", error: "method_not_allowed" },
      405,
    );
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false },
  });

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("t");

    if (!token) {
      return json({ valid: false, reason: "missing_token" }, 400);
    }

    // 1) Verify JWT signature + exp + aud + iss
    let payload: jose.JWTPayload;
    try {
      const result = await jose.jwtVerify(
        token,
        new TextEncoder().encode(VERIFY_JWT_SECRET),
        { audience: "ims-is-verify", issuer: "ims-is" },
      );
      payload = result.payload;
    } catch {
      return json({ valid: false, reason: "invalid_or_expired_token" }, 401);
    }

    const card_id = String(payload.card_id ?? "");
    const token_version = Number(payload.token_version ?? NaN);

    if (!card_id || Number.isNaN(token_version)) {
      return json({ valid: false, reason: "invalid_or_expired_token" }, 401);
    }

    // 2) Load card row (minimal fields needed)
    const { data: card, error: cardErr } = await supabase
      .from("student_cards")
      .select(
        "id, student_id, institution_id, token_version, status, record_hash, blockchain_tx_id, expires_at",
      )
      .eq("id", card_id)
      .maybeSingle();

    if (cardErr || !card) {
      await logScan(supabase, {
        card_id,
        result: "INVALID",
        reason: "card_not_found",
      });
      return json({ valid: false, reason: "card_not_found" }, 404);
    }

    // 3) Token version check (prevents old QR reuse after replacement)
    if (card.token_version !== token_version) {
      await logScan(supabase, {
        card_id,
        student_id: card.student_id ?? null,
        institution_id: card.institution_id ?? null,
        result: "INVALID",
        reason: "token_version_mismatch",
      });
      return json({ valid: false, reason: "token_version_mismatch" }, 409);
    }

    // 4) Card status check
    if (String(card.status) !== "ACTIVE") {
      await logScan(supabase, {
        card_id,
        student_id: card.student_id ?? null,
        institution_id: card.institution_id ?? null,
        result: "INVALID",
        reason: "card_not_active",
      });
      return json({ valid: false, reason: "card_not_active" }, 409);
    }

    // Optional: card expiry enforcement (if you want strict behavior)
    // If you prefer “ACTIVE beats expires_at” for demo, remove this block.
    if (card.expires_at) {
      const exp = new Date(card.expires_at);
      if (!Number.isNaN(exp.getTime()) && exp.getTime() < Date.now()) {
        await logScan(supabase, {
          card_id,
          student_id: card.student_id ?? null,
          institution_id: card.institution_id ?? null,
          result: "INVALID",
          reason: "card_not_active",
        });
        return json({ valid: false, reason: "card_not_active" }, 409);
      }
    }

    // 5) Load minimal student verification data (privacy-preserving view)
    const { data: sv, error: svErr } = await supabase
      .from("student_verification_public")
      .select(
        "id, student_id_number, nationality, institution_name, institution_type",
      )
      .eq("id", card.student_id)
      .maybeSingle();

    // If view lookup fails, we can still continue with integrity check + visa status,
    // but we won't return institution/nationality if missing.
    if (svErr) {
      // don't fail; just proceed
    }

    // 6) Load latest visa safely (explicit query)
    const { data: visaRows } = await supabase
      .from("visas")
      .select("status, end_date, start_date, updated_at, created_at")
      .eq("student_id", card.student_id)
      .order("end_date", { ascending: false, nullsFirst: false })
      .order("updated_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false, nullsFirst: false })
      .limit(1);

    const visa = (visaRows && visaRows.length > 0) ? visaRows[0] : null;
    const visa_status = visa?.status ?? "UNKNOWN";
    const visa_end = visa?.end_date ?? null;

    // 7) Tamper-evidence check: compare to latest ledger entry
    const { data: ledger } = await supabase
      .from("blockchain_ledger")
      .select("record_hash, blockchain_tx_id")
      .eq("card_id", card_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const integrity_ok =
      !!ledger &&
      ledger.record_hash === card.record_hash &&
      ledger.blockchain_tx_id === card.blockchain_tx_id;

    // Strict mode: valid only if integrity check passes
    const valid = integrity_ok;

    // 8) Log scan (best-effort)
    await logScan(supabase, {
      card_id,
      student_id: card.student_id ?? null,
      institution_id: card.institution_id ?? null,
      result: valid ? "VALID" : "INVALID",
      reason: valid ? null : "integrity_check_failed",
      // NOTE: you can add req headers if your table supports them:
      user_agent: req.headers.get("user-agent"),
      // client_ip: req.headers.get("x-forwarded-for") ?? null,
    });

    // 9) Return minimal data
    return json(
      {
        valid,
        integrity_ok,
        blockchain_tx_id: card.blockchain_tx_id,
        institution: sv?.institution_name ?? null,
        institution_type: sv?.institution_type ?? null,
        visa_status,
        visa_end_date: visa_end,
        student_nationality: sv?.nationality ?? null,
        student_id_number: sv?.student_id_number ?? null,
      },
      200,
    );
  } catch (e) {
    return json(
      { valid: false, reason: "server_error", error: String(e) },
      500,
    );
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

async function logScan(
  supabase: ReturnType<typeof createClient>,
  args: {
    card_id: string | null;
    student_id?: string | null;
    institution_id?: string | null;
    result: "VALID" | "INVALID";
    reason: string | null;
    user_agent?: string | null;
    device_id?: string | null;
    client_ip?: string | null;
  },
) {
  try {
    // Only insert fields that likely exist (safe defaults)
    await supabase.from("verification_requests").insert({
      card_id: args.card_id ?? null,
      student_id: args.student_id ?? null,
      institution_id: args.institution_id ?? null,
      result: args.result,
      reason: args.reason,
      user_agent: args.user_agent ?? null,
      device_id: args.device_id ?? null,
      client_ip: args.client_ip ?? null,
    });
  } catch {
    // Do not break verification if logging fails
  }
}