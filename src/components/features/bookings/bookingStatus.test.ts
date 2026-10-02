import { describe, expect, it } from "vitest";
import { getAvailableBookingActions } from "./bookingStatus";

describe("booking status actions", () => {
  it("allows guests to cancel pending bookings only", () => {
    expect(getAvailableBookingActions("PENDING", "guest")).toEqual(["cancel"]);
    expect(getAvailableBookingActions("CONFIRMED", "guest")).toEqual([]);
    expect(getAvailableBookingActions("REJECTED", "guest")).toEqual([]);
    expect(getAvailableBookingActions("CANCELLED", "guest")).toEqual([]);
    expect(getAvailableBookingActions("COMPLETED", "guest")).toEqual([]);
  });

  it("allows hosts to confirm or reject pending bookings only", () => {
    expect(getAvailableBookingActions("PENDING", "host")).toEqual([
      "confirm",
      "reject",
    ]);
    expect(getAvailableBookingActions("CONFIRMED", "host")).toEqual([]);
    expect(getAvailableBookingActions("REJECTED", "host")).toEqual([]);
    expect(getAvailableBookingActions("CANCELLED", "host")).toEqual([]);
    expect(getAvailableBookingActions("COMPLETED", "host")).toEqual([]);
  });
});
