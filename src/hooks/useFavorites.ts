import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addFavorite,
  listFavoriteUnitIds,
  removeFavorite,
} from "../api/favorites";

export const favoriteQueryKeys = {
  all: () => ["favorites"] as const,
  mine: () => [...favoriteQueryKeys.all(), "mine"] as const,
  toggle: () => [...favoriteQueryKeys.all(), "toggle"] as const,
};

export function useFavoriteUnitIds(enabled: boolean) {
  return useQuery({
    queryKey: favoriteQueryKeys.mine(),
    queryFn: listFavoriteUnitIds,
    enabled,
    staleTime: 30_000,
    retry: false,
  });
}

interface ToggleFavoriteVariables {
  unitId: string;
  isFavorite: boolean;
}

interface ToggleFavoriteContext {
  previousFavorites: string[] | undefined;
}

export function useToggleFavoriteMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    unknown,
    ToggleFavoriteVariables,
    ToggleFavoriteContext
  >({
    mutationKey: favoriteQueryKeys.toggle(),
    mutationFn: ({ unitId, isFavorite }) =>
      isFavorite ? removeFavorite(unitId) : addFavorite(unitId),
    onMutate: async ({ unitId, isFavorite }) => {
      await queryClient.cancelQueries({ queryKey: favoriteQueryKeys.mine() });
      const previousFavorites = queryClient.getQueryData<string[]>(
        favoriteQueryKeys.mine(),
      );
      queryClient.setQueryData<string[]>(
        favoriteQueryKeys.mine(),
        (currentFavorites = []) => {
          const nextFavorites = new Set(currentFavorites);
          if (isFavorite) nextFavorites.delete(unitId);
          else nextFavorites.add(unitId);
          return [...nextFavorites];
        },
      );

      return { previousFavorites };
    },
    onError: (_error, { unitId }, context) => {
      if (!context) return;

      queryClient.setQueryData<string[]>(
        favoriteQueryKeys.mine(),
        (currentFavorites = []) => {
          const nextFavorites = new Set(currentFavorites);
          const wasFavorite =
            context.previousFavorites?.includes(unitId) ?? false;
          if (wasFavorite) nextFavorites.add(unitId);
          else nextFavorites.delete(unitId);
          return [...nextFavorites];
        },
      );
    },
    onSettled: () => {
      if (
        queryClient.isMutating({ mutationKey: favoriteQueryKeys.toggle() }) <= 1
      ) {
        return queryClient.invalidateQueries({
          queryKey: favoriteQueryKeys.mine(),
        });
      }
    },
  });
}
