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
import { StudentCardFront, StudentCardBack } from "../DigitalStudentCard";
import type { StudentCardData } from "../DigitalStudentCard";
import { useStudentCard, useMintCardToken } from "../../hooks/useStudentCards";
import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";

// Card spec (must match DigitalStudentCard.tsx constants)
const CARD_W = 1013;
const CARD_H = 638;
// CR80 physical card in mm
const CR80_W_MM = 85.6;
const CR80_H_MM = 54.0;

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
    const [qrCodeUrl, setQrCodeUrl] = useState("");
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const menuOpen = Boolean(anchorEl);

    // Refs to the rendered card DOM nodes (used for image capture)
    const frontRef = useRef<HTMLDivElement | null>(null);
    const backRef  = useRef<HTMLDivElement | null>(null);

    // ── Mint token on open ──────────────────────────────────────────────────────
    useEffect(() => {
        if (open && card?.id) {
            setLoadingToken(true);
            mintToken(card.id)
                .then((res) => setToken(res.token))
                .catch((err) => console.error("Failed to mint token:", err))
                .finally(() => setLoadingToken(false));
        } else if (!open) {
            setToken(null);
            setQrCodeUrl("");
        }
    }, [open, card?.id, mintToken]);

    // ── Generate QR code ───────────────────────────────────────────────────────
    useEffect(() => {
        if (!card?.id) return;
        const qrData = token
            ? `${window.location.origin}/verify?t=${token}`
            : `${window.location.origin}/verify?card=${card.id}&hash=${card.blockchain_tx_id || card.record_hash || "pending"}`;

        QRCode.toDataURL(qrData, {
            width: 431,
            margin: 1,
            errorCorrectionLevel: "H",
            color: { dark: "#000000", light: "#ffffff" },
        })
            .then(setQrCodeUrl)
            .catch(console.error);
    }, [card?.id, card?.blockchain_tx_id, card?.record_hash, token]);

    const isLoading = cardLoading;
    const cardReady = !isLoading && !!card && card.status === "ACTIVE";

    // ── Build StudentCardData from card record ─────────────────────────────────
    const getStudent = (card: any): StudentCardData => {
        const s = Array.isArray(card.student) ? card.student[0] : card.student;
        const i = Array.isArray(card.institution) ? card.institution[0] : card.institution;
        return {
            id: card.card_number || card.id,
            schoolId: s?.student_id_number || "—",
            iin: s?.iin || "—",                   // ← actual IIN field, not passport
            fullName: s?.full_name || "—",
            dateOfBirth: s?.date_of_birth || "—",
            sex: s?.sex || (s?.metadata as any)?.sex || "—",
            nationality: s?.nationality || "—",
            photo: s?.photo_url || null,
            schoolName: i?.name || "—",
            schoolAddress: i?.address || "—",
            schoolLogo: i?.logo_url || null,
            cityRegion: i?.city || "Almaty",
            phoneNumber: s?.phone || "—",
            dateOfIssue: new Date(card.issued_at).toLocaleDateString("en-GB"),
            dateOfExpiry: card.expires_at
                ? new Date(card.expires_at).toLocaleDateString("en-GB")
                : (s?.visa?.end_date ? new Date(s.visa.end_date).toLocaleDateString("en-GB") : "—"),
            qrData: undefined, // passed separately via qrCodeUrl
        };
    };

    // ── Image capture helpers ──────────────────────────────────────────────────
    const captureNode = async (node: HTMLElement): Promise<string> =>
        toPng(node, {
            quality: 1,
            pixelRatio: 3,
            backgroundColor: "#ffffff",
            fetchRequestInit: { cache: "no-cache" },
        });

    // ── PNG Download (front only) ──────────────────────────────────────────────
    const downloadPng = async () => {
        setIsExporting(true);
        setAnchorEl(null);
        try {
            const node = frontRef.current ?? document.getElementById("student-card-front");
            if (!node) throw new Error("Card front element not found");
            const dataUrl = await captureNode(node as HTMLElement);
            const link = document.createElement("a");
            link.download = `student-id-front-${card?.card_number || "card"}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error("PNG export failed:", err);
        } finally {
            setIsExporting(false);
        }
    };

    // ── PDF Download (front + back, CR80 landscape × 2 pages) ─────────────────
    const downloadPdf = async () => {
        setIsExporting(true);
        setAnchorEl(null);
        try {
            const frontNode = frontRef.current ?? document.getElementById("student-card-front");
            const backNode  = backRef.current  ?? document.getElementById("student-card-back");
            if (!frontNode || !backNode) throw new Error("Card elements not found");

            const [frontUrl, backUrl] = await Promise.all([
                captureNode(frontNode as HTMLElement),
                captureNode(backNode as HTMLElement),
            ]);

            // CR80 card: 85.6 × 54 mm landscape
            const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: [CR80_W_MM, CR80_H_MM] });
            pdf.addImage(frontUrl, "PNG", 0, 0, CR80_W_MM, CR80_H_MM);
            pdf.addPage([CR80_W_MM, CR80_H_MM], "landscape");
            pdf.addImage(backUrl, "PNG", 0, 0, CR80_W_MM, CR80_H_MM);
            pdf.save(`student-id-${card?.card_number || "card"}.pdf`);
        } catch (err) {
            console.error("PDF export failed:", err);
        } finally {
            setIsExporting(false);
        }
    };

    // ── Print (both sides, opens system dialog) ────────────────────────────────
    const handlePrint = async () => {
        setAnchorEl(null);
        setIsExporting(true);
        try {
            const frontNode = frontRef.current ?? document.getElementById("student-card-front");
            const backNode  = backRef.current  ?? document.getElementById("student-card-back");
            if (!frontNode || !backNode) return;

            const [frontUrl, backUrl] = await Promise.all([
                captureNode(frontNode as HTMLElement),
                captureNode(backNode as HTMLElement),
            ]);

            const win = window.open("", "_blank");
            if (!win) return;
            win.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Student ID Card — ${card?.card_number || ""}</title>
                    <style>
                        @page { margin: 0; size: ${CR80_W_MM}mm ${CR80_H_MM}mm landscape; }
                        body { margin: 0; padding: 0; }
                        .page { width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center; page-break-after: always; }
                        .page:last-child { page-break-after: auto; }
                        img { width: 100%; height: auto; }
                    </style>
                </head>
                <body>
                    <div class="page"><img src="${frontUrl}" /></div>
                    <div class="page"><img src="${backUrl}" /></div>
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
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={false}
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    maxWidth: "98vw",
                    maxHeight: "96vh",
                    overflow: "hidden",
                },
            }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight={800}>Digital Student ID</Typography>
                    <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
                </Stack>
            </DialogTitle>

            <DialogContent
                dividers
                sx={{
                    bgcolor: "#1c1c1e",
                    display: "flex",
                    flexDirection: { xs: "column", xl: "row" },
                    gap: "36px",
                    p: "40px",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "auto",
                }}
            >
                {isLoading ? (
                    <Box sx={{ py: 12, display: "flex", justifyContent: "center" }}>
                        <CircularProgress sx={{ color: "#fff" }} />
                    </Box>
                ) : card && card.status === "ACTIVE" ? (
                    <>
                        {/* Front card */}
                        <Box ref={frontRef}>
                            <StudentCardFront student={getStudent(card)} />
                        </Box>

                        {/* Back card */}
                        <Box ref={backRef}>
                            <StudentCardBack student={getStudent(card)} qrCodeUrl={qrCodeUrl} />
                        </Box>
                    </>
                ) : card ? (
                    <Stack alignItems="center" spacing={2} py={4}>
                        <Typography color="warning.main" fontWeight={700} sx={{ color: "#fbbf24" }}>
                            Card Status: {card.status}
                        </Typography>
                        <Typography sx={{ color: "#9ca3af" }} textAlign="center">
                            The digital ID is currently {card.status.toLowerCase()}.
                            {card.status === "PENDING" ? " It may require additional processing." : ""}
                        </Typography>
                    </Stack>
                ) : (
                    <Typography sx={{ color: "#9ca3af" }}>
                        No digital ID card record found for this student.
                    </Typography>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 2, gap: 1, bgcolor: "#f8fafc" }}>
                <Button onClick={onClose} variant="text" sx={{ fontWeight: 700 }}>
                    Close
                </Button>

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
                            PaperProps={{ sx: { borderRadius: 2, minWidth: 220, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" } }}
                        >
                            <MenuItem onClick={downloadPng} sx={{ py: 1.5 }}>
                                <ListItemIcon><ImageIcon fontSize="small" color="primary" /></ListItemIcon>
                                <ListItemText
                                    primary="Download Front (PNG)"
                                    secondary="3× resolution image for printing"
                                    primaryTypographyProps={{ fontWeight: 700, fontSize: "0.9rem" }}
                                    secondaryTypographyProps={{ fontSize: "0.75rem" }}
                                />
                            </MenuItem>

                            <MenuItem onClick={downloadPdf} sx={{ py: 1.5 }}>
                                <ListItemIcon><PdfIcon fontSize="small" color="error" /></ListItemIcon>
                                <ListItemText
                                    primary="Download Both Sides (PDF)"
                                    secondary="CR80 card size (85.6 × 54 mm)"
                                    primaryTypographyProps={{ fontWeight: 700, fontSize: "0.9rem" }}
                                    secondaryTypographyProps={{ fontSize: "0.75rem" }}
                                />
                            </MenuItem>

                            <Divider />

                            <MenuItem onClick={handlePrint} sx={{ py: 1.5 }}>
                                <ListItemIcon><PrintIcon fontSize="small" /></ListItemIcon>
                                <ListItemText
                                    primary="Print Both Sides"
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
