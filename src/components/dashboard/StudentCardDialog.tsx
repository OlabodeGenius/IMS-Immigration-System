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
    Typography,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Divider,
} from "@mui/material";
import {
    Close as CloseIcon,
    Download as DownloadIcon,
    Image as ImageIcon,
    PictureAsPdf as PdfIcon,
    Print as PrintIcon,
    KeyboardArrowDown as ArrowDownIcon,
} from "@mui/icons-material";
import DigitalStudentCard from "../DigitalStudentCard";
import { useStudentCard, useMintCardToken } from "../../hooks/useStudentCards";
import { useEffect, useState } from "react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";

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
    const [isExporting, setIsExporting] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const menuOpen = Boolean(anchorEl);

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
    const cardReady = !isLoading && !!card && card.status === "ACTIVE";

    // ── Capture the card DOM node ─────────────────────────────────────────────
    const captureCardImage = async (): Promise<string> => {
        const node = document.getElementById("student-card-front");
        if (!node) throw new Error("Card element not found");

        return toPng(node, {
            quality: 1,
            pixelRatio: 3,          // 3× for high-resolution output
            backgroundColor: "#ffffff",
            style: {
                // Ensure rounded corners sit nicely in the export
                borderRadius: "16px",
            },
            // Cross-origin images need CORS headers – best effort workaround
            fetchRequestInit: { cache: "no-cache" },
        });
    };

    // ── PNG Download ──────────────────────────────────────────────────────────
    const downloadPng = async () => {
        setIsExporting(true);
        setAnchorEl(null);
        try {
            const dataUrl = await captureCardImage();
            const link = document.createElement("a");
            link.download = `student-id-${card?.card_number || "card"}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error("PNG export failed:", err);
        } finally {
            setIsExporting(false);
        }
    };

    // ── PDF Download ──────────────────────────────────────────────────────────
    const downloadPdf = async () => {
        setIsExporting(true);
        setAnchorEl(null);
        try {
            const dataUrl = await captureCardImage();

            // Card is 656 × 440 px (landscape ID card).
            // We'll use the standard CR80 card size in mm: 85.6 × 53.98 mm
            // Landscape orientation.
            const pdf = new jsPDF({
                orientation: "landscape",
                unit: "mm",
                format: [85.6, 54],
            });

            pdf.addImage(dataUrl, "PNG", 0, 0, 85.6, 54);
            pdf.save(`student-id-${card?.card_number || "card"}.pdf`);
        } catch (err) {
            console.error("PDF export failed:", err);
        } finally {
            setIsExporting(false);
        }
    };

    // ── Print ─────────────────────────────────────────────────────────────────
    const handlePrint = async () => {
        setAnchorEl(null);
        setIsExporting(true);
        try {
            const dataUrl = await captureCardImage();
            const win = window.open("", "_blank");
            if (!win) return;
            win.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Student ID Card</title>
                    <style>
                        @page { margin: 0; size: 85.6mm 54mm landscape; }
                        body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
                        img { width: 100%; height: auto; page-break-inside: avoid; }
                    </style>
                </head>
                <body>
                    <img src="${dataUrl}" />
                    <script>window.onload = () => { window.print(); window.close(); }<\/script>
                </body>
                </html>
            `);
            win.document.close();
        } finally {
            setIsExporting(false);
        }
    };

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

            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button onClick={onClose} variant="text" sx={{ fontWeight: 700 }}>
                    Close
                </Button>

                {/* Download split button – only shown when card is active */}
                {cardReady && (
                    <>
                        <Button
                            variant="contained"
                            startIcon={isExporting ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon />}
                            endIcon={<ArrowDownIcon />}
                            disabled={isExporting || loadingToken}
                            onClick={(e) => setAnchorEl(e.currentTarget)}
                            sx={{ borderRadius: 2, fontWeight: 800, px: 3 }}
                        >
                            {isExporting ? "Exporting…" : "Download"}
                        </Button>

                        <Menu
                            anchorEl={anchorEl}
                            open={menuOpen}
                            onClose={() => setAnchorEl(null)}
                            anchorOrigin={{ vertical: "top", horizontal: "right" }}
                            transformOrigin={{ vertical: "bottom", horizontal: "right" }}
                            PaperProps={{ sx: { borderRadius: 2, minWidth: 200, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" } }}
                        >
                            <MenuItem onClick={downloadPng} sx={{ py: 1.5 }}>
                                <ListItemIcon><ImageIcon fontSize="small" color="primary" /></ListItemIcon>
                                <ListItemText
                                    primary="Download as PNG"
                                    secondary="High-res image for printing"
                                    primaryTypographyProps={{ fontWeight: 700, fontSize: "0.9rem" }}
                                    secondaryTypographyProps={{ fontSize: "0.75rem" }}
                                />
                            </MenuItem>

                            <MenuItem onClick={downloadPdf} sx={{ py: 1.5 }}>
                                <ListItemIcon><PdfIcon fontSize="small" color="error" /></ListItemIcon>
                                <ListItemText
                                    primary="Download as PDF"
                                    secondary="CR80 card size (85.6 × 54 mm)"
                                    primaryTypographyProps={{ fontWeight: 700, fontSize: "0.9rem" }}
                                    secondaryTypographyProps={{ fontSize: "0.75rem" }}
                                />
                            </MenuItem>

                            <Divider />

                            <MenuItem onClick={handlePrint} sx={{ py: 1.5 }}>
                                <ListItemIcon><PrintIcon fontSize="small" /></ListItemIcon>
                                <ListItemText
                                    primary="Print"
                                    secondary="Opens system print dialog"
                                    primaryTypographyProps={{ fontWeight: 700, fontSize: "0.9rem" }}
                                    secondaryTypographyProps={{ fontSize: "0.75rem" }}
                                />
                            </MenuItem>
                        </Menu>
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
}
