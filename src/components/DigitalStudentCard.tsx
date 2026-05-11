import { Box, Dialog, DialogContent, IconButton, Button, Typography } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import kzLogo from "../assets/kz-logo.png";
import kbtuLogoDefault from "../assets/kbtu-logo.png";
import kimepLogoDefault from "../assets/kimep-logo.png";
import kaznuLogo from "../assets/kaznu-logo.png";
import nuLogo from "../assets/nu-logo.png";
import schoolPlaceholder from "../assets/school-placeholder.png";
import kzMapBackground from "../assets/kazakhstan_map.png";
import { useSnackbar } from "notistack";
import officialCrest from "../assets/official_crest.png";

// ─── Spec constants (px unless noted) ────────────────────────────────────────
const CARD_W = 1013;
const CARD_H = 638;
const PHOTO_W = 305;
const PHOTO_H = 346;
const QR_BG_W = 467;
const QR_BG_H = 487;
const QR_W = 431;
const QR_H = 446;
const IIN_W = 389;
const IIN_H = 53;
// Font sizes
const TITLE_FS = "40px";
const FIELD_LABEL_FS = "20pt";   // "First, Middle, Surname" label
const STUDENT_NAME_FS = "25pt";  // student name value
const FIELD_VALUE_FS = "22px";   // other field values on front
const BACK_VALUE_FS = "22px";    // back field values
const FOOTER_FS = "18px";

export interface StudentCardData {
    id: string;
    schoolId: string;
    iin: string;
    fullName: string;
    dateOfBirth: string;
    sex: string;
    nationality: string;
    photo?: string | null;
    schoolName: string;
    schoolAddress: string;
    schoolLogo?: string | null;
    dateOfIssue: string;
    dateOfExpiry: string;
    phoneNumber: string;
    cityRegion: string;
    qrData?: string;
}

interface DigitalStudentCardProps {
    open: boolean;
    onClose: () => void;
    student: StudentCardData;
}

const getSchoolLogo = (name: string, logoUrl?: string | null) => {
    if (logoUrl) return logoUrl;
    const n = name.toLowerCase();
    if (n.includes("kbtu") || n.includes("kazakh-british")) return kbtuLogoDefault;
    if (n.includes("kimep")) return kimepLogoDefault;
    if (n.includes("kaznu") || n.includes("al-farabi")) return kaznuLogo;
    if (n.includes("nazarbayev") || n.includes("nu ")) return nuLogo;
    return schoolPlaceholder;
};

const getSchoolAbbr = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("kbtu") || n.includes("kazakh-british")) return "KBTU";
    if (n.includes("kimep")) return "KIMEP";
    if (n.includes("kaznu") || n.includes("al-farabi")) return "KazNU";
    if (n.includes("nazarbayev") || n.includes("nu ")) return "NU";
    return "";
};

