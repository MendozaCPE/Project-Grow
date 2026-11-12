// TypeScript types for database tables
// These should be kept in sync with your Supabase schema

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
          full_name: string
          school: string
          role: 'admin' | 'teacher'
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          school: string
          role?: 'admin' | 'teacher'
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          school?: string
          role?: 'admin' | 'teacher'
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      lac_sessions: {
        Row: {
          id: string
          session_date: string
          session_no: number
          title: string
          locked: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_date: string
          session_no: number
          title: string
          locked?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          session_date?: string
          session_no?: number
          title?: string
          locked?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      submissions: {
        Row: {
          id: string
          teacher_id: string
          session_id: string
          answers: Json
          status: 'draft' | 'submitted'
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          teacher_id: string
          session_id: string
          answers?: Json
          status?: 'draft' | 'submitted'
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          teacher_id?: string
          session_id?: string
          answers?: Json
          status?: 'draft' | 'submitted'
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
