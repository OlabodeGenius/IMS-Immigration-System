import { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Button,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    IconButton,
    CircularProgress,
    Stack,
    Paper
} from "@mui/material";
import {
    InsertDriveFile as FileIcon,
    Delete as DeleteIcon,
    CloudUpload as CloudUploadIcon,
    Visibility as ViewIcon
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { supabase } from "../../../lib/supabaseClient";

interface DocumentManagerProps {
    studentId: string;
}

export function DocumentManager({ studentId }: DocumentManagerProps) {
    const { enqueueSnackbar } = useSnackbar();
    const [files, setFiles] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (studentId) fetchFiles();
    }, [studentId]);

    const fetchFiles = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.storage
                .from("student_documents")
                .list(`${studentId}/`, {
                    limit: 100,
                    offset: 0,
                    sortBy: { column: "created_at", order: "desc" },
                });

            if (error) throw error;
            setFiles(data || []);
        } catch (err: any) {
            enqueueSnackbar(err.message || "Failed to load documents", { variant: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Basic validation: max 5MB, PDF/JPEG/PNG
        if (file.size > 5 * 1024 * 1024) {
            enqueueSnackbar("File must be smaller than 5MB", { variant: "error" });
            return;
        }

        setIsUploading(true);
        const filePath = `${studentId}/${Date.now()}_${file.name}`;

        try {
            const { error } = await supabase.storage
                .from("student_documents")
                .upload(filePath, file);

            if (error) throw error;
            enqueueSnackbar("Document uploaded successfully", { variant: "success" });
            fetchFiles();
        } catch (err: any) {
            enqueueSnackbar(err.message || "Failed to upload document", { variant: "error" });
        } finally {
            setIsUploading(false);
            // Reset input
            event.target.value = '';
        }
    };

    const handleDelete = async (fileName: string) => {
        if (!window.confirm("Are you sure you want to delete this document?")) return;

        try {
            const { error } = await supabase.storage
                .from("student_documents")
                .remove([`${studentId}/${fileName}`]);

            if (error) throw error;
            enqueueSnackbar("Document deleted", { variant: "success" });
            fetchFiles();
        } catch (err: any) {
            enqueueSnackbar(err.message || "Failed to delete document", { variant: "error" });
        }
    };

    const handleView = async (fileName: string) => {
        try {
            const { data, error } = await supabase.storage
                .from("student_documents")
                .createSignedUrl(`${studentId}/${fileName}`, 60 * 60);

            if (error) throw error;
            if (data?.signedUrl) {
                window.open(data.signedUrl, "_blank");
            }
        } catch (err: any) {
            enqueueSnackbar("Failed to open document", { variant: "error" });
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Student Documents</Typography>
                <Button
                    component="label"
                    variant="contained"
                    startIcon={isUploading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
                    disabled={isUploading}
                >
                    {isUploading ? "Uploading..." : "Upload Document"}
                    <input
                        type="file"
                        hidden
                        accept="application/pdf,image/jpeg,image/png"
                        onChange={handleUpload}
                    />
                </Button>
            </Box>

            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : files.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#f8fafc', border: '1px dashed #cbd5e1' }} elevation={0}>
                    <FileIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 1 }} />
                    <Typography color="text.secondary">No documents uploaded yet.</Typography>
                    <Typography variant="caption" color="text.disabled">
                        Upload Passport scans, Visa stickers, or Study Contracts here.
                    </Typography>
                </Paper>
            ) : (
                <List sx={{ bgcolor: 'white', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                    {files.map((file) => (
                        <ListItem
                            key={file.name}
                            secondaryAction={
                                <Stack direction="row" spacing={1}>
                                    <IconButton edge="end" aria-label="view" onClick={() => handleView(file.name)}>
                                        <ViewIcon />
                                    </IconButton>
                                    <IconButton edge="end" aria-label="delete" color="error" onClick={() => handleDelete(file.name)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </Stack>
                            }
                            sx={{ borderBottom: '1px solid #f1f5f9', '&:last-child': { borderBottom: 'none' } }}
                        >
                            <ListItemIcon>
                                <FileIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText
                                primary={file.name.replace(/^\d+_/, '')} // Strip timestamp prefix
                                secondary={`${(file.metadata?.size / 1024).toFixed(1)} KB • ${new Date(file.created_at).toLocaleDateString()}`}
                            />
                        </ListItem>
                    ))}
                </List>
            )}
        </Box>
    );
}
