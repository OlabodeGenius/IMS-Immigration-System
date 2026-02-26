import React, { useState } from 'react';
import {
    Box,
    Typography,
    Stack,
    Button,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    LinearProgress,
    alpha,
    useTheme,
    Paper,
    Divider,
    Tooltip
} from '@mui/material';
import {
    UploadFile as UploadIcon,
    InsertDriveFile as FileIcon,
    Delete as DeleteIcon,
    Download as DownloadIcon,
    PictureAsPdf as PdfIcon,
    Image as ImageIcon,
    Description as DocIcon
} from '@mui/icons-material';
import { useDocuments, useUploadDocument, useDeleteDocument, useDownloadDocument } from '../../hooks/useDocuments';
import { format } from 'date-fns';

interface DocumentManagerProps {
    studentId: string;
}

export function DocumentManager({ studentId }: DocumentManagerProps) {
    const theme = useTheme();
    const { data: documents = [], isLoading } = useDocuments(studentId);
    const { mutate: uploadDoc, isPending: isUploading } = useUploadDocument();
    const { mutate: deleteDoc } = useDeleteDocument();
    const { mutate: downloadDoc } = useDownloadDocument();

    const [uploadProgress, setUploadProgress] = useState<number>(0);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Simulate progress for UI feedback (Supabase upload doesn't native show progress in basic SDK)
        setUploadProgress(10);
        const interval = setInterval(() => {
            setUploadProgress(prev => (prev < 90 ? prev + 10 : prev));
        }, 200);

        uploadDoc({ studentId, file, name: file.name }, {
            onSuccess: () => {
                clearInterval(interval);
                setUploadProgress(100);
                setTimeout(() => setUploadProgress(0), 1000);
            },
            onError: () => {
                clearInterval(interval);
                setUploadProgress(0);
            }
        });
    };

    const getFileIcon = (fileType: string) => {
        if (fileType.includes('pdf')) return <PdfIcon color="error" />;
        if (fileType.includes('image')) return <ImageIcon color="primary" />;
        return <DocIcon color="action" />;
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <Box sx={{ mt: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle2" fontWeight={800} color="primary" sx={{ letterSpacing: 0.5 }}>
                    STUDENT DOCUMENTS
                </Typography>
                <Button
                    component="label"
                    variant="outlined"
                    size="small"
                    startIcon={<UploadIcon />}
                    disabled={isUploading}
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                >
                    Upload Document
                    <input type="file" hidden onChange={handleFileChange} />
                </Button>
            </Stack>

            {isUploading && (
                <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                        Uploading your document...
                    </Typography>
                    <LinearProgress variant="determinate" value={uploadProgress} sx={{ borderRadius: 1, height: 6 }} />
                </Box>
            )}

            <Paper elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
                {isLoading ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">Loading documents...</Typography>
                    </Box>
                ) : documents.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center', bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                        <FileIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1.5, opacity: 0.5 }} />
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                            No documents uploaded yet
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                            Upload student's passport and visa copies
                        </Typography>
                    </Box>
                ) : (
                    <List disablePadding>
                        {documents.map((doc, index) => (
                            <React.Fragment key={doc.id}>
                                <ListItem sx={{
                                    py: 2,
                                    px: 2.5,
                                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) }
                                }}>
                                    <ListItemIcon sx={{ minWidth: 44 }}>
                                        {getFileIcon(doc.file_type)}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Typography variant="body2" fontWeight={700} color="#1E293B">
                                                {doc.name}
                                            </Typography>
                                        }
                                        secondary={
                                            <Typography variant="caption" color="text.secondary">
                                                {formatSize(doc.size)} • Uploaded {format(new Date(doc.created_at), 'MMM d, yyyy')}
                                            </Typography>
                                        }
                                    />
                                    <ListItemSecondaryAction>
                                        <Stack direction="row" spacing={1}>
                                            <Tooltip title="Download">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => downloadDoc(doc.file_path)}
                                                    sx={{ color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.05) }}
                                                >
                                                    <DownloadIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => deleteDoc({ id: doc.id, studentId, filePath: doc.file_path })}
                                                    sx={{ color: 'error.main', bgcolor: alpha(theme.palette.error.main, 0.05) }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </ListItemSecondaryAction>
                                </ListItem>
                                {index < documents.length - 1 && <Divider />}
                            </React.Fragment>
                        ))}
                    </List>
                )}
            </Paper>
        </Box>
    );
}
