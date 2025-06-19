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
  DocumentIndex: z.number(),
  FileName: z.string(),
  Status: z.string(),
  MatchedType: z.string(),
  Reason: z.string(),
  FraudRisk: z.enum(["low", "medium", "high"]),
  FraudNotes: z.string(),
});

export const validationResultSchema = z.object({
  AiValidationResult: z.object({
    DocumentValidations: z.array(documentValidationSchema),
    Suggestions: z.array(z.string()),
    Summary: z.string(),
    Storyline: z.string(),
  }),
  UnclassifiedFiles: z.array(z.string()),
});

export const uploadRequestSchema = z.object({
  familyId: z.string().min(1, "Family ID is required"),
});

export type DocumentValidation = z.infer<typeof documentValidationSchema>;
export type ValidationResult = z.infer<typeof validationResultSchema>;
export type UploadRequest = z.infer<typeof uploadRequestSchema>;
