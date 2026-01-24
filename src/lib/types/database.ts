// Auto-generated types will go here
// Run: npx supabase gen types typescript --project-id <id> > src/lib/types/database.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      guilds: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      guild_members: {
        Row: {
          id: string
          guild_id: string
          user_id: string
          role: 'gm' | 'member'
          joined_at: string
        }
        Insert: {
          id?: string
          guild_id: string
          user_id: string
          role?: 'gm' | 'member'
          joined_at?: string
        }
        Update: {
          id?: string
          guild_id?: string
          user_id?: string
          role?: 'gm' | 'member'
          joined_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'guild_members_guild_id_fkey'
            columns: ['guild_id']
            isOneToOne: false
            referencedRelation: 'guilds'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'guild_members_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: 'admin' | 'gm' | 'member'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: 'admin' | 'gm' | 'member'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: 'admin' | 'gm' | 'member'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'user_roles_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      quests: {
        Row: {
          id: string
          guild_id: string
          title: string
          description: string | null
          status: 'open' | 'claimed' | 'submitted' | 'approved' | 'rejected'
          xp_reward: number
          created_by: string
          claimed_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          guild_id: string
          title: string
          description?: string | null
          status?: 'open' | 'claimed' | 'submitted' | 'approved' | 'rejected'
          xp_reward?: number
          created_by: string
          claimed_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          guild_id?: string
          title?: string
          description?: string | null
          status?: 'open' | 'claimed' | 'submitted' | 'approved' | 'rejected'
          xp_reward?: number
          created_by?: string
          claimed_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'quests_guild_id_fkey'
            columns: ['guild_id']
            isOneToOne: false
            referencedRelation: 'guilds'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'quests_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'quests_claimed_by_fkey'
            columns: ['claimed_by']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
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
