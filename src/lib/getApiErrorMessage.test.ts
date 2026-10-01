import { describe, expect, it } from "vitest";
import { getApiErrorMessage } from "./getApiErrorMessage";

function makeAxiosError(status: number | undefined, message?: string) {
  return {
    isAxiosError: true,
    response: status === undefined ? undefined : { status, data: { message } },
  };
}

describe("getApiErrorMessage", () => {
  it("keeps a human-readable server message", () => {
    expect(
      getApiErrorMessage(makeAxiosError(400, "Dates are unavailable.")),
    ).toBe("Dates are unavailable.");
  });

  it("hides technical server messages", () => {
    expect(getApiErrorMessage(makeAxiosError(500, "Error: 500"))).toBe(
      "The service is temporarily unavailable. Please try again.",
    );
    expect(
      getApiErrorMessage(
        makeAxiosError(400, "Error: Request failed with status code 400"),
      ),
    ).toBe("Something went wrong. Please try again.");
  });

  it("gives network failures a readable message", () => {
    expect(getApiErrorMessage(makeAxiosError(undefined))).toBe(
      "We couldn't reach the service. Check your connection and try again.",
    );
  });

  it("does not expose arbitrary exception messages", () => {
    expect(getApiErrorMessage(new Error("Error: 500"))).toBe(
      "Something went wrong. Please try again.",
    );
  });
});
