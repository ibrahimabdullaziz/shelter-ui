export const reviewKeys = {
  all: ["reviews"] as const,
  byUnit: (unitId: string) => [...reviewKeys.all, "unit", unitId] as const,
};
