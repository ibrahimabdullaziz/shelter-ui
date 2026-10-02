import { describe, expect, it } from "vitest";
import { createReviewSchema } from "./reviewSchemas";

describe("create review schema", () => {
  it("accepts a valid rating with an optional comment", () => {
    expect(createReviewSchema.safeParse({ rating: 5 }).success).toBe(true);
    expect(
      createReviewSchema.safeParse({ rating: 4, comment: "Lovely stay" })
        .success,
    ).toBe(true);
  });

  it("rejects ratings outside the API's one-to-five range", () => {
    expect(createReviewSchema.safeParse({ rating: 0 }).success).toBe(false);
    expect(createReviewSchema.safeParse({ rating: 6 }).success).toBe(false);
    expect(createReviewSchema.safeParse({ rating: 3.5 }).success).toBe(false);
  });
});
