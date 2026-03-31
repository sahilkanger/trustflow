import { z } from "zod";

export const createSpaceSchema = z.object({
  name: z.string().min(1).max(100),
  website: z.string().url().optional().or(z.literal("")),
  description: z.string().max(500).optional(),
});

export const submitTestimonialSchema = z.object({
  text: z.string().min(10).max(2000),
  rating: z.number().min(1).max(5).optional(),
  authorName: z.string().min(1).max(100),
  authorEmail: z.string().email().optional().or(z.literal("")),
  authorTitle: z.string().max(100).optional(),
  authorCompany: z.string().max(100).optional(),
});

export const updateTestimonialSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "ARCHIVED"]).optional(),
  highlighted: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

export type CreateSpaceInput = z.infer<typeof createSpaceSchema>;
export type SubmitTestimonialInput = z.infer<typeof submitTestimonialSchema>;
export type UpdateTestimonialInput = z.infer<typeof updateTestimonialSchema>;
