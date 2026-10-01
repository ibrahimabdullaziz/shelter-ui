import { isAxiosError } from "axios";

const fallbackMessage = "Something went wrong. Please try again.";
const technicalMessagePattern =
  /^(?:error\b|\d{3}\b|axioserror\b|typeerror\b|referenceerror\b|syntaxerror\b|fetcherror\b|request failed\b|network error\b|internal server error\b|bad gateway\b|service unavailable\b|gateway timeout\b)/i;

export function getApiErrorMessage(error: unknown): string {
  if (isAxiosError<{ message?: unknown }>(error)) {
    const status = error.response?.status;

    if (!error.response) {
      return "We couldn't reach the service. Check your connection and try again.";
    }
    if (status === 401) return "Please sign in again to continue.";
    if (status === 403) return "You don't have permission to do that.";
    if (status === 404) return "We couldn't find what you were looking for.";
    if (status === 429)
      return "Too many requests. Please wait a moment and try again.";
    if (status !== undefined && status >= 500) {
      return "The service is temporarily unavailable. Please try again.";
    }

    const message = error.response?.data?.message;
    if (
      typeof message === "string" &&
      message.trim() &&
      message.trim().length <= 240 &&
      !technicalMessagePattern.test(message.trim())
    ) {
      return message.trim();
    }
  }

  return fallbackMessage;
}
