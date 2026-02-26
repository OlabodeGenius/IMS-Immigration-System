import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    TextField,
    Grid,
    MenuItem,
    Box,
    Typography,
    Paper,
    Button,
} from "@mui/material";
export const StudentRegistrationSchema = z.object({
    student: z.object({
        student_id_number: z.string().min(1, "Student ID is required"),
        full_name: z.string().min(2, "Full name is required"),
        nationality: z.string().min(1, "Nationality is required"),
        date_of_birth: z.string().min(1, "Date of birth is required"),
        passport_number: z.string().nullable().optional(),
        email: z.string().email("Invalid email").nullable().optional().or(z.literal('')),
        phone: z.string().nullable().optional(),
        sex: z.enum(["Male", "Female", "Other", "Unknown"]),
        photo_url: z.string().nullable().optional(),
    }),
    visa: z.object({
        visa_type: z.string().min(1, "Visa Type is required"),
        status: z.enum(["ACTIVE", "EXPIRED", "CANCELLED", "REVOKED", "PENDING"]),
        visa_number: z.string().nullable().optional(),
        start_date: z.string().nullable().optional().or(z.literal('')),
        end_date: z.string().nullable().optional().or(z.literal('')),
    }),
});

import { StudentPhotoUpload } from "./dashboard/StudentPhotoUpload";

type StudentRegistrationData = z.infer<typeof StudentRegistrationSchema>;

interface StudentFormProps {
    onSubmit: (data: StudentRegistrationData) => void;
    isLoading?: boolean;
    defaultValues?: Partial<StudentRegistrationData>;
}

export function StudentForm({ onSubmit, isLoading = false, defaultValues }: StudentFormProps) {
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<StudentRegistrationData>({
        resolver: zodResolver(StudentRegistrationSchema),
        defaultValues: {
            student: {
                student_id_number: defaultValues?.student?.student_id_number ?? "",
                full_name: defaultValues?.student?.full_name ?? "",
                nationality: defaultValues?.student?.nationality ?? "",
                date_of_birth: defaultValues?.student?.date_of_birth ?? "",
                passport_number: defaultValues?.student?.passport_number ?? null,
                email: defaultValues?.student?.email ?? null,
                phone: defaultValues?.student?.phone ?? null,
                sex: defaultValues?.student?.sex ?? "Male",
                photo_url: defaultValues?.student?.photo_url ?? null,
            },
            visa: {
                visa_type: defaultValues?.visa?.visa_type ?? "C9",
                status: defaultValues?.visa?.status ?? "ACTIVE",
                visa_number: defaultValues?.visa?.visa_number ?? null,
                start_date: defaultValues?.visa?.start_date ?? "",
                end_date: defaultValues?.visa?.end_date ?? "",
            },
        },
    });

    return (
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                <Grid container spacing={3}>
                    {/* Photo Upload Section */}
                    <Grid size={{ xs: 12 }}>
                        <Controller
                            name="student.photo_url"
                            control={control}
                            render={({ field }) => (
                                <StudentPhotoUpload
                                    value={field.value || null}
                                    onChange={field.onChange}
                                />
                            )}
                        />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <Typography variant="h6" gutterBottom color="primary">
                            Student Details
                        </Typography>
                        <Grid container spacing={2} mb={4}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Controller
                                    name="student.full_name"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Full Name"
                                            fullWidth
                                            error={!!errors.student?.full_name}
                                            helperText={errors.student?.full_name?.message}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Controller
                                    name="student.student_id_number"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Student ID Number"
                                            fullWidth
                                            error={!!errors.student?.student_id_number}
                                            helperText={errors.student?.student_id_number?.message}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Controller
                                    name="student.nationality"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Nationality"
                                            fullWidth
                                            error={!!errors.student?.nationality}
                                            helperText={errors.student?.nationality?.message}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Controller
                                    name="student.sex"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            select
                                            label="Sex"
                                            fullWidth
                                            error={!!errors.student?.sex}
                                            helperText={errors.student?.sex?.message}
                                        >
                                            <MenuItem value="Male">Male</MenuItem>
                                            <MenuItem value="Female">Female</MenuItem>
                                        </TextField>
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Controller
                                    name="student.passport_number"
                                    control={control}
                                    render={({ field: { value, onChange, ...field } }) => (
                                        <TextField
                                            {...field}
                                            value={value || ""}
                                            onChange={(e) => onChange(e.target.value || null)}
                                            label="Passport Number"
                                            fullWidth
                                            error={!!errors.student?.passport_number}
                                            helperText={errors.student?.passport_number?.message}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Controller
                                    name="student.date_of_birth"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Date of Birth"
                                            type="date"
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                            error={!!errors.student?.date_of_birth}
                                            helperText={errors.student?.date_of_birth?.message}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Controller
                                    name="student.email"
                                    control={control}
                                    render={({ field: { value, onChange, ...field } }) => (
                                        <TextField
                                            {...field}
                                            value={value || ""}
                                            onChange={(e) => onChange(e.target.value || null)}
                                            label="Email (Optional)"
                                            type="email"
                                            fullWidth
                                            error={!!errors.student?.email}
                                            helperText={errors.student?.email?.message}
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Controller
                                    name="student.phone"
                                    control={control}
                                    render={({ field: { value, onChange, ...field } }) => (
                                        <TextField
                                            {...field}
                                            value={value || ""}
                                            onChange={(e) => onChange(e.target.value || null)}
                                            label="Phone (Optional)"
                                            fullWidth
                                            error={!!errors.student?.phone}
                                            helperText={errors.student?.phone?.message}
                                        />
                                    )}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>

                <Typography variant="h6" gutterBottom color="primary">
                    Visa Information
                </Typography>
                <Grid container spacing={2} mb={4}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Controller
                            name="visa.visa_type"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    select
                                    label="Visa Type"
                                    fullWidth
                                    error={!!errors.visa?.visa_type}
                                    helperText={errors.visa?.visa_type?.message}
                                >
                                    <MenuItem value="C9">C9 (Student)</MenuItem>
                                </TextField>
                            )}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Controller
                            name="visa.visa_number"
                            control={control}
                            render={({ field: { value, onChange, ...field } }) => (
                                <TextField
                                    {...field}
                                    value={value || ""}
                                    onChange={(e) => onChange(e.target.value || null)}
                                    label="Visa Number"
                                    fullWidth
                                    error={!!errors.visa?.visa_number}
                                    helperText={errors.visa?.visa_number?.message}
                                />
                            )}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Controller
                            name="visa.start_date"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Start Date"
                                    type="date"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    error={!!errors.visa?.start_date}
                                    helperText={errors.visa?.start_date?.message}
                                />
                            )}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Controller
                            name="visa.end_date"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="End Date"
                                    type="date"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    error={!!errors.visa?.end_date}
                                    helperText={errors.visa?.end_date?.message}
                                />
                            )}
                        />
                    </Grid>
                </Grid>

                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                    <Button
                        type="submit"
                        variant="contained"
                        loading={isLoading}
                        size="large"
                    >
                        Register Student
                    </Button>
                </Box>
            </Box>
        </Paper>
    );
}
