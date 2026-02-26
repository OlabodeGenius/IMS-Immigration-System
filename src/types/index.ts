import { Database } from "./database.types";

export type Tables<T extends keyof Database["public"]["Tables"]> =
    Database["public"]["Tables"][T]["Row"];
export type Enums<T extends keyof Database["public"]["Enums"]> =
    Database["public"]["Enums"][T];

export type Profile = Tables<"profiles">;
export type Student = Tables<"students"> & {
    visa?: Visa | null;
    institution?: Institution | null;
    attendance?: Tables<"attendance_records">[];
};
export type Institution = Tables<"institutions">;
export type Visa = Tables<"visas">;
export type AttendanceRecord = Tables<"attendance_records">;
export type VisaApplication = Tables<"visa_applications">;

export type UserRole = "SUPERADMIN" | "MINISTRY_OFFICIAL" | "IMMIGRATION" | "INSTITUTION" | "STUDENT";
