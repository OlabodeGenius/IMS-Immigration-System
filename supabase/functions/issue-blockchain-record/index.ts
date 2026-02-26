// supabase/functions/issue-blockchain-record/index.ts
//
// Receives { card_id, record_hash } and writes it to the local
// StudentLedger smart contract using ethers.js, returning the real txHash.

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
        const { card_id, record_hash } = await req.json();

        if (!card_id || !record_hash) {
            return new Response(
                JSON.stringify({ error: "card_id and record_hash are required" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // --- Configuration from Deno env (set in Supabase Secrets) ---------------
        const RPC_URL = Deno.env.get("BLOCKCHAIN_RPC_URL");
        const PRIVATE_KEY = Deno.env.get("BLOCKCHAIN_PRIVATE_KEY");
        const CONTRACT_ADDRESS = Deno.env.get("BLOCKCHAIN_CONTRACT_ADDRESS");

        if (!RPC_URL || !PRIVATE_KEY || !CONTRACT_ADDRESS) {
            return new Response(
                JSON.stringify({ error: "Blockchain environment variables not configured" }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // --- ABI (only the issueCard function we need) ----------------------------
        const abi = [
            "function issueCard(string memory cardId, string memory recordHash) public",
            "event CardIssued(string indexed cardId, string recordHash, uint256 timestamp, address issuer)"
        ];

        // --- ethers.js (CDN import for Deno) --------------------------------------
        // @ts-ignore
        const { ethers } = await import("https://esm.sh/ethers@6.13.5");

        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

        // --- Write the hash to the blockchain -------------------------------------
        console.log(`Issuing card ${card_id} to blockchain...`);
        const tx = await contract.issueCard(card_id, record_hash);
        const receipt = await tx.wait();

        console.log(`✅ Blockchain tx confirmed: ${receipt.hash}`);

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
        console.error("Blockchain issuance failed:", e);
        return new Response(
            JSON.stringify({ error: "Blockchain issuance failed", detail: String(e) }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
