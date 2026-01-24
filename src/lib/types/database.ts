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
          bio: string | null
          total_points: number
          quests_completed: number
          privacy_settings: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          total_points?: number
          quests_completed?: number
          privacy_settings?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          total_points?: number
          quests_completed?: number
          privacy_settings?: Json | null
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
      achievements: {
        Row: {
          id: string
          name: string
          description: string
          icon: string
          points: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          icon?: string
          points?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          icon?: string
          points?: number
          created_at?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          earned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          earned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          earned_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'user_achievements_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'user_achievements_achievement_id_fkey'
            columns: ['achievement_id']
            isOneToOne: false
            referencedRelation: 'achievements'
            referencedColumns: ['id']
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          display_name: string | null
          bio: string | null
          avatar_url: string | null
          total_points: number
          quests_completed: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          total_points?: number
          quests_completed?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          total_points?: number
          quests_completed?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_user_id_fkey'
            columns: ['user_id']
            isOneToOne: true
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      privacy_settings: {
        Row: {
          id: string
          user_id: string
          show_profile: boolean
          show_stats: boolean
          show_activity: boolean
          allow_guild_invites: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          show_profile?: boolean
          show_stats?: boolean
          show_activity?: boolean
          allow_guild_invites?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          show_profile?: boolean
          show_stats?: boolean
          show_activity?: boolean
          allow_guild_invites?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'privacy_settings_user_id_fkey'
            columns: ['user_id']
            isOneToOne: true
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
      get_leaderboard_position: {
        Args: { user_id: string }
        Returns: { position: number } | null
      }
      export_user_data: {
        Args: Record<string, never>
        Returns: {
          profile: {
            display_name: string | null
            bio: string | null
            avatar_url: string | null
            total_points: number
            quests_completed: number
          }
          privacy_settings: {
            show_profile: boolean
            show_stats: boolean
            show_activity: boolean
            allow_guild_invites: boolean
          }
          guilds: Array<{
            name: string
            role: string
            joined_at: string
          }>
          quests: Array<{
            title: string
            status: string
            xp_reward: number
            created_at: string
          }>
        }
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
