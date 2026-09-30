import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  activateUnit,
  createUnit,
  deactivateUnit,
  deleteUnit,
  updateUnit,
} from "../api/units";
import type { CreateUnitPayload, Unit } from "../types/api";
import { unitKeys } from "../queries/unitKeys";

interface UnitSnapshot {
  mine: Unit[] | undefined;
  detail: Unit | undefined;
}

interface UnitUpdateVariables {
  id: string;
  payload: CreateUnitPayload;
}

interface UnitStatusVariables {
  id: string;
  isActive: boolean;
}

async function invalidateUnits(queryClient: ReturnType<typeof useQueryClient>) {
  await queryClient.invalidateQueries({ queryKey: unitKeys.all });
}

async function snapshotUnit(
  queryClient: ReturnType<typeof useQueryClient>,
  id: string,
): Promise<UnitSnapshot> {
  await queryClient.cancelQueries({ queryKey: unitKeys.all });
  return {
    mine: queryClient.getQueryData<Unit[]>(unitKeys.mine()),
    detail: queryClient.getQueryData<Unit>(unitKeys.detail(id)),
  };
}

function rollbackUnit(
  queryClient: ReturnType<typeof useQueryClient>,
  id: string,
  snapshot?: UnitSnapshot,
) {
  if (!snapshot) return;
  if (snapshot.mine) queryClient.setQueryData(unitKeys.mine(), snapshot.mine);
  if (snapshot.detail) queryClient.setQueryData(unitKeys.detail(id), snapshot.detail);
}

function setUnitInCaches(
  queryClient: ReturnType<typeof useQueryClient>,
  id: string,
  update: (unit: Unit) => Unit | null,
) {
  queryClient.setQueryData<Unit[]>(unitKeys.mine(), (units) =>
    units?.flatMap((unit) => {
      if (unit.id !== id) return [unit];
      const updatedUnit = update(unit);
      return updatedUnit ? [updatedUnit] : [];
    }),
  );
  queryClient.setQueryData<Unit>(unitKeys.detail(id), (unit) =>
    unit ? update(unit) ?? undefined : undefined,
  );
}

export function useHostUnitMutations() {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationKey: [...unitKeys.mutations(), "create"],
    mutationFn: createUnit,
    onSettled: () => invalidateUnits(queryClient),
  });

  const update = useMutation<
    void,
    unknown,
    UnitUpdateVariables,
    UnitSnapshot
  >({
    mutationKey: [...unitKeys.mutations(), "update"],
    mutationFn: ({ id, payload }) => updateUnit(id, payload),
    onMutate: async ({ id, payload }) => {
      const snapshot = await snapshotUnit(queryClient, id);
      setUnitInCaches(queryClient, id, (unit) => ({ ...unit, ...payload }));
      return snapshot;
    },
    onError: (_error, { id }, snapshot) =>
      rollbackUnit(queryClient, id, snapshot),
    onSettled: () => invalidateUnits(queryClient),
  });

  const setActive = useMutation<
    void,
    unknown,
    UnitStatusVariables,
    UnitSnapshot
  >({
    mutationKey: [...unitKeys.mutations(), "status"],
    mutationFn: ({ id, isActive }) =>
      isActive ? activateUnit(id) : deactivateUnit(id),
    onMutate: async ({ id, isActive }) => {
      const snapshot = await snapshotUnit(queryClient, id);
      setUnitInCaches(queryClient, id, (unit) => ({ ...unit, isActive }));
      return snapshot;
    },
    onError: (_error, { id }, snapshot) =>
      rollbackUnit(queryClient, id, snapshot),
    onSettled: () => invalidateUnits(queryClient),
  });

  const remove = useMutation<void, unknown, string, UnitSnapshot>({
    mutationKey: [...unitKeys.mutations(), "delete"],
    mutationFn: deleteUnit,
    onMutate: async (id) => {
      const snapshot = await snapshotUnit(queryClient, id);
      setUnitInCaches(queryClient, id, () => null);
      queryClient.removeQueries({
        queryKey: unitKeys.detail(id),
        exact: true,
      });
      return snapshot;
    },
    onError: (_error, id, snapshot) => rollbackUnit(queryClient, id, snapshot),
    onSettled: () => invalidateUnits(queryClient),
  });

  return { create, update, setActive, remove };
}