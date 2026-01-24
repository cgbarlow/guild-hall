import type { Database } from '@/lib/types/database'

// Type aliases for convenience
type User = Database['public']['Tables']['users']['Row']
type Quest = Database['public']['Tables']['quests']['Row']
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
 * Mock quest fixture - Open status
 */
export const mockQuest: Quest = {
  id: 'quest-001',
  guild_id: 'guild-789',
  title: 'Defeat the Dragon',
  description: 'A fearsome dragon terrorizes the village. Slay it and earn great rewards!',
  status: 'open',
  xp_reward: 500,
  created_by: 'gm-456',
  claimed_by: null,
  created_at: '2024-01-15T00:00:00.000Z',
  updated_at: '2024-01-15T00:00:00.000Z',
}

/**
 * Mock claimed quest fixture
 */
export const mockClaimedQuest: Quest = {
  id: 'quest-002',
  guild_id: 'guild-789',
  title: 'Gather Rare Herbs',
  description: 'Collect 10 moonflowers from the enchanted forest',
  status: 'claimed',
  xp_reward: 150,
  created_by: 'gm-456',
  claimed_by: 'user-123',
  created_at: '2024-01-10T00:00:00.000Z',
  updated_at: '2024-01-12T00:00:00.000Z',
}

/**
 * Mock submitted quest fixture
 */
export const mockSubmittedQuest: Quest = {
  id: 'quest-003',
  guild_id: 'guild-789',
  title: 'Map the Ancient Ruins',
  description: 'Explore and document the ruins north of the kingdom',
  status: 'submitted',
  xp_reward: 300,
  created_by: 'gm-456',
  claimed_by: 'user-123',
  created_at: '2024-01-05T00:00:00.000Z',
  updated_at: '2024-01-14T00:00:00.000Z',
}

/**
 * Mock approved quest fixture
 */
export const mockApprovedQuest: Quest = {
  id: 'quest-004',
  guild_id: 'guild-789',
  title: 'Rescue the Merchant',
  description: 'Save the traveling merchant from bandits',
  status: 'approved',
  xp_reward: 250,
  created_by: 'gm-456',
  claimed_by: 'user-123',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-08T00:00:00.000Z',
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
 * Mock category - based on quest types (for future use)
 * Note: Categories are not in the current schema, but included for extensibility
 */
export interface Category {
  id: string
  name: string
  description: string
  icon: string
  color: string
}

export const mockCategory: Category = {
  id: 'category-001',
  name: 'Combat',
  description: 'Quests involving battles and defeating enemies',
  icon: 'sword',
  color: '#dc2626',
}

/**
 * Mock objective - based on quest objectives (for future use)
 * Note: Objectives are not in the current schema, but included for extensibility
 */
export interface Objective {
  id: string
  quest_id: string
  description: string
  is_completed: boolean
  order: number
}

export const mockObjective: Objective = {
  id: 'objective-001',
  quest_id: 'quest-001',
  description: 'Find the dragon lair',
  is_completed: false,
  order: 1,
}

/**
 * Collection fixtures for list testing
 */
export const mockUsers: User[] = [mockUser, mockGMUser]

export const mockQuests: Quest[] = [
  mockQuest,
  mockClaimedQuest,
  mockSubmittedQuest,
  mockApprovedQuest,
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
  },
  {
    id: 'category-003',
    name: 'Gathering',
    description: 'Quests involving collecting items or resources',
    icon: 'backpack',
    color: '#16a34a',
  },
]

export const mockObjectives: Objective[] = [
  mockObjective,
  {
    id: 'objective-002',
    quest_id: 'quest-001',
    description: 'Defeat the dragon',
    is_completed: false,
    order: 2,
  },
  {
    id: 'objective-003',
    quest_id: 'quest-001',
    description: 'Collect the dragon scales',
    is_completed: false,
    order: 3,
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

export function createMockQuest(overrides: Partial<Quest> = {}): Quest {
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
