import { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Alert,
    LinearProgress
} from "@mui/material";
import { CloudUpload as CloudUploadIcon } from "@mui/icons-material";
import Papa from "papaparse";

interface BulkImportModalProps {
    open: boolean;
    onClose: () => void;
    onImport: (data: any[]) => Promise<void>;
}

export function BulkImportModal({ open, onClose, onImport }: BulkImportModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [isParsing, setIsParsing] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile?.type === "text/csv" || droppedFile?.name.endsWith(".csv")) {
            processFile(droppedFile);
        } else {
            setError("Please upload a valid CSV file.");
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) processFile(selectedFile);
    };

    const processFile = (file: File) => {
        setFile(file);
        setError(null);
        setIsParsing(true);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                setIsParsing(false);
                if (results.errors.length > 0) {
                    setError(`Error parsing CSV: ${results.errors[0].message}`);
                    return;
                }

                // Validate required columns
                const required = ['first_name', 'last_name', 'email', 'passport_number', 'date_of_birth', 'nationality'];
                const headers = results.meta.fields || [];
                const missing = required.filter(h => !headers.includes(h));

                if (missing.length > 0) {
                    setError(`Missing required columns: ${missing.join(', ')}`);
                    setPreviewData([]);
                } else {
                    setPreviewData(results.data);
                }
            },
            error: (err) => {
                setIsParsing(false);
                setError(err.message);
            }
        });
    };

    const handleConfirm = async () => {
        if (previewData.length === 0) return;
        setIsImporting(true);
        setError(null);
        try {
            await onImport(previewData);
            handleClose();
        } catch (err: any) {
            setError(err.message || "Failed to import students");
        } finally {
            setIsImporting(false);
        }
    };

    const handleClose = () => {
        setFile(null);
        setPreviewData([]);
        setError(null);
        onClose();
    };

    return (
        <Dialog open={open} onClose={isImporting ? undefined : handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Bulk Import Students</DialogTitle>
            <DialogContent dividers>
                {!file && (
                    <Box
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleFileDrop}
                        sx={{
                            border: '2px dashed #cbd5e1',
                            borderRadius: 2,
                            p: 4,
                            textAlign: 'center',
                            cursor: 'pointer',
                            bgcolor: '#f8fafc',
                            '&:hover': { bgcolor: '#f1f5f9' },
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: 200
                        }}
                        // @ts-ignore
                        component="label"
                    >
                        <input
                            type="file"
                            accept=".csv"
                            style={{ display: 'none' }}
                            onChange={handleFileSelect}
                        />
                        <CloudUploadIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 1 }} />
                        <Typography variant="h6" color="text.secondary">
                            Drag and drop your CSV here
                        </Typography>
                        <Typography variant="body2" color="text.disabled" mt={1}>
                            Required columns: first_name, last_name, email, passport_number, date_of_birth, nationality
                        </Typography>
                    </Box>
                )}

                {isParsing && <LinearProgress sx={{ mt: 2 }} />}

                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

                {file && !isParsing && !error && previewData.length > 0 && (
                    <Box>
                        <Alert severity="success" sx={{ mb: 2 }}>
                            Ready to import {previewData.length} students!
                        </Alert>
                        <Typography variant="body2" color="text.secondary">
                            File: {file.name}
                        </Typography>
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={handleClose} disabled={isImporting}>Cancel</Button>
                <Button
                    variant="contained"
                    onClick={handleConfirm}
                    disabled={previewData.length === 0 || isImporting || !!error}
                >
                    {isImporting ? 'Importing...' : `Import ${previewData.length || ''} Students`}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
