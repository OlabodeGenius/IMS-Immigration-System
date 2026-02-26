import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Stack,
    Box,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const InstitutionSchema = z.object({
    name: z.string().min(2, "Institution name is required"),
    institution_type: z.enum(["UNIVERSITY", "COLLEGE", "LANGUAGE_SCHOOL", "OTHER"]),
    license_number: z.string().min(1, "License number is required"),
    contact_email: z.string().email("Invalid email address"),
    contact_phone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
});

export type CreateInstitutionDTO = z.infer<typeof InstitutionSchema>;
import { useCreateInstitution } from "../../../hooks/useInstitutions";
import { useSnackbar } from "notistack";

interface AddInstitutionDialogProps {
    open: boolean;
    onClose: () => void;
}

export function AddInstitutionDialog({ open, onClose }: AddInstitutionDialogProps) {
    const { enqueueSnackbar } = useSnackbar();
    const createInstitution = useCreateInstitution();

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<CreateInstitutionDTO>({
        resolver: zodResolver(InstitutionSchema),
        defaultValues: {
            name: "",
            institution_type: "UNIVERSITY",
            license_number: "",
            contact_email: "",
            contact_phone: "",
            address: "",
        },
    });

    const onSubmit = async (data: CreateInstitutionDTO) => {
        try {
            // Clean up optional fields that might be empty strings to null or string as expected by Omit<Institution, ...>
            const payload = {
                ...data,
                contact_email: data.contact_email || null,
                contact_phone: data.contact_phone || null,
                address: data.address || null,
            };
            await createInstitution.mutateAsync(payload as any);
            enqueueSnackbar("Institution created successfully", { variant: "success" });
            reset();
            onClose();
        } catch (error: any) {
            enqueueSnackbar(error.message || "Failed to create institution", { variant: "error" });
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Add New Institution</DialogTitle>
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                <DialogContent dividers>
                    <Stack spacing={3}>
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Institution Name"
                                    fullWidth
                                    error={!!errors.name}
                                    helperText={errors.name?.message}
                                    placeholder="e.g. Kazakh British Technical University"
                                />
                            )}
                        />

                        <Controller
                            name="institution_type"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    select
                                    label="Institution Type"
                                    fullWidth
                                    error={!!errors.institution_type}
                                    helperText={errors.institution_type?.message}
                                >
                                    <MenuItem value="UNIVERSITY">University</MenuItem>
                                    <MenuItem value="COLLEGE">College</MenuItem>
                                    <MenuItem value="LANGUAGE_SCHOOL">Language School</MenuItem>
                                </TextField>
                            )}
                        />

                        <Controller
                            name="license_number"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="License Number"
                                    fullWidth
                                    error={!!errors.license_number}
                                    helperText={errors.license_number?.message}
                                    placeholder="e.g. LIC-2024-001"
                                />
                            )}
                        />

                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                            <Controller
                                name="contact_email"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Contact Email"
                                        fullWidth
                                        error={!!errors.contact_email}
                                        helperText={errors.contact_email?.message}
                                        placeholder="office@university.edu"
                                    />
                                )}
                            />
                            <Controller
                                name="contact_phone"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Contact Phone"
                                        fullWidth
                                        error={!!errors.contact_phone}
                                        helperText={errors.contact_phone?.message}
                                        placeholder="+7 777 ..."
                                    />
                                )}
                            />
                        </Box>

                        <Controller
                            name="address"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Address"
                                    fullWidth
                                    multiline
                                    rows={2}
                                    error={!!errors.address}
                                    helperText={errors.address?.message}
                                    placeholder="Full physical address"
                                />
                            )}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting}
                    >
                        Register Institution
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}
