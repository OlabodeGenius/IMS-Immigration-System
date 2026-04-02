import { useState, useCallback } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Box, Typography, Alert, LinearProgress,
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Stack, Chip, IconButton,
    Tooltip, Divider, alpha
} from "@mui/material";
import {
    CloudUpload as UploadIcon,
    Download as DownloadIcon,
    CheckCircle as CheckIcon,
    Warning as WarnIcon,
    Close as CloseIcon,
    School as SchoolIcon,
} from "@mui/icons-material";
import Papa from "papaparse";
import { useBulkAttendance } from "../../../hooks/useAttendance";
import { supabase } from "../../../lib/supabaseClient";

// ─── Types ─────────────────────────────────────────────────────────────────

interface RawRow {
    student_id_number: string;
    subject_code: string;
    subject_name: string;
    date: string;
    status: string;
    notes?: string;
}

interface ParsedRow {
    raw: RawRow;
    student_id?: string;        // resolved uuid
    student_name?: string;
    status: 'ok' | 'error';
    error?: string;
}

const REQUIRED_COLUMNS = [
    'student_id_number',
    'subject_code',
    'subject_name',
    'date',
    'status',
];

const VALID_STATUSES = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];

// ─── Template CSV ──────────────────────────────────────────────────────────

const TEMPLATE_CSV = `student_id_number,subject_code,subject_name,date,status,notes
STU-001,CS101,Introduction to Programming,2026-03-25,PRESENT,
STU-002,CS101,Introduction to Programming,2026-03-25,ABSENT,Medical leave
STU-001,MATH201,Calculus II,2026-03-25,LATE,
`;

