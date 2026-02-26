import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    CircularProgress,
    Stack,
    IconButton,
    Typography
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import DigitalStudentCard from "../DigitalStudentCard";
import { useStudentCard, useMintCardToken } from "../../hooks/useStudentCards";
import { useEffect, useState } from "react";

interface StudentCardDialogProps {
    open: boolean;
    studentId: string | null;
    onClose: () => void;
}

export function StudentCardDialog({ open, studentId, onClose }: StudentCardDialogProps) {
    const { data: card, isLoading: cardLoading } = useStudentCard(studentId || "");
    const { mutateAsync: mintToken } = useMintCardToken();
    const [token, setToken] = useState<string | null>(null);
    const [loadingToken, setLoadingToken] = useState(false);

    useEffect(() => {
        if (open && card?.id) {
            setLoadingToken(true);
            mintToken(card.id)
                .then((res) => setToken(res.token))
                .catch((err) => console.error("Failed to mint token:", err))
                .finally(() => setLoadingToken(false));
        } else if (!open) {
            setToken(null);
        }
    }, [open, card?.id, mintToken]);

    const isLoading = cardLoading;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md">
            <DialogTitle>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight={800}>Digital Student ID</Typography>
                    <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
                </Stack>
            </DialogTitle>
            <DialogContent dividers sx={{ bgcolor: "#F1F5F9", display: "flex", justifyContent: "center", p: 4 }}>
                {isLoading ? (
                    <Box sx={{ py: 10 }}>
                        <CircularProgress />
                    </Box>
                ) : card && card.status === "ACTIVE" ? (
                    <DigitalStudentCard
                        open={open}
                        onClose={onClose}
                        student={{
                            id: card.card_number || card.id,
                            schoolId: Array.isArray(card.student) ? card.student[0]?.student_id_number : card.student?.student_id_number || "—",
                            iin: Array.isArray(card.student) ? card.student[0]?.passport_number : card.student?.passport_number || "—",
                            fullName: Array.isArray(card.student) ? card.student[0]?.full_name : card.student?.full_name || "—",
                            dateOfBirth: Array.isArray(card.student) ? card.student[0]?.date_of_birth : card.student?.date_of_birth || "—",
                            sex: Array.isArray(card.student)
                                ? (card.student[0]?.sex || card.student[0]?.metadata?.sex || "—")
                                : (card.student?.sex || (card.student?.metadata as any)?.sex || "—"),
                            nationality: Array.isArray(card.student) ? card.student[0]?.nationality : card.student?.nationality || "—",
                            photo: Array.isArray(card.student) ? card.student[0]?.photo_url : card.student?.photo_url,
                            schoolName: Array.isArray(card.institution) ? card.institution[0]?.name : card.institution?.name || "—",
                            schoolAddress: Array.isArray(card.institution) ? card.institution[0]?.address || "—" : card.institution?.address || "—",
                            schoolLogo: Array.isArray(card.institution) ? card.institution[0]?.logo_url : card.institution?.logo_url,
                            cityRegion: Array.isArray(card.institution) ? card.institution[0]?.city || "Almaty" : card.institution?.city || "Almaty",
                            phoneNumber: Array.isArray(card.student) ? card.student[0]?.phone || "—" : card.student?.phone || "—",
                            dateOfIssue: new Date(card.issued_at).toLocaleDateString(),
                            dateOfExpiry: card.expires_at
                                ? new Date(card.expires_at).toLocaleDateString()
                                : (Array.isArray(card.student)
                                    ? (card.student[0]?.visa?.end_date ? new Date(card.student[0].visa.end_date).toLocaleDateString() : "—")
                                    : (card.student?.visa?.end_date ? new Date(card.student.visa.end_date).toLocaleDateString() : "—")),
                            qrData: token
                                ? `${window.location.origin}/verify?t=${token}`
                                : `${window.location.origin}/verify?card=${card.id}&hash=${card.blockchain_tx_id || card.record_hash || 'pending'}`,
                        }}
                    />
                ) : card ? (
                    <Stack alignItems="center" spacing={2} py={4}>
                        <Typography color="warning.main" fontWeight={700}>
                            Card Status: {card.status}
                        </Typography>
                        <Typography color="text.secondary" textAlign="center">
                            The digital ID is currently {card.status.toLowerCase()}.
                            {card.status === 'PENDING' ? ' It may require additional processing.' : ''}
                        </Typography>
                    </Stack>
                ) : (
                    <Typography color="text.secondary">
                        No digital ID card record found for this student.
                    </Typography>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} variant="contained" sx={{ borderRadius: 2 }}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}
