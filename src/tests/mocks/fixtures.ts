import type { Database } from '@/lib/types/database'
import type { Category, Objective } from '@/lib/types/quest'

// Type aliases for convenience
type User = Database['public']['Tables']['users']['Row']
type QuestRow = Database['public']['Tables']['quests']['Row']
type Guild = Database['public']['Tables']['guilds']['Row']
type GuildMember = Database['public']['Tables']['guild_members']['Row']
type UserRole = Database['public']['Tables']['user_roles']['Row']

/**
 * Mock user fixture
 */
export const mockUser: User = {
  id: 'user-123',
  email: 'adventurer@guildmail.com',
  display_name: 'Test Adventurer',
  avatar_url: 'https://example.com/avatar.jpg',
  bio: 'A brave adventurer seeking glory',
  total_points: 1500,
  quests_completed: 10,
  privacy_settings: {
    profile_visibility: true,
    show_achievements: true,
    show_on_leaderboard: true,
  },
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
}

/**
 * Mock GM (Game Master) user fixture
 */
export const mockGMUser: User = {
  id: 'gm-456',
  email: 'gamemaster@guildmail.com',
  display_name: 'Game Master',
  avatar_url: 'https://example.com/gm-avatar.jpg',
  bio: 'The keeper of quests and adventures',
  total_points: 5000,
  quests_completed: 50,
  privacy_settings: {
    profile_visibility: true,
    show_achievements: true,
    show_on_leaderboard: true,
  },
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
}

/**
 * Mock private user fixture (profile not visible)
 */
export const mockPrivateUser: User = {
  id: 'private-789',
  email: 'private@guildmail.com',
  display_name: 'Private User',
  avatar_url: null,
  bio: null,
  total_points: 500,
  quests_completed: 5,
  privacy_settings: {
    profile_visibility: false,
    show_achievements: false,
    show_on_leaderboard: false,
  },
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
}

/**
 * Mock guild fixture
 */
export const mockGuild: Guild = {
  id: 'guild-789',
  name: 'The Brave Adventurers',
  description: 'A guild for those who seek glory and adventure',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
}

/**
 * Mock quest fixture - Published status (available for users)
 */
export const mockQuest: QuestRow = {
  id: 'quest-001',
  title: 'Defeat the Dragon',
  description: 'A fearsome dragon terrorizes the village. Slay it and earn great rewards!',
  category_id: 'cat-combat',
  points: 500,
  reward_description: '500 guild points',
  acceptance_deadline: null,
  completion_days: 7,
  status: 'published',
  is_template: false,
  template_id: null,
  narrative_context: null,
  transformation_goal: null,
  created_by: 'gm-456',
  created_at: '2024-01-15T00:00:00.000Z',
  updated_at: '2024-01-15T00:00:00.000Z',
  published_at: '2024-01-15T00:00:00.000Z',
  archived_at: null,
}

/**
 * Mock draft quest fixture
 */
export const mockDraftQuest: QuestRow = {
  id: 'quest-002',
  title: 'Gather Rare Herbs',
  description: 'Collect 10 moonflowers from the enchanted forest',
  category_id: 'cat-gathering',
  points: 150,
  reward_description: null,
  acceptance_deadline: null,
  completion_days: 3,
  status: 'draft',
  is_template: false,
  template_id: null,
  narrative_context: null,
  transformation_goal: null,
  created_by: 'gm-456',
  created_at: '2024-01-10T00:00:00.000Z',
  updated_at: '2024-01-12T00:00:00.000Z',
  published_at: null,
  archived_at: null,
}

/**
 * Mock archived quest fixture
 */
export const mockArchivedQuest: QuestRow = {
  id: 'quest-003',
  title: 'Map the Ancient Ruins',
  description: 'Explore and document the ruins north of the kingdom',
  category_id: 'cat-exploration',
  points: 300,
  reward_description: null,
  acceptance_deadline: null,
  completion_days: 14,
  status: 'archived',
  is_template: false,
  template_id: null,
  narrative_context: null,
  transformation_goal: null,
  created_by: 'gm-456',
  created_at: '2024-01-05T00:00:00.000Z',
  updated_at: '2024-01-14T00:00:00.000Z',
  published_at: '2024-01-06T00:00:00.000Z',
  archived_at: '2024-01-14T00:00:00.000Z',
}

/**
 * Mock published quest fixture #2
 */
export const mockPublishedQuest2: QuestRow = {
  id: 'quest-004',
  title: 'Rescue the Merchant',
  description: 'Save the traveling merchant from bandits',
  category_id: 'cat-combat',
  points: 250,
  reward_description: null,
  acceptance_deadline: null,
  completion_days: 5,
  status: 'published',
  is_template: false,
  template_id: null,
  narrative_context: null,
  transformation_goal: null,
  created_by: 'gm-456',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-08T00:00:00.000Z',
  published_at: '2024-01-02T00:00:00.000Z',
  archived_at: null,
}

/**
 * Mock guild member fixture
 */
export const mockGuildMember: GuildMember = {
  id: 'member-001',
  guild_id: 'guild-789',
  user_id: 'user-123',
  role: 'member',
  joined_at: '2024-01-02T00:00:00.000Z',
}

/**
 * Mock GM guild member fixture
 */
export const mockGMGuildMember: GuildMember = {
  id: 'member-002',
  guild_id: 'guild-789',
  user_id: 'gm-456',
  role: 'gm',
  joined_at: '2024-01-01T00:00:00.000Z',
}

