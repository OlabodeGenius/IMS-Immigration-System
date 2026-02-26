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
import officialCrest from "../assets/official_crest.png";

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

// ─── CARD FRONT ──────────────────────────────────────────────────────────────
// White card. KZ Map watermark covers whole card (cyan). Sun/eagle crest on right (golden).
// Top row: KZ flag | title | school logo. Below: vertical date label + photo + barcode | data fields.
export function StudentCardFront({ student }: { student: StudentCardData }) {
    const schoolLogo = getSchoolLogo(student.schoolName, student.schoolLogo);

    return (
        <Box
            id="student-card-front"
            sx={{
                width: 656,
                height: 440,
                bgcolor: "#ffffff",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                position: "relative",
                fontFamily: "'Inter','Helvetica Neue',Arial,sans-serif",
                border: "1px solid #e5e7eb",
                display: "flex",
                flexDirection: "column",
            }}
        >
            {/* ── Watermark 1: Kazakhstan map (cyan tint, covers whole card) */}
            <Box
                component="img"
                src={kzMapBackground}
                sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center",
                    opacity: 0.12,
                    filter: "hue-rotate(170deg) saturate(1.6) brightness(0.9)",
                    pointerEvents: "none",
                    zIndex: 0,
                }}
            />

            {/* ── Watermark 2: Official sun/eagle crest (golden, right half only) */}
            <Box
                component="img"
                src={officialCrest}
                sx={{
                    position: "absolute",
                    top: "48%",
                    right: "-6%",
                    transform: "translateY(-50%)",
                    width: "54%",
                    height: "90%",
                    objectFit: "contain",
                    opacity: 0.18,
                    filter: "sepia(1) saturate(5) hue-rotate(8deg) brightness(1.5)",
                    pointerEvents: "none",
                    zIndex: 0,
                }}
            />

            {/* ── Header Row: KZ flag | Title | School logo ──────────────────── */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    px: "28px",
                    pt: "20px",
                    pb: "14px",
                    gap: "16px",
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
                    sx={{ width: 72, height: "auto", objectFit: "contain", flexShrink: 0 }}
                />

                {/* Title */}
                <Box sx={{ flex: 1, textAlign: "center" }}>
                    <Typography
                        sx={{
                            fontSize: "24px",
                            fontWeight: 800,
                            color: "#1a1a2e",
                            lineHeight: 1.15,
                            letterSpacing: "0.5px",
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
                        minWidth: 72,
                    }}
                >
                    <Box
                        component="img"
                        src={schoolLogo}
                        alt={student.schoolName}
                        sx={{ width: 52, height: 52, objectFit: "contain" }}
                    />
                    <Typography
                        sx={{
                            fontSize: "16px",
                            fontWeight: 900,
                            color: "#1a3a6b",
                            mt: "2px",
                            letterSpacing: "1px",
                        }}
                    >
                        {student.schoolName.toLowerCase().includes("kbtu") ||
                            student.schoolName.toLowerCase().includes("kazakh-british")
                            ? "KBTU"
                            : ""}
                    </Typography>
                </Box>
            </Box>

            {/* ── Body Row ────────────────────────────────────────────────────── */}
            <Box
                sx={{
                    display: "flex",
                    flex: 1,
                    position: "relative",
                    zIndex: 1,
                    pb: "12px",
                }}
            >
                {/* Left edge: Rotated "Printed Date" */}
                <Box
                    sx={{
                        width: "28px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        ml: "4px",
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: "10px",
                            color: "#6b7280",
                            fontWeight: 500,
                            whiteSpace: "nowrap",
                            transform: "rotate(-90deg)",
                            letterSpacing: "0.3px",
                        }}
                    >
                        Printed Date: {new Date().toLocaleDateString("en-GB")}
                    </Typography>
                </Box>

                {/* Photo + barcode */}
                <Box
                    sx={{
                        width: "190px",
                        display: "flex",
                        flexDirection: "column",
                        pr: "14px",
                        flexShrink: 0,
                    }}
                >
                    {/* Passport photo */}
                    <Box
                        component="img"
                        src={student.photo || "https://placehold.co/400x500/e5e7eb/9ca3af?text=PHOTO"}
                        alt="Student Photo"
                        sx={{
                            width: "100%",
                            flex: 1,
                            objectFit: "cover",
                            objectPosition: "top",
                            display: "block",
                            minHeight: 0,
                        }}
                    />

                    {/* Barcode */}
                    <Box
                        sx={{
                            mt: "8px",
                            width: "100%",
                            height: "44px",
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

                    {/* Barcode number */}
                    <Typography
                        sx={{
                            textAlign: "center",
                            fontSize: "11px",
                            fontWeight: 700,
                            fontFamily: "monospace",
                            color: "#111827",
                            mt: "3px",
                            letterSpacing: "1.5px",
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
                        gap: "16px",
                        pr: "28px",
                        pl: "4px",
                    }}
                >
                    {[
                        { label: "First, Middle, Surname", value: student.fullName, valueFontSize: "20px" },
                        { label: "Date of Birth", value: student.dateOfBirth, valueFontSize: "20px" },
                        { label: "Sex", value: student.sex, valueFontSize: "20px" },
                        { label: "Country of Citizenship", value: student.nationality, valueFontSize: "20px" },
                        { label: "School Name", value: student.schoolName, valueFontSize: "18px" },
                    ].map(({ label, value, valueFontSize }) => (
                        <Box key={label}>
                            <Typography
                                sx={{
                                    fontSize: "12px",
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
                                    fontSize: valueFontSize,
                                    fontWeight: 700,
                                    color: "#111827",
                                    lineHeight: 1.2,
                                }}
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

// ─── CARD BACK ───────────────────────────────────────────────────────────────
// White card. NO header. Official crest watermark = large, brownish-visible, left side.
// Left: data fields + IIN box. Right: large QR code. Bottom: footer text bar.
function StudentCardBack({
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
                width: 656,
                height: 440,
                bgcolor: "#ffffff",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                position: "relative",
                fontFamily: "'Inter','Helvetica Neue',Arial,sans-serif",
                border: "1px solid #e5e7eb",
                display: "flex",
                flexDirection: "column",
            }}
        >
            {/* ── Watermark: Official crest, large brownish, LEFT side */}
            <Box
                component="img"
                src={officialCrest}
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "-4%",
                    transform: "translateY(-50%)",
                    width: "55%",
                    height: "100%",
                    objectFit: "contain",
                    objectPosition: "left center",
                    opacity: 0.28,
                    // The golden-brownish tint visible in back image reference
                    filter: "sepia(0.9) saturate(2) brightness(1.05)",
                    pointerEvents: "none",
                    zIndex: 0,
                }}
            />

            {/* ── Body ─────────────────────────────────────────────────────── */}
            <Box
                sx={{
                    display: "flex",
                    flex: 1,
                    position: "relative",
                    zIndex: 1,
                    pt: "28px",
                    pb: "0px",
                }}
            >
                {/* Left column: data fields + IIN box */}
                <Box
                    sx={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        pl: "36px",
                        pr: "24px",
                        justifyContent: "space-between",
                        pb: "16px",
                    }}
                >
                    <Box sx={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        {[
                            { label: "Date of Issue", value: student.dateOfIssue },
                            { label: "Date of Expiry", value: student.dateOfExpiry },
                            { label: "Phone Number", value: student.phoneNumber },
                            { label: "City/Region", value: student.cityRegion },
                            { label: "School Address", value: student.schoolAddress },
                        ].map(({ label, value }) => (
                            <Box key={label}>
                                <Typography
                                    sx={{
                                        fontSize: "13px",
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
                                        fontSize: "22px",
                                        fontWeight: 800,
                                        color: "#111827",
                                        lineHeight: 1.2,
                                        letterSpacing: "-0.3px",
                                    }}
                                >
                                    {value || "—"}
                                </Typography>
                            </Box>
                        ))}
                    </Box>

                    {/* IIN box */}
                    <Box
                        sx={{
                            bgcolor: "#e5e7eb",
                            borderRadius: "8px",
                            px: "20px",
                            py: "12px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "12px",
                            mt: "16px",
                            alignSelf: "flex-start",
                            minWidth: "260px",
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: "20px",
                                fontWeight: 900,
                                color: "#374151",
                                letterSpacing: "4px",
                                fontFamily: "monospace",
                            }}
                        >
                            IIN
                        </Typography>
                        <Typography
                            sx={{
                                fontSize: "24px",
                                fontWeight: 900,
                                fontFamily: "monospace",
                                color: "#111827",
                                letterSpacing: "4px",
                            }}
                        >
                            {student.iin || "—"}
                        </Typography>
                    </Box>
                </Box>

                {/* Right column: QR code */}
                <Box
                    sx={{
                        width: "280px",
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "center",
                        flexShrink: 0,
                        pt: "8px",
                        pr: "28px",
                    }}
                >
                    {qrCodeUrl ? (
                        <Box
                            component="img"
                            src={qrCodeUrl}
                            alt="QR Code"
                            sx={{
                                width: "240px",
                                height: "240px",
                                imageRendering: "pixelated",
                                border: "2px solid #d1d5db",
                            }}
                        />
                    ) : (
                        <Box
                            sx={{
                                width: "240px",
                                height: "240px",
                                bgcolor: "#f3f4f6",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                border: "1px solid #e5e7eb",
                            }}
                        >
                            <Typography sx={{ fontSize: "11px", color: "#9ca3af" }}>
                                Loading QR…
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Box>

            {/* ── Footer ───────────────────────────────────────────────────── */}
            <Box
                sx={{
                    py: "8px",
                    px: "28px",
                    textAlign: "center",
                    borderTop: "1px solid #f3f4f6",
                    flexShrink: 0,
                    zIndex: 1,
                    position: "relative",
                }}
            >
                <Typography
                    sx={{
                        fontSize: "10px",
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

    useEffect(() => {
        if (student.qrData || student.id) {
            const dataToEncode = student.qrData || `CARD-${student.id}`;
            QRCode.toDataURL(dataToEncode, {
                width: 480,
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
                        right: -14,
                        top: -14,
                        zIndex: 10,
                        bgcolor: "white",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.18)",
                        "&:hover": { bgcolor: "#f9fafb" },
                    }}
                >
                    <CloseIcon />
                </IconButton>

                <DialogContent sx={{ p: 0, overflow: "visible" }}>
                    {/* Cards side-by-side on a dark backdrop */}
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: { xs: "column", md: "row" },
                            gap: "32px",
                            p: "48px",
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
                            p: "16px",
                            textAlign: "center",
                            bgcolor: "#1c1c1e",
                            borderTop: "1px solid #333",
                            borderRadius: "0 0 16px 16px",
                            display: "flex",
                            justifyContent: "center",
                        }}
                    >
                        <Button
                            variant="outlined"
                            size="large"
                            onClick={onClose}
                            sx={{
                                px: 8,
                                borderRadius: 2,
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