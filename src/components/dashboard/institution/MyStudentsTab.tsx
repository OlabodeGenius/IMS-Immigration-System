import { useState } from "react";
import { Box, Typography } from "@mui/material";
import { useStudents } from "../../../hooks/useStudents";
import { useAuth } from "../../../auth/AuthProvider";
import { DataTable } from "../../DataTable";
import { StudentProfileDialog } from "../StudentProfileDialog";
import type { Student } from "../../../types/database.types";

export function MyStudentsTab() {
    const { profile } = useAuth();
    const { data: students = [], isLoading } = useStudents(profile?.institution_id || undefined);
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

    const columns = [
        { id: "full_name", label: "Full Name" },
        { id: "student_id_number", label: "Student ID" },
        { id: "nationality", label: "Nationality" },
        { id: "date_of_birth", label: "DOB" },
        { id: "passport_number", label: "Passport" },
        {
            id: "visa_status",
            label: "Visa Status",
            render: (row: Student) => (row as any).visa?.[0]?.status || "N/A"
        },
    ];

    return (
        <Box>
            <Typography variant="h6" mb={2}>Enrolled Students</Typography>
            <DataTable
                columns={columns}
                data={students}
                isLoading={isLoading}
                searchPlaceholder="Search by name, ID, nationality..."
                onRowClick={(row) => setSelectedStudentId(row.id)}
            />

            <StudentProfileDialog
                open={!!selectedStudentId}
                studentId={selectedStudentId}
                onClose={() => setSelectedStudentId(null)}
            />
        </Box>
    );
}