/**
 * Mock user role fixture
 */
export const mockUserRole: UserRole = {
  id: 'role-001',
  user_id: 'user-123',
  role: 'member',
  created_at: '2024-01-01T00:00:00.000Z',
}

/**
 * Mock GM role fixture
 */
export const mockGMRole: UserRole = {
  id: 'role-002',
  user_id: 'gm-456',
  role: 'gm',
  created_at: '2024-01-01T00:00:00.000Z',
}

/**
 * Mock category fixtures
 */
export const mockCategory: Category = {
  id: 'category-001',
  name: 'Combat',
  description: 'Quests involving battles and defeating enemies',
  icon: 'sword',
  color: '#dc2626',
  display_order: 0,
  created_at: '2024-01-01T00:00:00.000Z',
}

/**
 * Mock objective fixtures
 */
export const mockObjective: Objective = {
  id: 'objective-001',
  quest_id: 'quest-001',
  title: 'Find the dragon lair',
  description: 'Locate the entrance to the dragon\'s lair in the mountains',
  points: 100,
  display_order: 0,
  depends_on_id: null,
  evidence_required: true,
  evidence_type: 'text',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
}

/**
 * Collection fixtures for list testing
 */
export const mockUsers: User[] = [mockUser, mockGMUser, mockPrivateUser]

export const mockQuests: QuestRow[] = [
  mockQuest,
  mockDraftQuest,
  mockArchivedQuest,
  mockPublishedQuest2,
]

export const mockGuilds: Guild[] = [mockGuild]

export const mockGuildMembers: GuildMember[] = [mockGuildMember, mockGMGuildMember]

export const mockCategories: Category[] = [
  mockCategory,
  {
    id: 'category-002',
    name: 'Exploration',
    description: 'Quests involving discovering new places',
    icon: 'compass',
    color: '#2563eb',
    display_order: 1,
    created_at: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'category-003',
    name: 'Gathering',
    description: 'Quests involving collecting items or resources',
    icon: 'backpack',
    color: '#16a34a',
    display_order: 2,
    created_at: '2024-01-01T00:00:00.000Z',
  },
]

export const mockObjectives: Objective[] = [
  mockObjective,
  {
    id: 'objective-002',
    quest_id: 'quest-001',
    title: 'Defeat the dragon',
    description: 'Slay the dragon in combat',
    points: 300,
    display_order: 1,
    depends_on_id: 'objective-001',
    evidence_required: true,
    evidence_type: 'link',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'objective-003',
    quest_id: 'quest-001',
    title: 'Collect the dragon scales',
    description: 'Gather 5 dragon scales as proof of your victory',
    points: 100,
    display_order: 2,
    depends_on_id: 'objective-002',
    evidence_required: true,
    evidence_type: 'text_or_link',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  },
]

/**
 * Factory functions for creating custom fixtures
 */
export function createMockUser(overrides: Partial<User> = {}): User {
  return {
    ...mockUser,
    id: `user-${Date.now()}`,
    ...overrides,
  }
}

export function createMockQuest(overrides: Partial<QuestRow> = {}): QuestRow {
  return {
    ...mockQuest,
    id: `quest-${Date.now()}`,
    ...overrides,
  }
}

export function createMockGuild(overrides: Partial<Guild> = {}): Guild {
  return {
    ...mockGuild,
    id: `guild-${Date.now()}`,
    ...overrides,
  }
}

export function createMockCategory(overrides: Partial<Category> = {}): Category {
  return {
    ...mockCategory,
    id: `category-${Date.now()}`,
    ...overrides,
  }
}

export function createMockObjective(overrides: Partial<Objective> = {}): Objective {
  return {
    ...mockObjective,
    id: `objective-${Date.now()}`,
    ...overrides,
  }
}

// Achievement types and fixtures
type Achievement = Database['public']['Tables']['achievements']['Row']
type UserAchievement = Database['public']['Tables']['user_achievements']['Row']

/**
 * Mock achievement fixtures
 */
export const mockAchievements: Achievement[] = [
  {
    id: 'ach-001',
    name: 'First Quest',
    description: 'Complete your first quest',
    icon: 'trophy',
    points: 50,
    created_at: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'ach-002',
    name: 'Expert Adventurer',
    description: 'Complete 10 quests',
    icon: 'star',
    points: 200,
    created_at: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'ach-003',
    name: 'Guild Champion',
    description: 'Earn 1000 points',
    icon: 'crown',
    points: 500,
    created_at: '2024-01-01T00:00:00.000Z',
  },
]

/**
 * Mock user achievements fixtures
 */
export const mockUserAchievements: UserAchievement[] = [
  {
    id: 'ua-001',
    user_id: 'user-123',
    achievement_id: 'ach-001',
    earned_at: '2024-01-15T00:00:00.000Z',
  },
  {
    id: 'ua-002',
    user_id: 'user-123',
    achievement_id: 'ach-002',
    earned_at: '2024-02-01T00:00:00.000Z',
  },
]

export function createMockAchievement(overrides: Partial<Achievement> = {}): Achievement {
  return {
    ...mockAchievements[0],
    id: `ach-${Date.now()}`,
    ...overrides,
  }
}

export function createMockUserAchievement(overrides: Partial<UserAchievement> = {}): UserAchievement {
  return {
    ...mockUserAchievements[0],
    id: `ua-${Date.now()}`,
    ...overrides,
  }
}
