export const catalogKeys = {
  all: ["catalog"] as const,
  countries: () => [...catalogKeys.all, "countries"] as const,
  cities: () => [...catalogKeys.all, "cities"] as const,
  categories: () => [...catalogKeys.all, "categories"] as const,
  currencies: () => [...catalogKeys.all, "currencies"] as const,
};