function downloadTemplate() {
    const blob = new Blob([TEMPLATE_CSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "attendance_template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ─── Component ─────────────────────────────────────────────────────────────

interface AttendanceUploadModalProps {
    open: boolean;
    onClose: () => void;
    institutionId?: string;
}

export function AttendanceUploadModal({ open, onClose, institutionId }: AttendanceUploadModalProps) {
    const [rows, setRows] = useState<ParsedRow[]>([]);
    const [isParsing, setIsParsing] = useState(false);
    const [parseError, setParseError] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const { mutateAsync: bulkInsert, isPending: isImporting } = useBulkAttendance();
    const [importResult, setImportResult] = useState<{ inserted: number } | null>(null);

    const okRows = rows.filter(r => r.status === 'ok');
    const errorRows = rows.filter(r => r.status === 'error');

    const reset = () => {
        setRows([]);
        setParseError(null);
        setFileName(null);
        setImportResult(null);
    };

    const handleClose = () => {
        if (isImporting) return;
        reset();
        onClose();
    };

    // ── Resolve student UUIDs from student_id_number ────────────────────
    const resolveStudents = async (rawRows: RawRow[]): Promise<ParsedRow[]> => {
        const uniqueIds = [...new Set(rawRows.map(r => r.student_id_number))];

        // Fetch all at once
        let query = supabase
            .from("students")
            .select("id, student_id_number, full_name");

        if (institutionId) {
            query = query.eq("institution_id", institutionId);
        }

        const { data: students, error } = await query.in("student_id_number", uniqueIds);

        if (error) throw error;

        const lookup = new Map<string, { id: string; name: string }>();
        students?.forEach(s => lookup.set(s.student_id_number, { id: s.id, name: s.full_name }));

        return rawRows.map(raw => {
            const found = lookup.get(raw.student_id_number);
            if (!found) {
                return {
                    raw,
                    status: 'error' as const,
                    error: `Student "${raw.student_id_number}" not found`,
                };
            }
            if (!VALID_STATUSES.includes(raw.status?.toUpperCase())) {
                return {
                    raw,
                    status: 'error' as const,
                    student_id: found.id,
                    student_name: found.name,
                    error: `Invalid status "${raw.status}" — must be PRESENT, ABSENT, LATE, or EXCUSED`,
                };
            }
            if (!raw.date || isNaN(Date.parse(raw.date))) {
                return {
                    raw,
                    status: 'error' as const,
                    student_id: found.id,
                    student_name: found.name,
                    error: `Invalid date "${raw.date}"`,
                };
            }
            return {
                raw,
                student_id: found.id,
                student_name: found.name,
                status: 'ok' as const,
            };
        });
    };

    const processFile = useCallback(async (file: File) => {
        setIsParsing(true);
        setParseError(null);
        setRows([]);
        setFileName(file.name);
        setImportResult(null);

        Papa.parse<RawRow>(file, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (h) => h.trim().toLowerCase(),
            complete: async (results) => {
                const missing = REQUIRED_COLUMNS.filter(c => !results.meta.fields?.includes(c));
                if (missing.length > 0) {
                    setParseError(`Missing required columns: ${missing.join(", ")}`);
                    setIsParsing(false);
                    return;
                }

                try {
                    const resolved = await resolveStudents(results.data);
                    setRows(resolved);
                } catch (err: any) {
                    setParseError(err.message || "Failed to look up students");
                } finally {
                    setIsParsing(false);
                }
            },
            error: (err) => {
                setParseError(err.message);
                setIsParsing(false);
            },
        });
    }, [institutionId]);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) processFile(f);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const f = e.dataTransfer.files[0];
        if (f) processFile(f);
    };

    const handleImport = async () => {
        const payload = okRows.map(r => ({
            student_id: r.student_id!,
            attendance_date: r.raw.date,
            status: r.raw.status.toUpperCase() as any,
            notes: r.raw.notes || undefined,
            subject_code: r.raw.subject_code,
            subject_name: r.raw.subject_name,
        }));

        await bulkInsert(payload);
        setImportResult({ inserted: payload.length });
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
            <DialogTitle sx={{ pb: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <SchoolIcon color="primary" />
                        <Typography variant="h6" fontWeight={800}>Upload Attendance Sheet</Typography>
                    </Stack>
                    <IconButton onClick={handleClose} size="small"><CloseIcon /></IconButton>
                </Stack>
            </DialogTitle>
            <Divider />

            <DialogContent sx={{ pt: 3 }}>
                {/* Success state */}
                {importResult ? (
                    <Box textAlign="center" py={6}>
                        <CheckIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                        <Typography variant="h5" fontWeight={800} mb={1}>
                            Import Complete!
                        </Typography>
                        <Typography color="text.secondary">
                            {importResult.inserted.toLocaleString()} attendance records were successfully saved.
                        </Typography>
                    </Box>
                ) : (
                    <>
                        {/* Header row: info + template download */}
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
                            <Box>
                                <Typography variant="body2" color="text.secondary" maxWidth={560}>
                                    Upload a CSV file exported from your university's LMS or prepared manually.
                                    Each row represents one student's attendance per subject per day.
                                </Typography>
                            </Box>
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<DownloadIcon />}
                                onClick={downloadTemplate}
                                sx={{ flexShrink: 0, ml: 2, borderRadius: 2, fontWeight: 700 }}
                            >
                                Download Template
                            </Button>
                        </Stack>

                        {/* Drop zone — only shown before file is loaded */}
                        {!fileName && (
                            <Box
                                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={handleDrop}
                                component="label"
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 1.5,
                                    minHeight: 200,
                                    border: '2px dashed',
                                    borderColor: isDragging ? 'primary.main' : '#CBD5E1',
                                    borderRadius: 3,
                                    bgcolor: isDragging ? alpha('#3B82F6', 0.05) : '#F8FAFC',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    '&:hover': { borderColor: 'primary.light', bgcolor: alpha('#3B82F6', 0.03) },
                                    mb: 2,
                                }}
                            >
                                <input type="file" accept=".csv" hidden onChange={handleFileInput} />
                                <UploadIcon sx={{ fontSize: 48, color: isDragging ? 'primary.main' : '#94A3B8' }} />
                                <Typography fontWeight={700} color={isDragging ? 'primary.main' : 'text.secondary'}>
                                    {isDragging ? 'Drop to upload' : 'Drag & drop your CSV here, or click to browse'}
                                </Typography>
                                <Typography variant="caption" color="text.disabled">
                                    Required columns: {REQUIRED_COLUMNS.join(', ')}
                                </Typography>
                            </Box>
                        )}

                        {isParsing && (
                            <Box mb={2}>
                                <Typography variant="body2" color="text.secondary" mb={1}>Resolving students…</Typography>
                                <LinearProgress />
                            </Box>
                        )}

                        {parseError && <Alert severity="error" sx={{ mb: 2 }}>{parseError}</Alert>}

                        {/* Preview */}
                        {rows.length > 0 && !isParsing && (
                            <Box>
                                <Stack direction="row" spacing={2} mb={2} alignItems="center">
                                    <Typography variant="subtitle1" fontWeight={800}>
                                        Preview — {fileName}
                                    </Typography>
                                    <Chip
                                        icon={<CheckIcon />}
                                        label={`${okRows.length} valid`}
                                        size="small"
                                        color="success"
                                        variant="outlined"
                                    />
                                    {errorRows.length > 0 && (
                                        <Chip
                                            icon={<WarnIcon />}
                                            label={`${errorRows.length} errors`}
                                            size="small"
                                            color="error"
                                            variant="outlined"
                                        />
                                    )}
                                    <Button
                                        size="small"
                                        variant="text"
                                        startIcon={<UploadIcon />}
                                        component="label"
                                        sx={{ ml: 'auto', fontWeight: 700 }}
                                    >
                                        Change file
                                        <input type="file" accept=".csv" hidden onChange={handleFileInput} />
                                    </Button>
                                </Stack>

                                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, maxHeight: 360 }}>
                                    <Table stickyHeader size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Student</TableCell>
                                                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Student ID</TableCell>
                                                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Subject</TableCell>
                                                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Date</TableCell>
                                                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</TableCell>
                                                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Notes</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {rows.map((row, i) => (
                                                <Tooltip
                                                    key={i}
                                                    title={row.error || ''}
                                                    placement="top-start"
                                                    disableHoverListener={!row.error}
                                                >
                                                    <TableRow sx={{
                                                        bgcolor: row.status === 'error' ? alpha('#EF4444', 0.06) : 'transparent',
                                                        '&:hover': { bgcolor: row.status === 'error' ? alpha('#EF4444', 0.1) : '#F8FAFC' }
                                                    }}>
                                                        <TableCell>
                                                            <Stack direction="row" spacing={1} alignItems="center">
                                                                {row.status === 'error' && <WarnIcon sx={{ fontSize: 16, color: 'error.main' }} />}
                                                                <Typography variant="body2" fontWeight={600}>
                                                                    {row.student_name || row.raw.student_id_number}
                                                                </Typography>
                                                            </Stack>
                                                            {row.error && (
                                                                <Typography variant="caption" color="error.main">{row.error}</Typography>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2" color="text.secondary">{row.raw.student_id_number}</Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2" fontWeight={600}>{row.raw.subject_code}</Typography>
                                                            <Typography variant="caption" color="text.secondary">{row.raw.subject_name}</Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2">{row.raw.date}</Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={row.raw.status?.toUpperCase()}
                                                                size="small"
                                                                sx={{
                                                                    fontWeight: 700,
                                                                    fontSize: '0.7rem',
                                                                    bgcolor:
                                                                        row.raw.status?.toUpperCase() === 'PRESENT' ? alpha('#10B981', 0.12) :
                                                                        row.raw.status?.toUpperCase() === 'ABSENT' ? alpha('#EF4444', 0.12) :
                                                                        row.raw.status?.toUpperCase() === 'LATE' ? alpha('#F59E0B', 0.12) :
                                                                        alpha('#6B7280', 0.12),
                                                                    color:
                                                                        row.raw.status?.toUpperCase() === 'PRESENT' ? '#10B981' :
                                                                        row.raw.status?.toUpperCase() === 'ABSENT' ? '#EF4444' :
                                                                        row.raw.status?.toUpperCase() === 'LATE' ? '#F59E0B' : '#6B7280',
                                                                }}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="caption" color="text.secondary">{row.raw.notes || '—'}</Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                </Tooltip>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>
                        )}
                    </>
                )}
            </DialogContent>

            <Divider />
            <DialogActions sx={{ px: 3, py: 2 }}>
                {importResult ? (
                    <Button variant="contained" onClick={handleClose} sx={{ borderRadius: 2, fontWeight: 700 }}>
                        Done
                    </Button>
                ) : (
                    <>
                        <Button onClick={handleClose} disabled={isImporting} sx={{ fontWeight: 700 }}>Cancel</Button>
                        <Button
                            variant="contained"
                            onClick={handleImport}
                            disabled={okRows.length === 0 || isImporting || isParsing}
                            sx={{ borderRadius: 2, fontWeight: 800, px: 4 }}
                        >
                            {isImporting
                                ? `Importing ${okRows.length} records…`
                                : `Import ${okRows.length} Valid Records`}
                        </Button>
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
}
