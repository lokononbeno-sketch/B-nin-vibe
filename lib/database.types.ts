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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      commission_payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          note: string | null
          organizer_id: string
          paid_at: string
          payment_method: string | null
          recorded_by: string
          reference: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          note?: string | null
          organizer_id: string
          paid_at?: string
          payment_method?: string | null
          recorded_by: string
          reference?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          note?: string | null
          organizer_id?: string
          paid_at?: string
          payment_method?: string | null
          recorded_by?: string
          reference?: string | null
        }
        Relationships: []
      }
      event_favorites: {
        Row: {
          created_at: string
          event_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_favorites_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_participants: {
        Row: {
          commission_per_ticket: number
          created_at: string
          event_id: string
          id: string
          payment_confirmed_at: string | null
          payment_confirmed_by: string | null
          payment_status: string
          status: string
          ticket_quantity: number
          user_id: string
        }
        Insert: {
          commission_per_ticket?: number
          created_at?: string
          event_id: string
          id?: string
          payment_confirmed_at?: string | null
          payment_confirmed_by?: string | null
          payment_status?: string
          status?: string
          ticket_quantity?: number
          user_id: string
        }
        Update: {
          commission_per_ticket?: number
          created_at?: string
          event_id?: string
          id?: string
          payment_confirmed_at?: string | null
          payment_confirmed_by?: string | null
          payment_status?: string
          status?: string
          ticket_quantity?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_participants_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_reports: {
        Row: {
          created_at: string
          details: string | null
          event_id: string
          id: string
          reason: string
          reporter_id: string
          status: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          event_id: string
          id?: string
          reason: string
          reporter_id: string
          status?: string
        }
        Update: {
          created_at?: string
          details?: string | null
          event_id?: string
          id?: string
          reason?: string
          reporter_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_reports_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          ambiance: string[]
          capacity: number
          category: string
          city: string
          commission_per_ticket: number
          country: string
          created_at: string
          currency: string
          description: string
          ends_at: string | null
          facebook_url: string | null
          id: string
          image_url: string | null
          organizer_id: string
          price: number
          starts_at: string
          status: string
          tags: string[]
          title: string
          updated_at: string
          venue: string
          visibility: string
          whatsapp_phone: string | null
        }
        Insert: {
          ambiance?: string[]
          capacity?: number
          category: string
          city: string
          commission_per_ticket?: number
          country?: string
          created_at?: string
          currency?: string
          description: string
          ends_at?: string | null
          facebook_url?: string | null
          id?: string
          image_url?: string | null
          organizer_id: string
          price?: number
          starts_at: string
          status?: string
          tags?: string[]
          title: string
          updated_at?: string
          venue: string
          visibility?: string
          whatsapp_phone?: string | null
        }
        Update: {
          ambiance?: string[]
          capacity?: number
          category?: string
          city?: string
          commission_per_ticket?: number
          country?: string
          created_at?: string
          currency?: string
          description?: string
          ends_at?: string | null
          facebook_url?: string | null
          id?: string
          image_url?: string | null
          organizer_id?: string
          price?: number
          starts_at?: string
          status?: string
          tags?: string[]
          title?: string
          updated_at?: string
          venue?: string
          visibility?: string
          whatsapp_phone?: string | null
        }
        Relationships: []
      }
      platform_admins: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string | null
          country: string
          cover_url: string | null
          created_at: string
          display_name: string
          facebook_url: string | null
          id: string
          interests: string[]
          updated_at: string
          username: string | null
          whatsapp_numbers: string[]
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string
          cover_url?: string | null
          created_at?: string
          display_name?: string
          facebook_url?: string | null
          id: string
          interests?: string[]
          updated_at?: string
          username?: string | null
          whatsapp_numbers?: string[]
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string
          cover_url?: string | null
          created_at?: string
          display_name?: string
          facebook_url?: string | null
          id?: string
          interests?: string[]
          updated_at?: string
          username?: string | null
          whatsapp_numbers?: string[]
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          facebook_connected: boolean
          notifications_enabled: boolean
          preferred_city: string | null
          search_radius_km: number
          updated_at: string
          user_id: string
          whatsapp_phone: string | null
          whatsapp_status_opt_in: boolean
        }
        Insert: {
          facebook_connected?: boolean
          notifications_enabled?: boolean
          preferred_city?: string | null
          search_radius_km?: number
          updated_at?: string
          user_id: string
          whatsapp_phone?: string | null
          whatsapp_status_opt_in?: boolean
        }
        Update: {
          facebook_connected?: boolean
          notifications_enabled?: boolean
          preferred_city?: string | null
          search_radius_km?: number
          updated_at?: string
          user_id?: string
          whatsapp_phone?: string | null
          whatsapp_status_opt_in?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cancel_event_reservation: {
        Args: { p_event_id: string }
        Returns: undefined
      }
      get_public_event_ticket_counts: {
        Args: { event_ids: string[] }
        Returns: {
          event_id: string
          ticket_count: number
        }[]
      }
      is_platform_admin: { Args: never; Returns: boolean }
      reserve_event_tickets: {
        Args: { p_event_id: string; p_quantity: number }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
