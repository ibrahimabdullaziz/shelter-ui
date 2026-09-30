import type { UnitFilters } from "../types/api";

export const unitKeys = {
  all: ["units"] as const,
  lists: () => [...unitKeys.all, "list"] as const,
  list: (filters: UnitFilters) =>
    [
      ...unitKeys.lists(),
      {
        page: filters.page ?? 1,
        limit: filters.limit ?? 12,
        cityId: filters.cityId ?? null,
        categoryId: filters.categoryId ?? null,
        minPrice: filters.minPrice ?? null,
        maxPrice: filters.maxPrice ?? null,
      },
    ] as const,
  mine: () => [...unitKeys.all, "mine"] as const,
  details: () => [...unitKeys.all, "detail"] as const,
  detail: (id: string) => [...unitKeys.details(), id] as const,
  mutations: () => [...unitKeys.all, "mutation"] as const,
  photoUpload: (id: string) =>
    [...unitKeys.mutations(), "photo-upload", id] as const,
};
