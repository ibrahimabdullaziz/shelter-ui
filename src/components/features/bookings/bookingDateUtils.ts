export interface BookingPrice {
  nights: number;
  totalPrice: number;
}

const millisecondsPerDay = 86_400_000;

export function parseDateOnlyUtc(value: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (year < 100) date.setUTCFullYear(year);

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date.getTime();
}

function getBookingDateOnly(value: string): string | null {
  const dateOnly = value.slice(0, 10);
  if (parseDateOnlyUtc(dateOnly) === null) return null;
  if (value.length === 10) return dateOnly;
  if (!/^T.+(?:Z|[+-]\d{2}:\d{2})$/.test(value.slice(10))) return null;
  return Number.isFinite(Date.parse(value)) ? dateOnly : null;
}

function parseBookingDateUtc(value: string): number | null {
  const dateOnly = getBookingDateOnly(value);
  return dateOnly === null ? null : parseDateOnlyUtc(dateOnly);
}

export function toApiDateOnly(value: string): string | null {
  const timestamp = parseDateOnlyUtc(value);
  return timestamp === null
    ? null
    : new Date(timestamp).toISOString().slice(0, 10);
}

export function formatBookingDate(value: string): string {
  const dateOnly = getBookingDateOnly(value);
  const timestamp =
    dateOnly === null ? null : parseDateOnlyUtc(dateOnly);
  if (timestamp === null) return value;

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(timestamp);
}

export function getLocalDateToday(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getTomorrow(dateValue: string): string {
  const timestamp = parseDateOnlyUtc(dateValue);
  return timestamp === null
    ? ""
    : new Date(timestamp + millisecondsPerDay).toISOString().slice(0, 10);
}

export function isDateRangeValid(
  checkIn: string,
  checkOut: string,
  today: string,
): boolean {
  const checkInTime = parseBookingDateUtc(checkIn);
  const checkOutTime = parseBookingDateUtc(checkOut);
  const todayTime = parseDateOnlyUtc(today);

  return (
    checkInTime !== null &&
    checkOutTime !== null &&
    todayTime !== null &&
    checkInTime >= todayTime &&
    checkOutTime > checkInTime
  );
}

export function getBookingDateErrors(
  checkIn: string,
  checkOut: string,
  today: string,
) {
  const todayTime = parseDateOnlyUtc(today);
  const checkInTime = parseBookingDateUtc(checkIn);
  const checkOutTime = parseBookingDateUtc(checkOut);

  const checkInError = !checkIn
    ? ""
    : checkInTime === null
      ? "Enter a valid check-in date."
      : todayTime !== null && checkInTime < todayTime
        ? "Check-in cannot be in the past."
        : "";

  const checkOutError = !checkOut
    ? ""
    : checkOutTime === null
      ? "Enter a valid check-out date."
      : todayTime !== null && checkOutTime < todayTime
        ? "Check-out cannot be in the past."
        : checkInTime !== null && checkOutTime <= checkInTime
          ? "Check-out must be after check-in."
          : "";

  return { checkInError, checkOutError };
}

export function calculateBookingPrice(
  checkIn: string,
  checkOut: string,
  pricePerNight: number,
): BookingPrice {
  if (!Number.isFinite(pricePerNight) || pricePerNight < 0) {
    return { nights: 0, totalPrice: 0 };
  }

  const checkInTime = parseBookingDateUtc(checkIn);
  const checkOutTime = parseBookingDateUtc(checkOut);
  if (
    checkInTime === null ||
    checkOutTime === null ||
    checkOutTime <= checkInTime
  ) {
    return { nights: 0, totalPrice: 0 };
  }

  const nights = (checkOutTime - checkInTime) / millisecondsPerDay;
  return { nights, totalPrice: nights * pricePerNight };
}

export function formatCurrency(amount: number, currencyCode?: string): string {
  if (!Number.isFinite(amount)) return "Price unavailable";
  if (!currencyCode) return `${amount.toFixed(2)} (currency unavailable)`;

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currencyCode} (currency unavailable)`;
  }
}
