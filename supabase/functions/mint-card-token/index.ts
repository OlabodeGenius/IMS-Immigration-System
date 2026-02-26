// supabase/functions/mint-card-token/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SignJWT } from "https://esm.sh/jose@5.6.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // for dev; later you can restrict to your domain
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, prefer",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  // 1) Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 2) Require auth header from Supabase client
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const jwtSecret = Deno.env.get("VERIFY_JWT_SECRET")!;

    if (!jwtSecret) {
      return new Response(JSON.stringify({ error: "VERIFY_JWT_SECRET not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // Validate caller identity (must be logged in)
    const jwt = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);

    if (userError || !user) {
      console.error("Auth error in edge function:", userError?.message);
      return new Response(JSON.stringify({
        error: "Unauthorized",
        details: userError?.message || "Invalid session or token",
        hint: "Please try logging out and logging back in if this persists.",
        context: "mint-card-token"
      }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const card_id = body.card_id as string | undefined;

    if (!card_id) {
      return new Response(JSON.stringify({ error: "card_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch card to include token_version
    const { data: card, error: cardError } = await supabase
      .from("student_cards")
      .select("id, token_version, status")
      .eq("id", card_id)
      .single();

    if (cardError || !card) {
      return new Response(JSON.stringify({ error: "Card not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (card.status !== "ACTIVE") {
      return new Response(JSON.stringify({ error: "Card not active" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mint short-lived token (24 hours for robust testing)
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 24 * 60 * 60;

    const token = await new SignJWT({
      card_id: card.id,
      token_version: card.token_version,
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuedAt(iat)
      .setExpirationTime(exp)
      .setAudience("ims-is-verify")
      .setIssuer("ims-is")
      .sign(new TextEncoder().encode(jwtSecret));

    return new Response(JSON.stringify({ token, expires_in: 86400 }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Server error", detail: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});