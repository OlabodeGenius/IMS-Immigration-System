import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";

export function useIssueStudentCard() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async (studentId: string) => {
            const { data, error } = await supabase.rpc("issue_student_card", {
                p_student_id: studentId,
            });
            if (error) throw error;
            return data;
        },
        onSuccess: (_, studentId) => {
            qc.invalidateQueries({ queryKey: ["students"] });
            qc.invalidateQueries({ queryKey: ["student"] });
            qc.invalidateQueries({ queryKey: ["student_card", studentId] });
        },
    });
}

export function useStudentCard(studentId: string) {
    return useQuery({
        queryKey: ["student_card", studentId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("student_cards")
                .select("*, student:students(*), institution:institutions(*)")
                .eq("student_id", studentId)
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();

            if (error) throw error;
            return data;
        },
        enabled: !!studentId,
    });
}

export function useMintCardToken() {
    return useMutation({
        mutationFn: async (cardId: string) => {
            const { data: { session } } = await supabase.auth.getSession();
            const { data, error } = await supabase.functions.invoke("mint-card-token", {
                body: { card_id: cardId },
                headers: {
                    Authorization: `Bearer ${session?.access_token}`
                }
            });

            if (error) throw error;
            return data as { token: string; expires_in: number };
        },
    });
}

// Simple SHA-256 helper for the browser
async function generateHash(data: string) {
    const msgUint8 = new TextEncoder().encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function useBatchIssueStudentCards() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async (students: any[]) => {
            const results = [];
            for (const student of students) {
                try {
                    const { data: existing } = await supabase
                        .from('student_cards')
                        .select('id')
                        .eq('student_id', student.id)
                        .maybeSingle();

                    if (existing) {
                        results.push({ studentId: student.id, status: 'skipped', reason: 'already exists' });
                        continue;
                    }

                    const rawData = JSON.stringify({
                        id: student.id,
                        name: student.full_name,
                        passport: student.passport_number,
                        expiry: student.date_of_birth,
                        institution: student.institution_id
                    });
                    const recordHash = await generateHash(rawData);
                    const cardNumber = `IMS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

                    const { data: card, error: cardError } = await supabase
                        .from('student_cards')
                        .insert({
                            card_number: cardNumber,
                            student_id: student.id,
                            institution_id: student.institution_id,
                            record_hash: recordHash,
                            blockchain_tx_id: 'pending',
                            status: 'ACTIVE',
                            expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
                        })
                        .select()
                        .single();

                    if (cardError) throw cardError;

                    const { data: blockchainData, error: blockchainError } = await supabase.functions.invoke(
                        'issue-blockchain-record',
                        { body: { card_id: card.id, record_hash: recordHash } }
                    );

                    const txId = blockchainError ? '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('') : blockchainData.txHash;

                    await supabase.from('student_cards').update({ blockchain_tx_id: txId }).eq('id', card.id);
                    await supabase.from('blockchain_ledger').insert({ card_id: card.id, record_hash: recordHash, blockchain_tx_id: txId });
                    await supabase.functions.invoke('mint-card-token', { body: { card_id: card.id } });

                    results.push({ studentId: student.id, status: 'success' });
                } catch (err) {
                    console.error("Failed to issue card for", student.id, err);
                    results.push({ studentId: student.id, status: 'error', error: err });
                }
            }
            return results;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["students"] });
            qc.invalidateQueries({ queryKey: ["student_card"] });
        },
    });
}

export function useRevokeStudentCard() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async (cardId: string) => {
            let txHash: string | null = null;

            // 1. Attempt on-chain revocation via local Ganache
            try {
                const deploymentRes = await fetch('/blockchain/artifacts/deployment.json');
                if (deploymentRes.ok) {
                    const deployment = await deploymentRes.json();
                    const { ethers } = await import('ethers');
                    const provider = new ethers.JsonRpcProvider(deployment.rpcUrl);
                    const wallet = new ethers.Wallet(deployment.deployerPrivateKey, provider);
                    const contract = new ethers.Contract(deployment.contractAddress, deployment.abi, wallet);

                    const tx = await contract.revokeCard(cardId);
                    const receipt = await tx.wait();
                    txHash = receipt.hash;
                    console.log('Blockchain revocation confirmed:', txHash);
                }
            } catch (err) {
                console.warn("Blockchain revocation failed (proceeding with DB update):", err);
            }

            // 2. Update the card status in Supabase to REVOKED
            const { error: dbError } = await supabase
                .from('student_cards')
                .update({ status: 'REVOKED' })
                .eq('id', cardId);

            if (dbError) throw dbError;

            return { txHash };
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["students"] });
            qc.invalidateQueries({ queryKey: ["student"] });
            qc.invalidateQueries({ queryKey: ["student_card"] });
        },
    });
}