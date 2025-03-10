export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
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
      customer_org: {
        Row: {
          created_at: string
          id: string
          name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      customer_user: {
        Row: {
          customer_id: string
          user_id: string
        }
        Insert: {
          customer_id: string
          user_id: string
        }
        Update: {
          customer_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_user_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_org"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_user_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profile"
            referencedColumns: ["id"]
          },
        ]
      }
      message: {
        Row: {
          content: string
          created_at: string
          created_by: string
          id: string
          ticket_id: string
          type: Database["public"]["Enums"]["message_type"] | null
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string
          id?: string
          ticket_id: string
          type?: Database["public"]["Enums"]["message_type"] | null
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          ticket_id?: string
          type?: Database["public"]["Enums"]["message_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "message_created_by_fkey1"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "ticket"
            referencedColumns: ["id"]
          },
        ]
      }
      metadata_dict: {
        Row: {
          metadata_type: string
          value: string
        }
        Insert: {
          metadata_type: string
          value: string
        }
        Update: {
          metadata_type?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "metadata_dict_metadata_type_fkey"
            columns: ["metadata_type"]
            isOneToOne: false
            referencedRelation: "metadata_type"
            referencedColumns: ["id"]
          },
        ]
      }
      metadata_type: {
        Row: {
          id: string
          name: string
          type: Database["public"]["Enums"]["metadata_type_type"]
        }
        Insert: {
          id: string
          name: string
          type: Database["public"]["Enums"]["metadata_type_type"]
        }
        Update: {
          id?: string
          name?: string
          type?: Database["public"]["Enums"]["metadata_type_type"]
        }
        Relationships: []
      }
      metadata_value: {
        Row: {
          metadata_type: string
          ticket_id: string
          value: string
        }
        Insert: {
          metadata_type: string
          ticket_id?: string
          value: string
        }
        Update: {
          metadata_type?: string
          ticket_id?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "metadata_value_metadata_type_fkey"
            columns: ["metadata_type"]
            isOneToOne: false
            referencedRelation: "metadata_type"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "metadata_value_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "ticket"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          id: number
          permission: Database["public"]["Enums"]["app_permission"]
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          id?: number
          permission: Database["public"]["Enums"]["app_permission"]
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          id?: number
          permission?: Database["public"]["Enums"]["app_permission"]
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      team: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      team_member: {
        Row: {
          team_id: string
          user_id: string
        }
        Insert: {
          team_id: string
          user_id: string
        }
        Update: {
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_member_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_member_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profile"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket: {
        Row: {
          assignee: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          STATE: string
          title: string
          type: string | null
        }
        Insert: {
          assignee?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          STATE: string
          title: string
          type?: string | null
        }
        Update: {
          assignee?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          STATE?: string
          title?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_type_fkey"
            columns: ["type"]
            isOneToOne: false
            referencedRelation: "ticket_type"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_subscriber: {
        Row: {
          ticket_id: string
          user_id: string
        }
        Insert: {
          ticket_id: string
          user_id: string
        }
        Update: {
          ticket_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_subscriber_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "ticket"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_type: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      ticket_type_metadata_type: {
        Row: {
          metadata_type: string
          ticket_type: string
        }
        Insert: {
          metadata_type: string
          ticket_type: string
        }
        Update: {
          metadata_type?: string
          ticket_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_type_metadata_type_metadata_type_fkey"
            columns: ["metadata_type"]
            isOneToOne: false
            referencedRelation: "metadata_type"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_type_metadata_type_ticket_type_fkey"
            columns: ["ticket_type"]
            isOneToOne: false
            referencedRelation: "ticket_type"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profile: {
        Row: {
          created_at: string
          email: string
          id: string
          location: string | null
          name: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          location?: string | null
          name?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          location?: string | null
          name?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: number
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: number
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: number
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      custom_access_token_hook: {
        Args: {
          event: Json
        }
        Returns: Json
      }
      get_app_permissions: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      get_app_roles: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
    }
    Enums: {
      app_permission:
        | "ticket.view"
        | "ticket.list.view"
        | "ticket.list.search"
        | "ticket.list.create"
        | "ticket.chat.view"
        | "ticket.chat.reply"
        | "ticket.assignee.view"
        | "ticket.assignee.edit"
        | "ticket.info.view"
        | "ticket.info.edit"
        | "ticket.metadata.view"
        | "ticket.metadata.edit"
        | "ticket.customercontext.view"
        | "ticket.state.view"
        | "ticket.state.edit"
        | "ticket.details"
        | "customer.view"
        | "org.view"
        | "admin.view"
        | "admin.tickettype.view"
        | "admin.tickettype.edit"
        | "admin.metadata.view"
        | "admin.metadata.edit"
        | "admin.role.view"
        | "admin.role.edit"
        | "customer.details.view"
        | "customer.details.edit"
        | "customer.context.view"
        | "org.details.view"
        | "admin.users.view"
        | "admin.users.edit"
        | "admin.teams.view"
        | "admin.teams.edit"
        | "team.view"
        | "ticket.team.view"
        | "ticket.chat.internal"
      app_role: "customer" | "employee" | "admin"
      message_type: "public" | "internal" | "agent_prompt" | "agent_response"
      metadata_type_type: "TEXT" | "DICT"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
