import { z } from "zod";

export const createItemSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional().default("")
});

export const updateItemSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(1000).optional()
  })
  .refine((d) => Object.keys(d).length > 0, { message: "At least one field is required" });

export const listQuerySchema = z.object({
  search: z.string().optional(),
  sort: z.enum(["name", "createdAt", "updatedAt"]).optional().default("createdAt"),
  order: z.enum(["asc", "desc"]).optional().default("desc"),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0)
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
export type ListQueryInput = z.infer<typeof listQuerySchema>;
