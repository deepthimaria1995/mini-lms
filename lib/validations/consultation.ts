import { z } from "zod";

// Schema for creating a consultation
export const createConsultationSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(5, "Reason must be at least 5 characters")
    .max(500, "Reason cannot exceed 500 characters"),

  scheduled_at: z
    .string()
    .datetime({ offset: true })
    .refine(
      (value) => new Date(value).getTime() > Date.now(),
      "Consultation must be scheduled in the future"
    ),
});

// Schema for updating a consultation
export const updateConsultationSchema = z
  .object({
    reason: z
      .string()
      .trim()
      .min(5)
      .max(500)
      .optional(),

    scheduled_at: z
      .string()
      .datetime({ offset: true })
      .refine(
        (value) => new Date(value).getTime() > Date.now(),
        "Consultation must be scheduled in the future"
      )
      .optional(),

    is_completed: z.boolean().optional(),

    status: z.enum(["scheduled", "completed", "cancelled"]).optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided"
  );

export const consultationIdSchema = z.string().uuid();

export type CreateConsultationInput = z.infer<
  typeof createConsultationSchema
>;

export type UpdateConsultationInput = z.infer<
  typeof updateConsultationSchema
>;