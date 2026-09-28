import { useQuery } from "@tanstack/react-query";
import { listUnits } from "../api/units";

export const unitsQueryKeys = {
  list: (page: number, limit: number) =>
    ["units", "list", { page, limit }] as const,
};

export function useUnitsQuery(page: number, limit: number) {
  return useQuery({
    queryKey: unitsQueryKeys.list(page, limit),
    queryFn: () => listUnits({ page, limit }),
  });
}
