import { useQuery } from "@tanstack/react-query";
import type { UnitFilters } from "../types/api";
import { listUnits } from "../api/units";

export const unitsQueryKeys = {
  list: (filters: UnitFilters) => ["units", "list", filters] as const,
};

export function useUnitsQuery(filters: UnitFilters) {
  return useQuery({
    queryKey: unitsQueryKeys.list(filters),
    queryFn: () => listUnits(filters),
  });
}
