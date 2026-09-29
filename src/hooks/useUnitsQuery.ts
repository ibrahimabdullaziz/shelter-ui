import { useQuery } from "@tanstack/react-query";
import { getUnit, listUnits } from "../api/units";
import type { UnitFilters } from "../types/api";

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
  detail: (id: string) => ["units", "detail", id] as const,
};

export function useUnitsQuery(filters: UnitFilters) {
  return useQuery({
    queryKey: unitsQueryKeys.list(filters),
    queryFn: () => listUnits(filters),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}

export function useUnitQuery(id: string) {
  return useQuery({
    queryKey: unitsQueryKeys.detail(id),
    queryFn: () => getUnit(id),
    enabled: Boolean(id),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: false,
  });
}
