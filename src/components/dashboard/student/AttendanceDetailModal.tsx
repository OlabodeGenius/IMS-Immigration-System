import {
    Dialog, DialogTitle, DialogContent, IconButton,
    Box, Typography, Stack, Chip, Table, TableBody,
    TableCell, TableHead, TableRow, LinearProgress,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { format, parseISO, startOfMonth, endOfMonth } from "date-fns";

interface AttendanceRecord {
    date: string;
    status: "PRESENT" | "ABSENT" | "LATE" | string;
    subject?: string;
    hours?: number;
}

interface AttendanceDetailModalProps {
    open: boolean;
    onClose: () => void;
    attendance: AttendanceRecord[];
    studentName: string;
}

const statusColor = (s: string) => {
    switch (s?.toUpperCase()) {
        case "PRESENT": return "success";
        case "ABSENT":  return "error";
        case "LATE":    return "warning";
        default:        return "default";
    }
};

export default function AttendanceDetailModal({
    open, onClose, attendance, studentName,
}: AttendanceDetailModalProps) {
    // Group by month
    const byMonth = attendance.reduce<Record<string, AttendanceRecord[]>>((acc, r) => {
        try {
            const key = format(parseISO(r.date), "MMMM yyyy");
            (acc[key] ??= []).push(r);
        } catch {}
        return acc;
    }, {});

    const months = Object.keys(byMonth).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    // Overall stats
    const total   = attendance.length;
    const present = attendance.filter(r => r.status?.toUpperCase() === "PRESENT").length;
    const absent  = attendance.filter(r => r.status?.toUpperCase() === "ABSENT").length;
    const late    = attendance.filter(r => r.status?.toUpperCase() === "LATE").length;
    const pct     = total > 0 ? Math.round((present / total) * 100) : 0;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
                <Box>
                    <Typography fontWeight={900} fontSize="1.1rem">Attendance Breakdown</Typography>
                    <Typography variant="caption" color="text.secondary">{studentName}</Typography>
                </Box>
                <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
            </DialogTitle>

            <DialogContent dividers>
                {/* Summary bar */}
                <Box sx={{ bgcolor: "background.default", p: 2.5, borderRadius: 3, mb: 3, border: "1px solid", borderColor: "divider" }}>
                    <Stack direction="row" spacing={3} flexWrap="wrap" mb={2}>
                        {[
                            { label: "Total Classes", value: total,   color: "#64748B" },
                            { label: "Present",        value: present, color: "#22c55e" },
                            { label: "Absent",         value: absent,  color: "#ef4444" },
                            { label: "Late",           value: late,    color: "#f59e0b" },
                            { label: "Rate",           value: `${pct}%`, color: pct >= 75 ? "#22c55e" : "#ef4444" },
                        ].map(s => (
                            <Box key={s.label} textAlign="center" minWidth={70}>
                                <Typography fontWeight={900} fontSize="1.4rem" color={s.color}>{s.value}</Typography>
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>{s.label}</Typography>
                            </Box>
                        ))}
                    </Stack>
                    <Box>
                        <Stack direction="row" justifyContent="space-between" mb={0.5}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary">Attendance Rate</Typography>
                            <Typography variant="caption" fontWeight={900} color={pct >= 75 ? "success.main" : "error.main"}>{pct}%</Typography>
                        </Stack>
                        <LinearProgress
                            variant="determinate"
                            value={pct}
                            color={pct >= 75 ? "success" : "error"}
                            sx={{ height: 8, borderRadius: 4 }}
                        />
                    </Box>
                </Box>

                {/* Monthly breakdown */}
                {attendance.length === 0 ? (
                    <Typography color="text.secondary" textAlign="center" py={4}>No attendance records found.</Typography>
                ) : (
                    months.map(month => (
                        <Box key={month} mb={3}>
                            <Typography fontWeight={800} fontSize="0.85rem" color="text.secondary"
                                sx={{ textTransform: "uppercase", letterSpacing: 1, mb: 1 }}>
                                {month}
                            </Typography>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ "& th": { fontWeight: 800, fontSize: "0.75rem", color: "text.secondary", border: "none" } }}>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Subject</TableCell>
                                        <TableCell align="right">Hours</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {byMonth[month]
                                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                        .map((r, i) => (
                                        <TableRow key={i} sx={{ "&:last-child td": { border: "none" } }}>
                                            <TableCell sx={{ fontWeight: 600, fontSize: "0.85rem" }}>
                                                {format(parseISO(r.date), "EEE d MMM")}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={r.status}
                                                    size="small"
                                                    color={statusColor(r.status) as any}
                                                    sx={{ fontWeight: 700, fontSize: "0.72rem" }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ fontSize: "0.85rem", color: "text.secondary" }}>
                                                {r.subject || "—"}
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontSize: "0.85rem", fontWeight: 600 }}>
                                                {r.hours ?? "—"}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    ))
                )}
            </DialogContent>
        </Dialog>
    );
}
