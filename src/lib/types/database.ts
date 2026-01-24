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
          title: string
          description: string | null
          category_id: string | null
          points: number
          reward_description: string | null
          acceptance_deadline: string | null
          completion_days: number | null
          status: 'draft' | 'published' | 'archived'
          is_template: boolean
          template_id: string | null
          narrative_context: string | null
          transformation_goal: string | null
          created_by: string
          created_at: string
          updated_at: string
          published_at: string | null
          archived_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          category_id?: string | null
          points?: number
          reward_description?: string | null
          acceptance_deadline?: string | null
          completion_days?: number | null
          status?: 'draft' | 'published' | 'archived'
          is_template?: boolean
          template_id?: string | null
          narrative_context?: string | null
          transformation_goal?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
          published_at?: string | null
          archived_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          category_id?: string | null
          points?: number
          reward_description?: string | null
          acceptance_deadline?: string | null
          completion_days?: number | null
          status?: 'draft' | 'published' | 'archived'
          is_template?: boolean
          template_id?: string | null
          narrative_context?: string | null
          transformation_goal?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
          published_at?: string | null
          archived_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'quests_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'categories'
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
            foreignKeyName: 'quests_template_id_fkey'
            columns: ['template_id']
            isOneToOne: false
            referencedRelation: 'quests'
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
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string | null
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon?: string | null
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon?: string | null
          display_order?: number
          created_at?: string
        }
        Relationships: []
      }
      objectives: {
        Row: {
          id: string
          quest_id: string
          title: string
          description: string | null
          points: number
          display_order: number
          depends_on_id: string | null
          evidence_required: boolean
          evidence_type: 'none' | 'text' | 'link' | 'text_or_link'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          quest_id: string
          title: string
          description?: string | null
          points?: number
          display_order?: number
          depends_on_id?: string | null
          evidence_required?: boolean
          evidence_type?: 'none' | 'text' | 'link' | 'text_or_link'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          quest_id?: string
          title?: string
          description?: string | null
          points?: number
          display_order?: number
          depends_on_id?: string | null
          evidence_required?: boolean
          evidence_type?: 'none' | 'text' | 'link' | 'text_or_link'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'objectives_quest_id_fkey'
            columns: ['quest_id']
            isOneToOne: false
            referencedRelation: 'quests'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'objectives_depends_on_id_fkey'
            columns: ['depends_on_id']
            isOneToOne: false
            referencedRelation: 'objectives'
            referencedColumns: ['id']
          }
        ]
      }
      user_quests: {
        Row: {
          id: string
          user_id: string
          quest_id: string
          status: 'accepted' | 'in_progress' | 'completed' | 'abandoned' | 'expired'
          accepted_at: string
          started_at: string | null
          completed_at: string | null
          abandoned_at: string | null
          deadline: string | null
          extension_requested: boolean
          extension_requested_at: string | null
          extension_reason: string | null
          extension_granted: boolean | null
          extension_decided_by: string | null
          extension_decided_at: string | null
          extended_deadline: string | null
        }
        Insert: {
          id?: string
          user_id: string
          quest_id: string
          status?: 'accepted' | 'in_progress' | 'completed' | 'abandoned' | 'expired'
          accepted_at?: string
          started_at?: string | null
          completed_at?: string | null
          abandoned_at?: string | null
          deadline?: string | null
          extension_requested?: boolean
          extension_requested_at?: string | null
          extension_reason?: string | null
          extension_granted?: boolean | null
          extension_decided_by?: string | null
          extension_decided_at?: string | null
          extended_deadline?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          quest_id?: string
          status?: 'accepted' | 'in_progress' | 'completed' | 'abandoned' | 'expired'
          accepted_at?: string
          started_at?: string | null
          completed_at?: string | null
          abandoned_at?: string | null
          deadline?: string | null
          extension_requested?: boolean
          extension_requested_at?: string | null
          extension_reason?: string | null
          extension_granted?: boolean | null
          extension_decided_by?: string | null
          extension_decided_at?: string | null
          extended_deadline?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'user_quests_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'user_quests_quest_id_fkey'
            columns: ['quest_id']
            isOneToOne: false
            referencedRelation: 'quests'
            referencedColumns: ['id']
          }
        ]
      }
      user_objectives: {
        Row: {
          id: string
          user_quest_id: string
          objective_id: string
          status: 'locked' | 'available' | 'submitted' | 'approved' | 'rejected'
          evidence_text: string | null
          evidence_url: string | null
          submitted_at: string | null
          reviewed_by: string | null
          reviewed_at: string | null
          feedback: string | null
        }
        Insert: {
          id?: string
          user_quest_id: string
          objective_id: string
          status?: 'locked' | 'available' | 'submitted' | 'approved' | 'rejected'
          evidence_text?: string | null
          evidence_url?: string | null
          submitted_at?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          feedback?: string | null
        }
        Update: {
          id?: string
          user_quest_id?: string
          objective_id?: string
          status?: 'locked' | 'available' | 'submitted' | 'approved' | 'rejected'
          evidence_text?: string | null
          evidence_url?: string | null
          submitted_at?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          feedback?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'user_objectives_user_quest_id_fkey'
            columns: ['user_quest_id']
            isOneToOne: false
            referencedRelation: 'user_quests'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'user_objectives_objective_id_fkey'
            columns: ['objective_id']
            isOneToOne: false
            referencedRelation: 'objectives'
            referencedColumns: ['id']
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string | null
          reference_type: string | null
          reference_id: string | null
          read: boolean
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message?: string | null
          reference_type?: string | null
          reference_id?: string | null
          read?: boolean
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string | null
          reference_type?: string | null
          reference_id?: string | null
          read?: boolean
          read_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'notifications_user_id_fkey'
            columns: ['user_id']
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
