import { describe, expect, it } from "vitest";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "./authSchemas";

describe("auth recovery schemas", () => {
  it("accepts a valid email verification code", () => {
    expect(
      verifyEmailSchema.safeParse({
        email: "guest@example.com",
        code: "123456",
      }).success,
    ).toBe(true);
  });

  it("rejects malformed email and non-six-digit codes", () => {
    expect(
      verifyEmailSchema.safeParse({ email: "not-an-email", code: "12ab" })
        .success,
    ).toBe(false);
  });

  it("requires matching passwords for reset", () => {
    expect(
      resetPasswordSchema.safeParse({
        email: "guest@example.com",
        code: "123456",
        password: "StrongPass123",
        confirmPassword: "DifferentPass123",
      }).success,
    ).toBe(false);
  });

  it("accepts a valid password reset request email", () => {
    expect(
      forgotPasswordSchema.safeParse({ email: "guest@example.com" }).success,
    ).toBe(true);
  });
});
