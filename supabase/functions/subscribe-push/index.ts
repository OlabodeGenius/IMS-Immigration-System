import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

    try {
        const { subscription } = await req.json();
        if (!subscription?.endpoint) {
            return json({ error: "missing subscription" }, 400);
        }

        const supabase = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
            { auth: { persistSession: false } },
        );

        // Get the user from the JWT
        const authHeader = req.headers.get("Authorization");
        const token = authHeader?.replace("Bearer ", "");
        const { data: { user } } = await supabase.auth.getUser(token ?? "");

        if (!user) return json({ error: "unauthorized" }, 401);

        // Upsert the push subscription
        const { error } = await supabase
            .from("push_subscriptions")
            .upsert({
                user_id: user.id,
                endpoint: subscription.endpoint,
                p256dh: subscription.keys?.p256dh ?? null,
                auth: subscription.keys?.auth ?? null,
                updated_at: new Date().toISOString(),
            }, { onConflict: "endpoint" });

        if (error) throw error;

        return json({ ok: true });
    } catch (e) {
        return json({ error: String(e) }, 500);
    }
});

function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...CORS, "Content-Type": "application/json" },
    });
}
