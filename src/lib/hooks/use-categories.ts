'use client'

import { useQuery } from '@tanstack/react-query'
import type { Category } from '@/lib/types/quest'

// Default categories while the categories table doesn't exist in the database
const defaultCategories: Category[] = [
  {
    id: 'cat-combat',
    name: 'Combat',
    description: 'Battle quests involving fighting enemies',
    icon: 'sword',
    color: '#dc2626',
    display_order: 0,
    created_at: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'cat-exploration',
    name: 'Exploration',
    description: 'Quests involving discovering new places',
    icon: 'compass',
    color: '#2563eb',
    display_order: 1,
    created_at: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'cat-gathering',
    name: 'Gathering',
    description: 'Quests involving collecting items or resources',
    icon: 'backpack',
    color: '#16a34a',
    display_order: 2,
    created_at: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'cat-social',
    name: 'Social',
    description: 'Quests involving interaction with others',
    icon: 'users',
    color: '#9333ea',
    display_order: 3,
    created_at: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'cat-mystery',
    name: 'Mystery',
    description: 'Quests involving solving puzzles and mysteries',
    icon: 'scroll',
    color: '#ca8a04',
    display_order: 4,
    created_at: '2024-01-01T00:00:00.000Z',
  },
]

/**
 * Fetch all categories
 * Currently returns default categories until the categories table is added to the database
 */
async function fetchCategories(): Promise<Category[]> {
  // TODO: When categories table is added to the database:
  // const supabase = createClient()
  // const { data, error } = await supabase
  //   .from('categories')
  //   .select('*')
  //   .order('name', { ascending: true })
  // if (error) throw error
  // return data || []

  // For now, return default categories
  return Promise.resolve(defaultCategories)
}

/**
 * React Query hook to fetch all categories
 */
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
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

/**
 * Export default categories for static usage (e.g., in filters)
 */
export { defaultCategories }
