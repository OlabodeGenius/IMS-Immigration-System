// supabase/functions/revoke-blockchain-record/index.ts
//
// Receives { card_id } and calls revokeCard on the
// StudentLedger smart contract, returning the txHash.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { card_id } = await req.json();

        if (!card_id) {
            return new Response(
                JSON.stringify({ error: "card_id is required" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const RPC_URL = Deno.env.get("BLOCKCHAIN_RPC_URL");
        const PRIVATE_KEY = Deno.env.get("BLOCKCHAIN_PRIVATE_KEY");
        const CONTRACT_ADDRESS = Deno.env.get("BLOCKCHAIN_CONTRACT_ADDRESS");

        if (!RPC_URL || !PRIVATE_KEY || !CONTRACT_ADDRESS) {
            return new Response(
                JSON.stringify({ error: "Blockchain environment variables not configured" }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const abi = [
            "function revokeCard(string memory cardId) public",
            "event CardRevoked(string indexed cardId, uint256 timestamp, address revokedBy)"
        ];

        // @ts-ignore
        const { ethers } = await import("https://esm.sh/ethers@6.13.5");

        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

        console.log(`Revoking card ${card_id} on blockchain...`);
        const tx = await contract.revokeCard(card_id);
        const receipt = await tx.wait();

        console.log(`✅ Blockchain revocation confirmed: ${receipt.hash}`);

        return new Response(
            JSON.stringify({
                success: true,
                txHash: receipt.hash,
                blockNumber: receipt.blockNumber,
                contractAddress: CONTRACT_ADDRESS,
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (e) {
        console.error("Blockchain revocation failed:", e);
        return new Response(
            JSON.stringify({ error: "Blockchain revocation failed", detail: String(e) }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
