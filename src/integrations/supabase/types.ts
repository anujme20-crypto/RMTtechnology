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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      bank_cards: {
        Row: {
          account_number: string
          bank_name: string
          card_holder_name: string
          created_at: string | null
          id: string
          ifsc_code: string
          mobile_number: string | null
          user_id: string
        }
        Insert: {
          account_number: string
          bank_name: string
          card_holder_name: string
          created_at?: string | null
          id?: string
          ifsc_code: string
          mobile_number?: string | null
          user_id: string
        }
        Update: {
          account_number?: string
          bank_name?: string
          card_holder_name?: string
          created_at?: string | null
          id?: string
          ifsc_code?: string
          mobile_number?: string | null
          user_id?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          created_at: string | null
          id: string
          image_url: string
          mobile_number: string | null
          reward_amount: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url: string
          mobile_number?: string | null
          reward_amount: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string
          mobile_number?: string | null
          reward_amount?: number
          user_id?: string
        }
        Relationships: []
      }
      prizes: {
        Row: {
          created_at: string | null
          id: string
          mobile_number: string | null
          reward_amount: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          mobile_number?: string | null
          reward_amount?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          mobile_number?: string | null
          reward_amount?: number | null
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string
          created_at: string | null
          daily_earnings: number
          id: string
          maximum_purchase: number
          name: string
          price: number
          product_type: string
          revenue_days: number
          total_revenue: number
          vip_level: number
        }
        Insert: {
          category: string
          created_at?: string | null
          daily_earnings: number
          id?: string
          maximum_purchase: number
          name: string
          price: number
          product_type?: string
          revenue_days: number
          total_revenue: number
          vip_level: number
        }
        Update: {
          category?: string
          created_at?: string | null
          daily_earnings?: number
          id?: string
          maximum_purchase?: number
          name?: string
          price?: number
          product_type?: string
          revenue_days?: number
          total_revenue?: number
          vip_level?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          encrypted_password: string | null
          encrypted_trade_password: string | null
          full_name: string
          id: string
          invite_code: string
          invited_by: string | null
          last_checkin_date: string | null
          last_welfare_income_date: string | null
          mobile_number: string
          product_income: number | null
          recharge_balance: number | null
          spin_chances: number | null
          total_commission: number | null
          trade_password: string
          updated_at: string | null
          user_id: string
          withdrawal_balance: number | null
        }
        Insert: {
          created_at?: string | null
          encrypted_password?: string | null
          encrypted_trade_password?: string | null
          full_name: string
          id?: string
          invite_code: string
          invited_by?: string | null
          last_checkin_date?: string | null
          last_welfare_income_date?: string | null
          mobile_number: string
          product_income?: number | null
          recharge_balance?: number | null
          spin_chances?: number | null
          total_commission?: number | null
          trade_password: string
          updated_at?: string | null
          user_id: string
          withdrawal_balance?: number | null
        }
        Update: {
          created_at?: string | null
          encrypted_password?: string | null
          encrypted_trade_password?: string | null
          full_name?: string
          id?: string
          invite_code?: string
          invited_by?: string | null
          last_checkin_date?: string | null
          last_welfare_income_date?: string | null
          mobile_number?: string
          product_income?: number | null
          recharge_balance?: number | null
          spin_chances?: number | null
          total_commission?: number | null
          trade_password?: string
          updated_at?: string | null
          user_id?: string
          withdrawal_balance?: number | null
        }
        Relationships: []
      }
      recharge_requests: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          mobile_number: string | null
          status: string | null
          upi_id: string
          user_id: string
          utr_number: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          mobile_number?: string | null
          status?: string | null
          upi_id: string
          user_id: string
          utr_number: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          mobile_number?: string | null
          status?: string | null
          upi_id?: string
          user_id?: string
          utr_number?: string
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          created_at: string | null
          id: string
          message: string
          mobile_number: string | null
          sender_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          mobile_number?: string | null
          sender_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          mobile_number?: string | null
          sender_type?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          balance_type: string
          created_at: string | null
          description: string | null
          id: string
          mobile_number: string | null
          status: string | null
          transaction_type: string
          user_id: string
          utr_number: string | null
        }
        Insert: {
          amount: number
          balance_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          mobile_number?: string | null
          status?: string | null
          transaction_type: string
          user_id: string
          utr_number?: string | null
        }
        Update: {
          amount?: number
          balance_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          mobile_number?: string | null
          status?: string | null
          transaction_type?: string
          user_id?: string
          utr_number?: string | null
        }
        Relationships: []
      }
      user_products: {
        Row: {
          created_at: string | null
          days_remaining: number
          expiry_date: string
          id: string
          is_active: boolean | null
          mobile_number: string | null
          product_id: string
          purchase_date: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          days_remaining: number
          expiry_date: string
          id?: string
          is_active?: boolean | null
          mobile_number?: string | null
          product_id: string
          purchase_date?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          days_remaining?: number
          expiry_date?: string
          id?: string
          is_active?: boolean | null
          mobile_number?: string | null
          product_id?: string
          purchase_date?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      withdrawal_requests: {
        Row: {
          amount: number
          created_at: string | null
          final_amount: number
          id: string
          mobile_number: string | null
          processed_at: string | null
          status: string | null
          tax_amount: number
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          final_amount: number
          id?: string
          mobile_number?: string | null
          processed_at?: string | null
          status?: string | null
          tax_amount: number
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          final_amount?: number
          id?: string
          mobile_number?: string | null
          processed_at?: string | null
          status?: string | null
          tax_amount?: number
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_view_profile: {
        Args: { _profile_invited_by: string; _profile_user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
