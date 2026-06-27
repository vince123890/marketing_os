export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type ModuleStatus = "not_started" | "in_progress" | "completed"
export type SubscriptionPlan = "free" | "trial" | "pro" | "lifetime"
export type OrderStatus =
  | "pending_payment"
  | "waiting_verification"
  | "proof_rejected"
  | "paid"
  | "expired"
export type ProofStatus = "pending_verification" | "verified" | "rejected"

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          current_plan: SubscriptionPlan
          streak_count: number
          last_active_date: string | null
          learning_goal: string | null
          daily_time_minutes: number | null
          onboarding_completed: boolean
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name?: string
          email?: string
          current_plan?: SubscriptionPlan
          streak_count?: number
          last_active_date?: string | null
          learning_goal?: string | null
          daily_time_minutes?: number | null
          onboarding_completed?: boolean
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>
      }
      modules: {
        Row: {
          id: string
          order_number: number
          slug: string
          title: string
          content_markdown: string
          key_takeaway: string
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number: number
          slug: string
          title: string
          content_markdown?: string
          key_takeaway?: string
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["modules"]["Insert"]>
      }
      tasks: {
        Row: {
          id: string
          module_id: string
          title: string
          description: string
          rubric: string
          min_char_length: number
          created_at: string
        }
        Insert: {
          id?: string
          module_id: string
          title: string
          description: string
          rubric?: string
          min_char_length?: number
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["tasks"]["Insert"]>
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          module_id: string
          status: ModuleStatus
          is_bookmarked: boolean
          started_at: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          module_id: string
          status?: ModuleStatus
          is_bookmarked?: boolean
          started_at?: string | null
          completed_at?: string | null
        }
        Update: Partial<Database["public"]["Tables"]["user_progress"]["Insert"]>
      }
      task_submissions: {
        Row: {
          id: string
          user_id: string
          task_id: string
          module_id: string
          content: string
          ai_feedback: string | null
          score: number | null
          submitted_at: string
        }
        Insert: {
          id?: string
          user_id: string
          task_id: string
          module_id: string
          content: string
          ai_feedback?: string | null
          score?: number | null
          submitted_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["task_submissions"]["Insert"]>
      }
      daily_logs: {
        Row: {
          id: string
          user_id: string
          log_date: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          log_date: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["daily_logs"]["Insert"]>
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan: string
          period_start: string
          period_end: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan: string
          period_start?: string
          period_end?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["subscriptions"]["Insert"]>
      }
      subscription_orders: {
        Row: {
          id: string
          user_id: string
          plan: string
          amount: number
          status: OrderStatus
          bank_name: string
          bank_account: string
          expires_at: string
          paid_at: string | null
          created_at: string
        }
        Insert: {
          id: string
          user_id: string
          plan: string
          amount: number
          status?: OrderStatus
          bank_name: string
          bank_account: string
          expires_at: string
          paid_at?: string | null
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["subscription_orders"]["Insert"]>
      }
      payment_proofs: {
        Row: {
          id: string
          order_id: string
          user_id: string
          storage_path: string
          status: ProofStatus
          rejection_reason: string | null
          uploaded_at: string
          reviewed_at: string | null
          reviewed_by: string | null
        }
        Insert: {
          id?: string
          order_id: string
          user_id: string
          storage_path: string
          status?: ProofStatus
          rejection_reason?: string | null
          uploaded_at?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
        }
        Update: Partial<Database["public"]["Tables"]["payment_proofs"]["Insert"]>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
