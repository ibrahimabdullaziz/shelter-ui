import { useQuery } from "@tanstack/react-query";
import type { UnitFilters } from "../types/api";
import { listUnits } from "../api/units";

export const unitsQueryKeys = {
  list: (filters: UnitFilters) =>
    [
      "units",
      "list",
      {
        page: filters.page ?? 1,
        limit: filters.limit ?? 12,
        cityId: filters.cityId ?? null,
        categoryId: filters.categoryId ?? null,
        minPrice: filters.minPrice ?? null,
        maxPrice: filters.maxPrice ?? null,
      },
    ] as const,
};

export function useUnitsQuery(filters: UnitFilters) {
  return useQuery({
    queryKey: unitsQueryKeys.list(filters),
    queryFn: () => listUnits(filters),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}