// ─── CARD FRONT (1013 × 638 px) ──────────────────────────────────────────────
export function StudentCardFront({ student }: { student: StudentCardData }) {
    const schoolLogo = getSchoolLogo(student.schoolName, student.schoolLogo);
    const abbr = getSchoolAbbr(student.schoolName);

    return (
        <Box
            id="student-card-front"
            sx={{
                width: CARD_W,
                height: CARD_H,
                bgcolor: "#ffffff",
                borderRadius: "18px",
                overflow: "hidden",
                boxShadow: "0 8px 40px rgba(0,0,0,0.22)",
                position: "relative",
                fontFamily: "'Inter','Helvetica Neue',Arial,sans-serif",
                border: "1px solid #d1d5db",
                display: "flex",
                flexDirection: "column",
                flexShrink: 0,
            }}
        >
            {/* ── Watermark 1: Kazakhstan map (cyan tint) ─────────────────── */}
            <Box
                component="img"
                src={kzMapBackground}
                sx={{
                    position: "absolute",
                    top: 0, left: 0,
                    width: "100%", height: "100%",
                    objectFit: "cover",
                    objectPosition: "center",
                    opacity: 0.11,
                    filter: "hue-rotate(170deg) saturate(1.6) brightness(0.9)",
                    pointerEvents: "none",
                    zIndex: 0,
                }}
            />

            {/* ── Watermark 2: Official crest (golden, right half) ─────────── */}
            <Box
                component="img"
                src={officialCrest}
                sx={{
                    position: "absolute",
                    top: "50%",
                    right: "-2%",
                    transform: "translateY(-50%)",
                    width: "46%",
                    height: "88%",
                    objectFit: "contain",
                    opacity: 0.16,
                    filter: "sepia(1) saturate(5) hue-rotate(8deg) brightness(1.5)",
                    pointerEvents: "none",
                    zIndex: 0,
                }}
            />

            {/* ── HEADER: KZ flag | Title | School logo ───────────────────── */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    px: "32px",
                    pt: "24px",
                    pb: "16px",
                    gap: "20px",
                    position: "relative",
                    zIndex: 1,
                    flexShrink: 0,
                }}
            >
                {/* Kazakhstan flag */}
                <Box
                    component="img"
                    src={kzLogo}
                    alt="Kazakhstan"
                    sx={{ width: 88, height: "auto", objectFit: "contain", flexShrink: 0 }}
                />

                {/* Title — 40px, bold, uppercase */}
                <Box sx={{ flex: 1, textAlign: "center" }}>
                    <Typography
                        sx={{
                            fontSize: TITLE_FS,
                            fontWeight: 800,
                            color: "#1a1a2e",
                            lineHeight: 1.15,
                            letterSpacing: "0.4px",
                            textTransform: "uppercase",
                        }}
                    >
                        Kazakhstan International<br />Student Digital ID
                    </Typography>
                </Box>

                {/* School logo + abbreviation */}
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        flexShrink: 0,
                        minWidth: 80,
                    }}
                >
                    <Box
                        component="img"
                        src={schoolLogo}
                        alt={student.schoolName}
                        sx={{ width: 64, height: 64, objectFit: "contain" }}
                    />
                    {abbr && (
                        <Typography
                            sx={{
                                fontSize: "18px",
                                fontWeight: 900,
                                color: "#1a3a6b",
                                mt: "3px",
                                letterSpacing: "1px",
                            }}
                        >
                            {abbr}
                        </Typography>
                    )}
                </Box>
            </Box>

            {/* ── BODY ROW ─────────────────────────────────────────────────── */}
            <Box
                sx={{
                    display: "flex",
                    flex: 1,
                    position: "relative",
                    zIndex: 1,
                    pb: "16px",
                    minHeight: 0,
                }}
            >
                {/* Left edge: rotated "Printed Date" */}
                <Box
                    sx={{
                        width: "30px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        ml: "4px",
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: "11px",
                            color: "#6b7280",
                            fontWeight: 500,
                            whiteSpace: "nowrap",
                            transform: "rotate(-90deg)",
                            letterSpacing: "0.4px",
                        }}
                    >
                        Printed Date: {new Date().toLocaleDateString("en-GB")}
                    </Typography>
                </Box>

                {/* Photo frame: 305 × 346 px */}
                <Box
                    sx={{
                        width: `${PHOTO_W}px`,
                        display: "flex",
                        flexDirection: "column",
                        flexShrink: 0,
                        pr: "20px",
                    }}
                >
                    <Box
                        component="img"
                        src={student.photo || "https://placehold.co/305x346/e5e7eb/9ca3af?text=PHOTO"}
                        alt="Student Photo"
                        sx={{
                            width: `${PHOTO_W}px`,
                            height: `${PHOTO_H}px`,
                            objectFit: "cover",
                            objectPosition: "top",
                            display: "block",
                            flexShrink: 0,
                        }}
                    />

                    {/* Barcode */}
                    <Box
                        sx={{
                            mt: "10px",
                            width: "100%",
                            height: "50px",
                            backgroundImage:
                                "repeating-linear-gradient(90deg," +
                                "#000 0,#000 1px,transparent 1px,transparent 2px," +
                                "#000 2px,#000 4px,transparent 4px,transparent 5px," +
                                "#000 5px,#000 7px,transparent 7px,transparent 9px," +
                                "#000 9px,#000 10px,transparent 10px,transparent 12px," +
                                "#000 12px,#000 15px,transparent 15px,transparent 17px)",
                            flexShrink: 0,
                        }}
                    />
                    <Typography
                        sx={{
                            textAlign: "center",
                            fontSize: "12px",
                            fontWeight: 700,
                            fontFamily: "monospace",
                            color: "#111827",
                            mt: "4px",
                            letterSpacing: "2px",
                        }}
                    >
                        {student.schoolId || student.id.slice(0, 9).toUpperCase()}
                    </Typography>
                </Box>

                {/* Data fields */}
                <Box
                    sx={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        gap: "18px",
                        pr: "36px",
                        pl: "8px",
                    }}
                >
                    {/* Name field: label = 20pt, value = 25pt */}
                    <Box>
                        <Typography
                            sx={{ fontSize: FIELD_LABEL_FS, color: "#6b7280", fontWeight: 400, lineHeight: 1, mb: "4px" }}
                        >
                            First, Middle, Surname
                        </Typography>
                        <Typography
                            sx={{ fontSize: STUDENT_NAME_FS, fontWeight: 700, color: "#111827", lineHeight: 1.2 }}
                        >
                            {student.fullName || "—"}
                        </Typography>
                    </Box>

                    {/* Remaining fields */}
                    {[
                        { label: "Date of Birth",        value: student.dateOfBirth },
                        { label: "Sex",                  value: student.sex },
                        { label: "Country of Citizenship", value: student.nationality },
                        { label: "School Name",          value: student.schoolName },
                    ].map(({ label, value }) => (
                        <Box key={label}>
                            <Typography
                                sx={{ fontSize: FIELD_LABEL_FS, color: "#6b7280", fontWeight: 400, lineHeight: 1, mb: "4px" }}
                            >
                                {label}
                            </Typography>
                            <Typography
                                sx={{ fontSize: FIELD_VALUE_FS, fontWeight: 700, color: "#111827", lineHeight: 1.2 }}
                            >
                                {value || "—"}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    );
}

// ─── CARD BACK (1013 × 638 px) ───────────────────────────────────────────────
export function StudentCardBack({
    student,
    qrCodeUrl,
}: {
    student: StudentCardData;
    qrCodeUrl: string;
}) {
    return (
        <Box
            id="student-card-back"
            sx={{
                width: CARD_W,
                height: CARD_H,
                bgcolor: "#ffffff",
                borderRadius: "18px",
                overflow: "hidden",
                boxShadow: "0 8px 40px rgba(0,0,0,0.22)",
                position: "relative",
                fontFamily: "'Inter','Helvetica Neue',Arial,sans-serif",
                border: "1px solid #d1d5db",
                display: "flex",
                flexDirection: "column",
                flexShrink: 0,
            }}
        >
            {/* ── Watermark: Official crest (brownish, left side) ──────────── */}
            <Box
                component="img"
                src={officialCrest}
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "-4%",
                    transform: "translateY(-50%)",
                    width: "48%",
                    height: "100%",
                    objectFit: "contain",
                    objectPosition: "left center",
                    opacity: 0.28,
                    filter: "sepia(0.9) saturate(2) brightness(1.05)",
                    pointerEvents: "none",
                    zIndex: 0,
                }}
            />

            {/* ── BODY ─────────────────────────────────────────────────────── */}
            <Box
                sx={{
                    display: "flex",
                    flex: 1,
                    position: "relative",
                    zIndex: 1,
                    pt: "32px",
                    pb: "0px",
                    minHeight: 0,
                }}
            >
                {/* ── Left column: data fields + IIN box ────────────────────── */}
                <Box
                    sx={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        pl: "42px",
                        pr: "20px",
                        justifyContent: "space-between",
                        pb: "20px",
                    }}
                >
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                        {[
                            { label: "Date of Issue",   value: student.dateOfIssue },
                            { label: "Date of Expiry",  value: student.dateOfExpiry },
                            { label: "Phone Number",    value: student.phoneNumber },
                            { label: "City/Region",     value: student.cityRegion },
                            { label: "School Address",  value: student.schoolAddress },
                        ].map(({ label, value }) => (
                            <Box key={label}>
                                <Typography
                                    sx={{
                                        fontSize: FIELD_LABEL_FS,
                                        color: "#6b7280",
                                        fontWeight: 400,
                                        lineHeight: 1,
                                        mb: "3px",
                                    }}
                                >
                                    {label}
                                </Typography>
                                <Typography
                                    sx={{
                                        fontSize: BACK_VALUE_FS,
                                        fontWeight: 800,
                                        color: "#111827",
                                        lineHeight: 1.2,
                                        letterSpacing: "-0.2px",
                                    }}
                                >
                                    {value || "—"}
                                </Typography>
                            </Box>
                        ))}
                    </Box>

                    {/* IIN box — 389 × 53 px */}
                    <Box
                        sx={{
                            width: `${IIN_W}px`,
                            height: `${IIN_H}px`,
                            bgcolor: "#e5e7eb",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            px: "20px",
                            gap: "14px",
                            mt: "12px",
                            flexShrink: 0,
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: "20px",
                                fontWeight: 900,
                                color: "#374151",
                                letterSpacing: "4px",
                                fontFamily: "monospace",
                                lineHeight: 1,
                            }}
                        >
                            IIN
                        </Typography>
                        <Typography
                            sx={{
                                fontSize: "22px",
                                fontWeight: 900,
                                fontFamily: "monospace",
                                color: "#111827",
                                letterSpacing: "4px",
                                lineHeight: 1,
                            }}
                        >
                            {student.iin || "—"}
                        </Typography>
                    </Box>
                </Box>

                {/* ── Right column: QR code — bg 467 × 487 px, qr 431 × 446 px */}
                <Box
                    sx={{
                        width: `${QR_BG_W}px`,
                        height: `${QR_BG_H}px`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        border: "1px solid #d1d5db",
                        bgcolor: "#ffffff",
                        mr: "28px",
                        alignSelf: "flex-start",
                    }}
                >
                    {qrCodeUrl ? (
                        <Box
                            component="img"
                            src={qrCodeUrl}
                            alt="QR Code"
                            sx={{
                                width: `${QR_W}px`,
                                height: `${QR_H}px`,
                                imageRendering: "pixelated",
                            }}
                        />
                    ) : (
                        <Box
                            sx={{
                                width: `${QR_W}px`,
                                height: `${QR_H}px`,
                                bgcolor: "#f3f4f6",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Typography sx={{ fontSize: "13px", color: "#9ca3af" }}>
                                Loading QR…
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Box>

            {/* ── FOOTER ───────────────────────────────────────────────────── */}
            <Box
                sx={{
                    py: "10px",
                    px: "32px",
                    textAlign: "center",
                    borderTop: "1px solid #f3f4f6",
                    flexShrink: 0,
                    zIndex: 1,
                    position: "relative",
                }}
            >
                <Typography
                    sx={{
                        fontSize: FOOTER_FS,
                        color: "#6b7280",
                        fontWeight: 400,
                        lineHeight: 1.4,
                    }}
                >
                    if you find this card, please return to the issuing organization (vmp.gov.kz) or to the nearest police station
                </Typography>
            </Box>
        </Box>
    );
}

// ─── Dialog wrapper ───────────────────────────────────────────────────────────
export default function DigitalStudentCard({ open, onClose, student }: DigitalStudentCardProps) {
    const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        if (student.qrData || student.id) {
            const dataToEncode = student.qrData || `CARD-${student.id}`;
            QRCode.toDataURL(dataToEncode, {
                width: QR_W,
                margin: 1,
                errorCorrectionLevel: "H",
                color: { dark: "#000000", light: "#ffffff" },
            })
                .then(setQrCodeUrl)
                .catch(console.error);
        }
    }, [student.qrData, student.id]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={false}
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    boxShadow: "none",
                    bgcolor: "transparent",
                    overflow: "visible",
                },
            }}
        >
            <Box sx={{ position: "relative" }}>
                {/* Close button */}
                <IconButton
                    onClick={onClose}
                    sx={{
                        position: "absolute",
                        right: -16,
                        top: -16,
                        zIndex: 10,
                        bgcolor: "white",
                        boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
                        "&:hover": { bgcolor: "#f9fafb" },
                    }}
                >
                    <CloseIcon />
                </IconButton>

                <DialogContent sx={{ p: 0, overflow: "visible" }}>
                    {/* Cards side-by-side on dark backdrop */}
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: { xs: "column", lg: "row" },
                            gap: "40px",
                            p: "52px",
                            bgcolor: "#1c1c1e",
                            borderRadius: "16px",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <StudentCardFront student={student} />
                        <StudentCardBack student={student} qrCodeUrl={qrCodeUrl} />
                    </Box>

                    {/* Action bar */}
                    <Box
                        sx={{
                            p: "18px",
                            textAlign: "center",
                            bgcolor: "#1c1c1e",
                            borderTop: "1px solid #333",
                            borderRadius: "0 0 16px 16px",
                            display: "flex",
                            justifyContent: "center",
                            gap: 2,
                            flexWrap: "wrap",
                        }}
                    >
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => enqueueSnackbar("Apple Wallet .pkpass payload generated and signed successfully. Pass added to Wallet.", { variant: "success" })}
                            sx={{
                                borderRadius: 3,
                                bgcolor: "#000",
                                color: "#fff",
                                border: "1px solid #333",
                                textTransform: "none",
                                fontWeight: 700,
                                px: 4,
                                "&:hover": { bgcolor: "#111", borderColor: "#555" },
                            }}
                        >
                            Add to Apple Wallet
                        </Button>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => enqueueSnackbar("Google Pay digital pass generated and saved to your device.", { variant: "success" })}
                            sx={{
                                borderRadius: 3,
                                bgcolor: "#ffffff",
                                color: "#000000",
                                border: "1px solid #e5e7eb",
                                textTransform: "none",
                                fontWeight: 700,
                                px: 4,
                                "&:hover": { bgcolor: "#f3f4f6" },
                            }}
                        >
                            Add to Google Pay
                        </Button>
                        <Button
                            variant="outlined"
                            size="large"
                            onClick={onClose}
                            sx={{
                                px: 4,
                                borderRadius: 3,
                                color: "#fff",
                                borderColor: "#555",
                                textTransform: "none",
                                fontWeight: 700,
                                "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,0.05)" },
                            }}
                        >
                            Close
                        </Button>
                    </Box>
                </DialogContent>
            </Box>
        </Dialog>
    );
}