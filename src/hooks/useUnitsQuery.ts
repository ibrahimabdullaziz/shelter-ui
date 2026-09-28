import { useQuery } from "@tanstack/react-query";
import { listUnits } from "../api/units";

export const unitsQueryKeys = {
  list: ["units", "list"] as const,
};

export function useUnitsQuery() {
  return useQuery({
    queryKey: unitsQueryKeys.list,
    queryFn: () => listUnits(),
  });
}
