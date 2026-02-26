import React, { useState } from 'react';
import {
    Box,
    Avatar,
    IconButton,
    Typography,
    CircularProgress,
    alpha,
    useTheme,
    Tooltip
} from '@mui/material';
import {
    PhotoCamera as PhotoCameraIcon,
    Delete as DeleteIcon,
    CloudUpload as UploadIcon
} from '@mui/icons-material';
import { supabase } from '../../lib/supabaseClient';

interface StudentPhotoUploadProps {
    value: string | null;
    onChange: (url: string | null) => void;
    studentId?: string;
}

export function StudentPhotoUpload({ value, onChange, studentId }: StudentPhotoUploadProps) {
    const theme = useTheme();
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(value);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // 1. Show local preview immediately
        const localUrl = URL.createObjectURL(file);
        setPreviewUrl(localUrl);
        setIsUploading(true);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${studentId || 'temp'}/${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `student-photos/${fileName}`;

            // 2. Upload to Supabase Storage (using 'documents' bucket for now as we know it's being set up)
            // Ideally should be its own bucket 'avatars'
            const { error: uploadError } = await supabase.storage
                .from('documents')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 3. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('documents')
                .getPublicUrl(filePath);

            onChange(publicUrl);
            setPreviewUrl(publicUrl);
        } catch (error) {
            console.error('Error uploading photo:', error);
            // Revert preview if error
            setPreviewUrl(value);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = () => {
        onChange(null);
        setPreviewUrl(null);
    };

    return (
        <Box sx={{ position: 'relative', width: 120, height: 120, mx: 'auto', mb: 2 }}>
            <Avatar
                src={previewUrl || undefined}
                sx={{
                    width: 120,
                    height: 120,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    border: `2px dashed ${theme.palette.primary.main}`,
                    fontSize: 48,
                    color: theme.palette.primary.main
                }}
            >
                {!previewUrl && <PhotoCameraIcon fontSize="large" />}
            </Avatar>

            {isUploading && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        bgcolor: 'rgba(255, 255, 255, 0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        zIndex: 1
                    }}
                >
                    <CircularProgress size={40} />
                </Box>
            )}

            <Box
                sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    display: 'flex',
                    gap: 0.5
                }}
            >
                <Tooltip title="Upload Photo">
                    <IconButton
                        component="label"
                        size="small"
                        sx={{
                            bgcolor: 'white',
                            color: 'primary.main',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            '&:hover': { bgcolor: '#f8fafc' }
                        }}
                    >
                        <UploadIcon fontSize="small" />
                        <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                    </IconButton>
                </Tooltip>
                {previewUrl && (
                    <Tooltip title="Remove Photo">
                        <IconButton
                            size="small"
                            onClick={handleDelete}
                            sx={{
                                bgcolor: 'white',
                                color: 'error.main',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                '&:hover': { bgcolor: '#f8fafc' }
                            }}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}
            </Box>
            <Typography variant="caption" color="text.secondary" align="center" display="block" sx={{ mt: 1, fontWeight: 600 }}>
                Profile Photo
            </Typography>
        </Box>
    );
}
