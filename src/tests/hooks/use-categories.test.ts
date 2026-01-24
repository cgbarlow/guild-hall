import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useCategories, useCategoryById, defaultCategories } from '@/lib/hooks/use-categories'
import { createWrapper } from '@/tests/utils/test-utils'

describe('useCategories', () => {
  it('should return default categories', async () => {
    const { result } = renderHook(() => useCategories(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toHaveLength(defaultCategories.length)
    expect(result.current.data).toEqual(defaultCategories)
  })

  it('should include expected category types', async () => {
    const { result } = renderHook(() => useCategories(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const categoryNames = result.current.data?.map((cat) => cat.name)
    expect(categoryNames).toContain('Combat')
    expect(categoryNames).toContain('Exploration')
    expect(categoryNames).toContain('Gathering')
  })

  it('should have valid category structure', async () => {
    const { result } = renderHook(() => useCategories(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const firstCategory = result.current.data?.[0]
    expect(firstCategory).toHaveProperty('id')
    expect(firstCategory).toHaveProperty('name')
    expect(firstCategory).toHaveProperty('description')
    expect(firstCategory).toHaveProperty('icon')
    expect(firstCategory).toHaveProperty('color')
    expect(firstCategory).toHaveProperty('created_at')
  })
})

describe('useCategoryById', () => {
  it('should return a category by ID', async () => {
    const { result } = renderHook(() => useCategoryById('cat-combat'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data?.id).toBe('cat-combat')
    expect(result.current.data?.name).toBe('Combat')
  })

  it('should return undefined for non-existent ID', async () => {
    const { result } = renderHook(() => useCategoryById('non-existent'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toBeUndefined()
  })

  it('should return null when categoryId is null', async () => {
    const { result } = renderHook(() => useCategoryById(null), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toBeNull()
  })

  it('should return null when categoryId is undefined', async () => {
    const { result } = renderHook(() => useCategoryById(undefined), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toBeNull()
  })
})

describe('defaultCategories', () => {
  it('should be exported and have items', () => {
    expect(defaultCategories).toBeDefined()
    expect(Array.isArray(defaultCategories)).toBe(true)
    expect(defaultCategories.length).toBeGreaterThan(0)
  })

  it('each category should have valid color hex code', () => {
    defaultCategories.forEach((category) => {
      expect(category.color).toMatch(/^#[0-9a-fA-F]{6}$/)
    })
  })
})
