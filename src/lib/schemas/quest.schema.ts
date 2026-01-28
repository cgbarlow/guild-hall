import { z } from 'zod'

/**
 * Quest difficulty levels
 */
export const questDifficultyEnum = z.enum(['Apprentice', 'Journeyman', 'Expert', 'Master'])
export type QuestDifficultyType = z.infer<typeof questDifficultyEnum>

/**
 * Schema for quest resource links
 */
export const questResourceSchema = z.object({
  title: z.string().min(1, 'Resource title is required').max(100),
  url: z.string().url('Must be a valid URL'),
})

/**
 * Schema for creating/updating quest basic info
 */
export const questSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be 100 characters or less'),
  description: z
    .string()
    .max(2000, 'Description must be 2000 characters or less')
    .nullable()
    .optional(),
  category_id: z.string().uuid('Invalid category').nullable().optional(),
  points: z
    .number()
    .int('Points must be a whole number')
    .min(0, 'Points cannot be negative')
    .max(10000, 'Points cannot exceed 10000')
    .default(100),
  reward_description: z
    .string()
    .max(500, 'Reward description must be 500 characters or less')
    .nullable()
    .optional(),
  difficulty: questDifficultyEnum.default('Apprentice'),
  resources: z.array(questResourceSchema).default([]),
  design_notes: z
    .string()
    .max(2000, 'Design notes must be 2000 characters or less')
    .nullable()
    .optional(),
  acceptance_deadline: z.string().datetime().nullable().optional(),
  completion_days: z
    .number()
    .int('Completion days must be a whole number')
    .min(1, 'Completion days must be at least 1')
    .max(365, 'Completion days cannot exceed 365')
    .nullable()
    .optional(),
  narrative_context: z
    .string()
    .max(1000, 'Narrative context must be 1000 characters or less')
    .nullable()
    .optional(),
  transformation_goal: z
    .string()
    .max(500, 'Transformation goal must be 500 characters or less')
    .nullable()
    .optional(),
  is_template: z.boolean().optional().default(false),
  template_id: z.string().uuid('Invalid template').nullable().optional(),
  featured: z.boolean().optional().default(false),
  is_exclusive: z.boolean().optional().default(false),
  exclusive_code: z
    .string()
    .max(50, 'Exclusive code must be 50 characters or less')
    .nullable()
    .optional(),
})

/**
 * Schema for quest form data (used by react-hook-form)
 * Input type allows optional fields, output has defaults applied
 */
export const questFormSchema = questSchema

/**
 * Schema for creating a new quest (minimal required fields)
 */
export const createQuestSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be 100 characters or less'),
  description: z.string().max(2000).nullable().optional(),
  category_id: z.string().uuid().nullable().optional(),
  points: z.number().int().min(0).max(10000).default(100),
  reward_description: z.string().max(500).nullable().optional(),
  difficulty: questDifficultyEnum.default('Apprentice'),
  resources: z.array(questResourceSchema).default([]),
  design_notes: z.string().max(2000).nullable().optional(),
  acceptance_deadline: z.string().datetime().nullable().optional(),
  completion_days: z.number().int().min(1).max(365).nullable().optional(),
  narrative_context: z.string().max(1000).nullable().optional(),
  transformation_goal: z.string().max(500).nullable().optional(),
  is_template: z.boolean().optional().default(false),
  template_id: z.string().uuid().nullable().optional(),
  featured: z.boolean().optional().default(false),
  is_exclusive: z.boolean().optional().default(false),
  exclusive_code: z.string().max(50).nullable().optional(),
})

/**
 * Schema for updating a quest (all fields optional)
 */
export const updateQuestSchema = questSchema.partial()

/**
 * Type for quest form data
 */
export type QuestFormData = z.infer<typeof questFormSchema>

/**
 * Type for creating a quest
 */
export type CreateQuestData = z.infer<typeof createQuestSchema>

/**
 * Type for updating a quest
 */
export type UpdateQuestData = z.infer<typeof updateQuestSchema>

/**
 * Schema for objective form data
 */
export const objectiveSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or less'),
  description: z
    .string()
    .max(1000, 'Description must be 1000 characters or less')
    .nullable()
    .optional(),
  points: z
    .number()
    .int('Points must be a whole number')
    .min(0, 'Points cannot be negative')
    .max(1000, 'Points cannot exceed 1000')
    .default(10),
  display_order: z.number().int().min(0).default(0),
  depends_on_id: z.string().uuid().nullable().optional(),
  evidence_required: z.boolean().default(false),
  evidence_type: z
    .enum(['none', 'text', 'link', 'text_or_link'])
    .default('none'),
  resource_url: z
    .string()
    .max(500, 'URL must be 500 characters or less')
    .refine((val) => !val || val.startsWith('http://') || val.startsWith('https://'), {
      message: 'Must be a valid URL starting with http:// or https://',
    })
    .nullable()
    .optional()
    .transform((val) => val || null),
})

/**
 * Schema for creating an objective
 */
export const createObjectiveSchema = objectiveSchema.extend({
  quest_id: z.string().uuid('Quest ID is required'),
})

/**
 * Type for objective form data
 */
export type ObjectiveFormData = z.infer<typeof objectiveSchema>

/**
 * Type for creating an objective
 */
export type CreateObjectiveData = z.infer<typeof createObjectiveSchema>
