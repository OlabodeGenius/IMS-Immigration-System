export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      attendance_records: {
        Row: {
          attendance_date: string
          created_at: string | null
          id: string
          notes: string | null
          status: string
          student_id: string
        }
        Insert: {
          attendance_date: string
          created_at?: string | null
          id?: string
          notes?: string | null
          status: string
          student_id: string
        }
        Update: {
          attendance_date?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_verification"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_verification_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_institution_id: string | null
          actor_role: string | null
          actor_user_id: string | null
          after_data: Json | null
          before_data: Json | null
          changes: Json | null
          client_ip: string | null
          created_at: string | null
          id: string
          record_id: string
          request_id: string | null
          subject_institution_id: string | null
          subject_student_id: string | null
          summary: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action?: string
          actor_institution_id?: string | null
          actor_role?: string | null
          actor_user_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          changes?: Json | null
          client_ip?: string | null
          created_at?: string | null
          id?: string
          record_id: string
          request_id?: string | null
          subject_institution_id?: string | null
          subject_student_id?: string | null
          summary?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          actor_institution_id?: string | null
          actor_role?: string | null
          actor_user_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          changes?: Json | null
          client_ip?: string | null
          created_at?: string | null
          id?: string
          record_id?: string
          request_id?: string | null
          subject_institution_id?: string | null
          subject_student_id?: string | null
          summary?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey_profile"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      blockchain_ledger: {
        Row: {
          blockchain_tx_id: string
          card_id: string
          created_at: string
          id: string
          record_hash: string
        }
        Insert: {
          blockchain_tx_id: string
          card_id: string
          created_at?: string
          id?: string
          record_hash: string
        }
        Update: {
          blockchain_tx_id?: string
          card_id?: string
          created_at?: string
          id?: string
          record_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "blockchain_ledger_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "student_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      institutions: {
        Row: {
          address: string | null
          city: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          id: string
          institution_type: string
          license_number: string | null
          logo_url: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          institution_type: string
          license_number?: string | null
          logo_url?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          institution_type?: string
          license_number?: string | null
          logo_url?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          notification_type: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          notification_type: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          notification_type?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          payment_date: string | null
          payment_type: string
          status: string
          student_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          payment_date?: string | null
          payment_type: string
          status?: string
          student_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          payment_date?: string | null
          payment_type?: string
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_verification"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_verification_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          institution_id: string | null
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          institution_id?: string | null
          role: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          institution_id?: string | null
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      student_cards: {
        Row: {
          blockchain_tx_id: string | null
          card_number: string
          created_at: string
          expires_at: string | null
          id: string
          institution_id: string
          issued_at: string
          metadata: Json | null
          record_hash: string | null
          status: string
          student_id: string
          token_version: number
          updated_at: string
        }
        Insert: {
          blockchain_tx_id?: string | null
          card_number: string
          created_at?: string
          expires_at?: string | null
          id?: string
          institution_id: string
          issued_at?: string
          metadata?: Json | null
          record_hash?: string | null
          status?: string
          student_id: string
          token_version?: number
          updated_at?: string
        }
        Update: {
          blockchain_tx_id?: string | null
          card_number?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          institution_id?: string
          issued_at?: string
          metadata?: Json | null
          record_hash?: string | null
          status?: string
          student_id?: string
          token_version?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_cards_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_cards_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_verification"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_cards_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_verification_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_cards_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_documents: {
        Row: {
          created_at: string | null
          file_path: string
          file_type: string | null
          id: string
          name: string
          size: number | null
          student_id: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          file_path: string
          file_type?: string | null
          id?: string
          name: string
          size?: number | null
          student_id: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          file_path?: string
          file_type?: string | null
          id?: string
          name?: string
          size?: number | null
          student_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_documents_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_verification"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_documents_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_verification_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_documents_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          created_at: string | null
          date_of_birth: string
          email: string | null
          full_name: string
          id: string
          full_name_cyrillic: string | null
          iin: string | null
          institution_id: string
          metadata: Json | null
          nationality: string
          passport_number: string | null
          phone: string | null
          photo_url: string | null
          sex: string | null
          student_id_number: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date_of_birth: string
          email?: string | null
          full_name: string
          id?: string
          full_name_cyrillic?: string | null
          iin?: string | null
          institution_id: string
          metadata?: Json | null
          nationality: string
          passport_number?: string | null
          phone?: string | null
          photo_url?: string | null
          sex?: string | null
          student_id_number: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date_of_birth?: string
          email?: string | null
          full_name?: string
          id?: string
          full_name_cyrillic?: string | null
          iin?: string | null
          institution_id?: string
          metadata?: Json | null
          nationality?: string
          passport_number?: string | null
          phone?: string | null
          photo_url?: string | null
          sex?: string | null
          student_id_number?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_requests: {
        Row: {
          created_at: string | null
          id: string
          result: Json
          student_id: string
          verification_type: string
          verified_by: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          result: Json
          student_id: string
          verification_type: string
          verified_by: string
        }
        Update: {
          created_at?: string | null
          id?: string
          result?: Json
          student_id?: string
          verification_type?: string
          verified_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_requests_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_verification"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_requests_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_verification_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_requests_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      visa_applications: {
        Row: {
          application_type: Database["public"]["Enums"]["application_type_enum"]
          contract_scan_url: string | null
          created_at: string | null
          created_by: string | null
          id: string
          institution_id: string
          officer_notes: string | null
          passport_scan_url: string | null
          requested_end_date: string
          requested_start_date: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["application_status_enum"]
          student_id: string
          updated_at: string | null
        }
        Insert: {
          application_type?: Database["public"]["Enums"]["application_type_enum"]
          contract_scan_url?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          institution_id: string
          officer_notes?: string | null
          passport_scan_url?: string | null
          requested_end_date: string
          requested_start_date: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["application_status_enum"]
          student_id: string
          updated_at?: string | null
        }
        Update: {
          application_type?: Database["public"]["Enums"]["application_type_enum"]
          contract_scan_url?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          institution_id?: string
          officer_notes?: string | null
          passport_scan_url?: string | null
          requested_end_date?: string
          requested_start_date?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["application_status_enum"]
          student_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visa_applications_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visa_applications_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_verification"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visa_applications_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_verification_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visa_applications_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      visas: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          metadata: Json | null
          start_date: string
          status: string
          student_id: string
          updated_at: string | null
          visa_number: string | null
          visa_type: string
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          metadata?: Json | null
          start_date: string
          status?: string
          student_id: string
          updated_at?: string | null
          visa_number?: string | null
          visa_type?: string
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          metadata?: Json | null
          start_date?: string
          status?: string
          student_id?: string
          updated_at?: string | null
          visa_number?: string | null
          visa_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "visas_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "student_verification"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visas_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "student_verification_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visas_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      analytics_summary: {
        Row: {
          active_visas: number | null
          expired_visas: number | null
          total_institutions: number | null
          total_nationalities: number | null
          total_students: number | null
          visas_expiring_soon: number | null
        }
        Relationships: []
      }
      student_verification: {
        Row: {
          full_name: string | null
          id: string | null
          institution_name: string | null
          institution_type: string | null
          nationality: string | null
          student_id_number: string | null
          visa_expiry: string | null
          visa_number: string | null
          visa_start: string | null
          visa_status: string | null
          visa_type: string | null
          visa_validity: string | null
        }
        Relationships: []
      }
      student_verification_public: {
        Row: {
          id: string | null
          institution_name: string | null
          institution_type: string | null
          nationality: string | null
          student_id_number: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_user_institution_id: { Args: never; Returns: string }
      get_user_role: { Args: never; Returns: string }
      is_immigration: { Args: never; Returns: boolean }
      issue_student_card: {
        Args: { p_student_id: string }
        Returns: {
          blockchain_tx_id: string | null
          card_number: string
          created_at: string
          expires_at: string | null
          id: string
          institution_id: string
          issued_at: string
          metadata: Json | null
          record_hash: string | null
          status: string
          student_id: string
          token_version: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "student_cards"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      my_institution_id: { Args: never; Returns: string }
      trigger_visa_alerts: { Args: never; Returns: undefined }
    }
    Enums: {
      application_status_enum:
      | "PENDING"
      | "APPROVED"
      | "REJECTED"
      | "CHANGES_REQUESTED"
      application_type_enum: "NEW" | "RENEWAL"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
    DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
    DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema["Enums"]
  | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      application_status_enum: [
        "PENDING",
        "APPROVED",
        "REJECTED",
        "CHANGES_REQUESTED",
      ],
      application_type_enum: ["NEW", "RENEWAL"],
    },
  },
} as const
