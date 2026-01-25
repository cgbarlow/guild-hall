'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Category } from '@/lib/types/quest'

// Type for category row from database
type CategoryRow = {
  id: string
  name: string
  description: string | null
  icon: string | null
  color: string | null
  display_order: number | null
  created_at: string
}

/**
 * Fetch all categories from the database
 */
async function fetchCategories(): Promise<Category[]> {
  const supabase = createClient()
  const { data: rawData, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error)
    throw error
  }

  const data = (rawData || []) as unknown as CategoryRow[]

  // Transform to match Category interface
  return data.map((cat) => ({
    id: cat.id,
    name: cat.name,
    description: cat.description,
    icon: cat.icon,
    color: cat.color ?? undefined,
    display_order: cat.display_order ?? 0,
    created_at: cat.created_at,
  }))
}

/**
 * Fetch categories that have at least one published quest
 */
async function fetchCategoriesWithQuests(): Promise<Category[]> {
  const supabase = createClient()

  // Get all categories with their quest counts
  const { data: rawData, error } = await supabase
    .from('categories')
    .select(`
      *,
      quests!inner(id)
    `)
    .eq('quests.status', 'published')
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching categories with quests:', error)
    // Fall back to all categories
    return fetchCategories()
  }

  const data = (rawData || []) as unknown as CategoryRow[]

  // Transform to match Category interface (deduplicate since inner join returns multiple rows)
  const uniqueCategories = new Map<string, Category>()
  data.forEach((cat) => {
    if (!uniqueCategories.has(cat.id)) {
      uniqueCategories.set(cat.id, {
        id: cat.id,
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        color: cat.color ?? undefined,
        display_order: cat.display_order ?? 0,
        created_at: cat.created_at,
      })
    }
  })

  return Array.from(uniqueCategories.values()).sort((a, b) => a.display_order - b.display_order)
}

/**
 * React Query hook to fetch all categories
 * @param options.onlyWithQuests - If true, only return categories that have published quests
 */
export function useCategories(options?: { onlyWithQuests?: boolean }) {
  const { onlyWithQuests = false } = options ?? {}

  return useQuery({
    queryKey: ['categories', { onlyWithQuests }],
    queryFn: onlyWithQuests ? fetchCategoriesWithQuests : fetchCategories,
    // Categories don't change often, so we can cache them for longer
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Get a single category by ID
 */
export function useCategoryById(categoryId: string | null | undefined) {
  const categoriesQuery = useCategories()

  const category = categoryId
    ? categoriesQuery.data?.find((cat) => cat.id === categoryId)
    : null

  return {
    ...categoriesQuery,
    data: category,
  }
}
