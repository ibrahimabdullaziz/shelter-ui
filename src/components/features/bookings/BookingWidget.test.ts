import { describe, expect, it } from "vitest";
import { calculateBookingPrice } from "./bookingDateUtils";

describe("calculateBookingPrice", () => {
  it("calculates nights and total for a valid date range", () => {
    expect(calculateBookingPrice("2026-10-10", "2026-10-13", 120)).toEqual({
      nights: 3,
      totalPrice: 360,
    });
  });

  it("counts calendar nights consistently across daylight-saving boundaries", () => {
    expect(calculateBookingPrice("2026-03-07", "2026-03-09", 120)).toEqual({
      nights: 2,
      totalPrice: 240,
    });
  });

  it("rejects an invalid range", () => {
    expect(calculateBookingPrice("2026-10-13", "2026-10-10", 120)).toEqual({
      nights: 0,
      totalPrice: 0,
    });
  });

  it("rejects invalid or negative prices", () => {
    expect(calculateBookingPrice("2026-10-10", "2026-10-13", -1)).toEqual({
      nights: 0,
      totalPrice: 0,
    });
    expect(
      calculateBookingPrice("2026-10-10", "2026-10-13", Number.NaN),
    ).toEqual({ nights: 0, totalPrice: 0 });
  });
});
