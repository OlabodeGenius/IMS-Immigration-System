import { Box, Typography, Paper, Alert } from "@mui/material";
import { useProfile } from "../../../pages/useProfile";
import { useCreateStudent } from "../../../hooks/useStudents";
import { StudentForm } from "../../StudentForm";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";

export function RegisterStudentTab() {
    const { data: profile } = useProfile();
    const { mutate: registerStudent, isPending: isLoading, error } = useCreateStudent();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    const handleSubmit = (data: any) => {
        if (!profile?.institution_id) {
            console.error("No institution ID found in profile");
            return;
        }

        registerStudent(
            {
                student: data.student,
                visa: data.visa,
                institution_id: profile.institution_id,
            },
            {
                onSuccess: () => {
                    enqueueSnackbar("Student registered successfully!", { variant: "success" });
                    navigate("/dashboard?tab=students");
                },
            }
        );
    };

    return (
        <Box maxWidth="md" mx="auto">
            <Typography variant="h6" mb={3}>Register New International Student</Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    Failed to register student: {(error as any).message}
                </Alert>
            )}

            <Paper sx={{ p: 3 }}>
                <StudentForm
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                />
            </Paper>
        </Box>
    );
}
