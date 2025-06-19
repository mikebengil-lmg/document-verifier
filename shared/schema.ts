import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Document validation schemas
export const documentValidationSchema = z.object({
  document_index: z.number(),
  file_name: z.string(),
  status: z.string(),
  matched_type: z.string(),
  reason: z.string(),
  fraud_risk: z.enum(["low", "medium", "high"]),
  fraud_notes: z.string(),
});

export const validationResultSchema = z.object({
  aiValidationResult: z.object({
    validations: z.array(documentValidationSchema),
    suggestions: z.array(z.string()),
    summary: z.string(),
    storyline: z.string(),
  }),
  unclassifiedFiles: z.array(z.string()),
});

export const uploadRequestSchema = z.object({
  familyId: z.string().min(1, "Family ID is required"),
});

export type DocumentValidation = z.infer<typeof documentValidationSchema>;
export type ValidationResult = z.infer<typeof validationResultSchema>;
export type UploadRequest = z.infer<typeof uploadRequestSchema>;
