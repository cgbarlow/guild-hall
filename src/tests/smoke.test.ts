import { describe, it, expect, vi } from 'vitest'
import {
  mockUser,
  mockQuest,
  mockCategory,
  mockObjective,
  createMockUser,
  createMockQuest,
} from './mocks/fixtures'
import {
  createMockSupabaseClient,
  createMockQueryBuilder,
  mockSession,
} from './mocks/supabase'

describe('Test Infrastructure Smoke Tests', () => {
  describe('Fixtures', () => {
    it('should have valid mockUser fixture', () => {
      expect(mockUser).toBeDefined()
      expect(mockUser.id).toBe('user-123')
      expect(mockUser.email).toBe('adventurer@guildmail.com')
      expect(mockUser.display_name).toBe('Test Adventurer')
    })

    it('should have valid mockQuest fixture', () => {
      expect(mockQuest).toBeDefined()
      expect(mockQuest.id).toBe('quest-001')
      expect(mockQuest.title).toBe('Defeat the Dragon')
      expect(mockQuest.status).toBe('published')
      expect(mockQuest.points).toBe(500)
    })

    it('should have valid mockCategory fixture', () => {
      expect(mockCategory).toBeDefined()
      expect(mockCategory.id).toBe('category-001')
      expect(mockCategory.name).toBe('Combat')
    })

    it('should have valid mockObjective fixture', () => {
      expect(mockObjective).toBeDefined()
      expect(mockObjective.id).toBe('objective-001')
      expect(mockObjective.quest_id).toBe('quest-001')
      expect(mockObjective.evidence_required).toBe(true)
    })

    it('should create custom user with factory function', () => {
      const customUser = createMockUser({
        email: 'custom@example.com',
        display_name: 'Custom User',
      })

      expect(customUser.email).toBe('custom@example.com')
      expect(customUser.display_name).toBe('Custom User')
      expect(customUser.id).toContain('user-')
    })

    it('should create custom quest with factory function', () => {
      const customQuest = createMockQuest({
        title: 'Custom Quest',
        status: 'draft',
        points: 1000,
      })

      expect(customQuest.title).toBe('Custom Quest')
      expect(customQuest.status).toBe('draft')
      expect(customQuest.points).toBe(1000)
    })
  })

  describe('Supabase Mocks', () => {
    it('should create mock Supabase client', () => {
      const client = createMockSupabaseClient()

      expect(client).toBeDefined()
      expect(client.auth).toBeDefined()
      expect(client.from).toBeDefined()
      expect(client.storage).toBeDefined()
    })

    it('should mock auth methods', async () => {
      const client = createMockSupabaseClient()

      const { data, error } = await client.auth.getSession()
      expect(error).toBeNull()
      expect(data.session).toBeNull()
    })

    it('should mock signInWithPassword', async () => {
      const client = createMockSupabaseClient()

      const { data, error } = await client.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123',
      })

      expect(error).toBeNull()
      expect(data.session).toEqual(mockSession)
    })

    it('should create mock query builder', async () => {
      const mockData = [{ id: '1', name: 'Test' }]
      const builder = createMockQueryBuilder(mockData)

      expect(builder.select).toBeDefined()
      expect(builder.eq).toBeDefined()
      expect(builder.single).toBeDefined()

      const result = await builder.single()
      expect(result.data).toEqual(mockData[0])
    })

    it('should chain query builder methods', () => {
      const builder = createMockQueryBuilder()

      const result = builder
        .select('*')
        .eq('id', '123')
        .order('created_at', { ascending: false })
        .limit(10)

      expect(result).toBe(builder)
      expect(builder.select).toHaveBeenCalledWith('*')
      expect(builder.eq).toHaveBeenCalledWith('id', '123')
    })
  })

  describe('Vitest Globals', () => {
    it('should have vi available globally', () => {
      expect(vi).toBeDefined()
      expect(vi.fn).toBeDefined()
      expect(vi.mock).toBeDefined()
    })

    it('should have expect matchers from jest-dom', () => {
      // Create a simple DOM element for testing
      const element = document.createElement('div')
      element.textContent = 'Hello'
      document.body.appendChild(element)

      expect(element).toBeInTheDocument()
      expect(element).toHaveTextContent('Hello')

      document.body.removeChild(element)
    })
  })

  describe('Environment', () => {
    it('should have jsdom environment', () => {
      expect(typeof window).toBe('object')
      expect(typeof document).toBe('object')
    })

    it('should have mocked matchMedia', () => {
      const mediaQuery = window.matchMedia('(min-width: 768px)')
      expect(mediaQuery.matches).toBe(false)
      expect(mediaQuery.media).toBe('(min-width: 768px)')
    })

    it('should have mocked ResizeObserver', () => {
      const observer = new ResizeObserver(() => {})
      expect(observer.observe).toBeDefined()
      expect(observer.unobserve).toBeDefined()
      expect(observer.disconnect).toBeDefined()
    })

    it('should have mocked IntersectionObserver', () => {
      const observer = new IntersectionObserver(() => {})
      expect(observer.observe).toBeDefined()
      expect(observer.unobserve).toBeDefined()
      expect(observer.disconnect).toBeDefined()
    })
  })
})
