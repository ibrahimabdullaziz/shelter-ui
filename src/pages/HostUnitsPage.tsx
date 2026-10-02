import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listCategories, listCities, listCurrencies } from "../api/catalog";
import { listMyUnits } from "../api/units";
import { HostUnitForm } from "../components/features/units/HostUnitForm";
import {
  UnitPhotoUpload,
  type UploadedUnitPhoto,
} from "../components/features/units/UnitPhotoUpload";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { QueryErrorState } from "../components/ui/QueryErrorState";
import { StatusBadge } from "../components/ui/StatusBadge";
import { useHostUnitMutations } from "../hooks/useHostUnitMutations";
import { getApiErrorMessage } from "../lib/getApiErrorMessage";
import { catalogKeys } from "../queries/catalogKeys";
import { unitKeys } from "../queries/unitKeys";
import type { CreateUnitPayload, Unit } from "../types/api";

export default function HostUnitsPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [uploadedPhotosByUnit, setUploadedPhotosByUnit] = useState<
    Record<string, UploadedUnitPhoto[]>
  >({});
  const unitsQuery = useQuery({
    queryKey: unitKeys.mine(),
    queryFn: listMyUnits,
    staleTime: 30_000,
  });
  const citiesQuery = useQuery({
    queryKey: catalogKeys.cities(),
    queryFn: listCities,
    staleTime: 5 * 60_000,
  });
  const categoriesQuery = useQuery({
    queryKey: catalogKeys.categories(),
    queryFn: listCategories,
    staleTime: 5 * 60_000,
  });
  const currenciesQuery = useQuery({
    queryKey: catalogKeys.currencies(),
    queryFn: listCurrencies,
    staleTime: 5 * 60_000,
  });
  const units = unitsQuery.data ?? [];
  const cities = citiesQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const currencies = currenciesQuery.data ?? [];
  const unitMutations = useHostUnitMutations();
  const catalogsLoading =
    citiesQuery.isLoading ||
    categoriesQuery.isLoading ||
    currenciesQuery.isLoading;
  const catalogsHaveError =
    citiesQuery.isError || categoriesQuery.isError || currenciesQuery.isError;
  const catalogsReady =
    !catalogsLoading &&
    !catalogsHaveError &&
    cities.length > 0 &&
    categories.length > 0 &&
    currencies.length > 0;
  const closeEditor = () => {
    setIsCreating(false);
    setEditingUnit(null);
  };
  const operationError = [
    unitMutations.setActive.error,
    unitMutations.remove.error,
  ].find(Boolean);
  const isMutating =
    unitMutations.create.isPending ||
    unitMutations.update.isPending ||
    unitMutations.setActive.isPending ||
    unitMutations.remove.isPending;
  const retryCatalogQueries = () => {
    void Promise.all([
      citiesQuery.refetch(),
      categoriesQuery.refetch(),
      currenciesQuery.refetch(),
    ]);
  };
  const handleSubmit = (payload: CreateUnitPayload) => {
    if (editingUnit) {
      unitMutations.update.mutate(
        { id: editingUnit.id, payload },
        { onSuccess: closeEditor },
      );
    } else {
      unitMutations.create.mutate(payload, { onSuccess: closeEditor });
    }
  };

  return (
    <section className="host-page-section" aria-labelledby="host-units-title">
      <div className="host-page-heading">
        <div className="host-page-heading-row">
          <div>
            <p className="host-kicker">Your inventory</p>
            <h2 id="host-units-title">My Units</h2>
            <p>Manage the places you share with guests.</p>
          </div>
          {!isCreating && !editingUnit && (
            <Button
              variant="primary"
              type="button"
              onClick={() => setIsCreating(true)}
            >
              Add unit
            </Button>
          )}
        </div>
      </div>
      {(isCreating || editingUnit) && (
        <HostUnitForm
          key={editingUnit?.id ?? "new-unit"}
          unit={editingUnit ?? undefined}
          cities={cities}
          categories={categories}
          currencies={currencies}
          catalogsLoading={catalogsLoading}
          catalogsReady={catalogsReady}
          catalogsHaveError={catalogsHaveError}
          isPending={
            unitMutations.create.isPending || unitMutations.update.isPending
          }
          error={unitMutations.create.error ?? unitMutations.update.error}
          onRetryCatalogs={retryCatalogQueries}
          onSubmit={handleSubmit}
          onCancel={closeEditor}
        />
      )}
      {operationError != null && (
        <p className="host-operation-error" role="alert">
          {getApiErrorMessage(operationError)}
        </p>
      )}
      {catalogsHaveError && !isCreating && !editingUnit && (
        <QueryErrorState
          error={
            citiesQuery.error ?? categoriesQuery.error ?? currenciesQuery.error
          }
          onRetry={retryCatalogQueries}
        />
      )}
      {unitsQuery.isLoading ? (
        <p role="status">Loading your units...</p>
      ) : unitsQuery.isError ? (
        <QueryErrorState
          error={unitsQuery.error}
          onRetry={() => void unitsQuery.refetch()}
        />
      ) : units.length === 0 ? (
        <EmptyState
          icon="⌂"
          title="No units listed yet"
          description="Create a listing to start welcoming guests."
          action={
            <Button
              type="button"
              variant="primary"
              onClick={() => setIsCreating(true)}
            >
              Add your first unit
            </Button>
          }
        />
      ) : (
        <div className="host-list">
          {units.map((unit) => (
            <UnitRow
              key={unit.id}
              unit={unit}
              currencyCode={
                currencies.find((currency) => currency.id === unit.currencyId)
                  ?.code
              }
              isMutating={isMutating}
              uploadedPhotos={uploadedPhotosByUnit[unit.id] ?? []}
              onPhotoUploaded={(uploadedPhoto) => {
                setUploadedPhotosByUnit((current) => ({
                  ...current,
                  [unit.id]: [...(current[unit.id] ?? []), uploadedPhoto],
                }));
              }}
              onEdit={() => {
                unitMutations.create.reset();
                unitMutations.update.reset();
                setIsCreating(false);
                setEditingUnit(unit);
              }}
              onActivate={() =>
                unitMutations.setActive.mutate({ id: unit.id, isActive: true })
              }
              onDeactivate={() =>
                unitMutations.setActive.mutate({ id: unit.id, isActive: false })
              }
              onDelete={() => {
                if (
                  window.confirm(
                    `Delete "${unit.title}"? This cannot be undone.`,
                  )
                ) {
                  unitMutations.remove.mutate(unit.id, {
                    onSuccess: () => {
                      setUploadedPhotosByUnit((current) => {
                        const next = { ...current };
                        delete next[unit.id];
                        return next;
                      });
                    },
                  });
                }
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}

interface UnitRowProps {
  unit: Unit;
  currencyCode?: string;
  isMutating: boolean;
  uploadedPhotos: UploadedUnitPhoto[];
  onPhotoUploaded: (photo: UploadedUnitPhoto) => void;
  onEdit: () => void;
  onActivate: () => void;
  onDeactivate: () => void;
  onDelete: () => void;
}

function UnitRow({
  unit,
  currencyCode,
  isMutating,
  uploadedPhotos,
  onPhotoUploaded,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
}: UnitRowProps) {
  const status =
    unit.isActive === undefined
      ? "Status unavailable"
      : unit.isActive
        ? "Active"
        : "Inactive";
  const price = currencyCode
    ? new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: currencyCode,
      }).format(unit.pricePerNight)
    : unit.pricePerNight.toFixed(2);

  return (
    <div className="host-unit-entry">
      <div className="host-list-row">
        <div>
          <h3>{unit.title}</h3>
          <p>
            {price} / night · {unit.maxGuests} guests
          </p>
        </div>
        <div className="host-unit-controls">
          <StatusBadge
            tone={
              unit.isActive === undefined || !unit.isActive
                ? "neutral"
                : "positive"
            }
          >
            {status}
          </StatusBadge>
          <div className="host-unit-actions">
            <Button
              type="button"
              size="small"
              disabled={isMutating}
              onClick={onEdit}
            >
              Edit
            </Button>
            {unit.isActive ? (
              <Button
                size="small"
                type="button"
                disabled={isMutating}
                onClick={onDeactivate}
              >
                Deactivate
              </Button>
            ) : (
              <Button
                size="small"
                type="button"
                disabled={isMutating}
                onClick={onActivate}
              >
                Activate
              </Button>
            )}
            <Button
              variant="danger"
              size="small"
              type="button"
              disabled={isMutating}
              onClick={onDelete}
            >
              Delete
            </Button>
            <UnitPhotoUpload
              unitId={unit.id}
              photos={uploadedPhotos}
              onPhotoUploaded={onPhotoUploaded}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
