import { useQuery } from "@tanstack/react-query";
import { getUnit, listUnits } from "../api/units";
import type { UnitFilters } from "../types/api";
import { unitKeys } from "../queries/unitKeys";

export const unitsQueryKeys = unitKeys;

export function unitQueryOptions(id: string) {
  return {
    queryKey: unitKeys.detail(id),
    queryFn: () => getUnit(id),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: false,
  } as const;
}

export function useUnitsQuery(filters: UnitFilters) {
  return useQuery({
    queryKey: unitKeys.list(filters),
    queryFn: () => listUnits(filters),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}

export function useUnitQuery(id: string) {
  return useQuery({
    ...unitQueryOptions(id),
    enabled: Boolean(id),
  });
}
