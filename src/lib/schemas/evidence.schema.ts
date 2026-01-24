import { z } from 'zod'

/**
 * Schema for text evidence submission
 */
export const textEvidenceSchema = z.object({
  evidenceText: z
    .string()
    .min(10, 'Evidence must be at least 10 characters')
    .max(2000, 'Evidence must be less than 2000 characters'),
})

/**
 * Schema for URL evidence submission
 */
export const urlEvidenceSchema = z.object({
  evidenceUrl: z
    .string()
    .url('Please enter a valid URL')
    .min(1, 'URL is required'),
})

/**
 * Combined evidence schema - at least one of text or URL must be provided
 */
export const evidenceSchema = z.object({
  userObjectiveId: z.string().min(1, 'Objective ID is required'),
  evidenceText: z.string().optional(),
  evidenceUrl: z.string().url().optional(),
}).refine(
  (data) => data.evidenceText || data.evidenceUrl,
  { message: 'Either text evidence or URL evidence is required' }
)

export type EvidenceFormData = z.infer<typeof evidenceSchema>
export type TextEvidenceFormData = z.infer<typeof textEvidenceSchema>
export type UrlEvidenceFormData = z.infer<typeof urlEvidenceSchema>
