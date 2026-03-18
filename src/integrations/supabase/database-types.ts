
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          user_role: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          user_role?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          user_role?: string
          created_at?: string | null
          updated_at?: string | null
        }
      }
      plans: {
        Row: {
          id: number
          name: string
          description: string | null
          price: number
          consultations_included: number
          features: Json | null
          subscription_link: string
          is_featured: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          price: number
          consultations_included: number
          features?: Json | null
          subscription_link: string
          is_featured?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          price?: number
          consultations_included?: number
          features?: Json | null
          subscription_link?: string
          is_featured?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      testimonials: {
        Row: {
          id: number
          name: string
          position: string | null
          company: string | null
          photo_url: string | null
          stars: number | null
          content: string
          is_approved: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          name: string
          position?: string | null
          company?: string | null
          photo_url?: string | null
          stars?: number | null
          content: string
          is_approved?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          name?: string
          position?: string | null
          company?: string | null
          photo_url?: string | null
          stars?: number | null
          content?: string
          is_approved?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      consultation_types: {
        Row: {
          id: number
          title: string
          description: string
          icon_url: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          title: string
          description: string
          icon_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          title?: string
          description?: string
          icon_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      available_resources: {
        Row: {
          id: number
          title: string
          description: string
          icon_url: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          title: string
          description: string
          icon_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          title?: string
          description?: string
          icon_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      cpf_data: {
        Row: {
          id: number
          internal_reference: number
          cpf: string
          full_name: string
          birth_date: string | null
          gender: string | null
          father_name: string | null
          mother_name: string | null
          rg: string | null
          profession: string | null
          cnh: string | null
          birthplace: string | null
          nickname: string | null
          last_address: string | null
          photo_url: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          internal_reference: number
          cpf: string
          full_name: string
          birth_date?: string | null
          gender?: string | null
          father_name?: string | null
          mother_name?: string | null
          rg?: string | null
          profession?: string | null
          cnh?: string | null
          birthplace?: string | null
          nickname?: string | null
          last_address?: string | null
          photo_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          internal_reference?: number
          cpf?: string
          full_name?: string
          birth_date?: string | null
          gender?: string | null
          father_name?: string | null
          mother_name?: string | null
          rg?: string | null
          profession?: string | null
          cnh?: string | null
          birthplace?: string | null
          nickname?: string | null
          last_address?: string | null
          photo_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      balance_transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          transaction_type: string
          description: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          transaction_type: string
          description?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          transaction_type?: string
          description?: string | null
          created_at?: string | null
        }
      }
      consultation_history: {
        Row: {
          id: string
          user_id: string
          consultation_type: string
          query_text: string
          result: Json | null
          cost: number
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          consultation_type: string
          query_text: string
          result?: Json | null
          cost: number
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          consultation_type?: string
          query_text?: string
          result?: Json | null
          cost?: number
          created_at?: string | null
        }
      }
      referrals: {
        Row: {
          id: string
          referrer_id: string
          referred_id: string | null
          referral_code: string
          status: string
          bonus_paid: boolean | null
          created_at: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          referrer_id: string
          referred_id?: string | null
          referral_code: string
          status?: string
          bonus_paid?: boolean | null
          created_at?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          referrer_id?: string
          referred_id?: string | null
          referral_code?: string
          status?: string
          bonus_paid?: boolean | null
          created_at?: string | null
          completed_at?: string | null
        }
      }
      support_messages: {
        Row: {
          id: string
          user_id: string
          subject: string
          message: string
          status: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          subject: string
          message: string
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          subject?: string
          message?: string
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
