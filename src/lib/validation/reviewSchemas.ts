import { z } from "zod";

export const createReviewSchema = z.object({
  rating: z.number().int().min(1, "Choose a rating.").max(5),
  comment: z.string().trim().optional(),
});

export type CreateReviewFormValues = z.infer<typeof createReviewSchema>;
