'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Category } from '@/lib/types/quest'

/**
 * Fetch all categories from the database
 */
async function fetchCategories(): Promise<Category[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error)
    throw error
  }

  // Transform to match Category interface
  return (data || []).map((cat) => ({
    id: cat.id,
    name: cat.name,
    description: cat.description,
    icon: cat.icon,
    display_order: cat.display_order ?? 0,
    created_at: cat.created_at,
  }))
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
