import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { listHostBookings } from "../api/bookings";
import { listCategories, listCities, listCurrencies } from "../api/catalog";
import {
  activateUnit,
  createUnit,
  deactivateUnit,
  deleteUnit,
  listMyUnits,
  updateUnit,
} from "../api/units";
import { BookingActions } from "../components/features/bookings/BookingActions";
import { getApiErrorMessage } from "../lib/getApiErrorMessage";
import type { Booking, CreateUnitPayload, Unit } from "../types/api";
import { HostUnitForm } from "../components/features/units/HostUnitForm";
import "./HostDashboard.css";

const hostNavigation = [
  { to: "/host", label: "Overview", end: true },
  { to: "/host/units", label: "My Units", end: false },
  { to: "/host/bookings", label: "Bookings", end: false },
];

export default function HostDashboard() {
  return (
    <div className="host-dashboard">
      <header className="host-header">
        <div>
          <p className="host-kicker">Shelter / Host</p>
          <h1>Host dashboard</h1>
        </div>
        <Link className="host-marketplace-link" to="/units">
          Browse marketplace
        </Link>
      </header>

      <div className="host-layout">
        <nav className="host-nav" aria-label="Host dashboard">
          {hostNavigation.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `host-nav-link${isActive ? " is-active" : ""}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <main className="host-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function HostOverviewPage() {
  const unitsQuery = useQuery({
    queryKey: ["units", "mine"],
    queryFn: listMyUnits,
    staleTime: 30_000,
  });
  const bookingsQuery = useQuery({
    queryKey: ["bookings", "host"],
    queryFn: listHostBookings,
    staleTime: 30_000,
  });

  return (
    <section
      className="host-page-section"
      aria-labelledby="host-overview-title"
    >
      <div className="host-page-heading">
        <p className="host-kicker">Your workspace</p>
        <h2 id="host-overview-title">Overview</h2>
        <p>Keep track of your listings and incoming booking requests.</p>
      </div>

      <div className="host-stat-grid">
        <Link className="host-stat" to="/host/units">
          <span className="host-stat-label">My units</span>
          <strong>
            {getQueryCount(
              unitsQuery.isLoading,
              unitsQuery.isError,
              unitsQuery.data?.length,
            )}
          </strong>
          <span className="host-stat-link">View listings</span>
        </Link>
        <Link className="host-stat" to="/host/bookings">
          <span className="host-stat-label">Pending requests</span>
          <strong>
            {getQueryCount(
              bookingsQuery.isLoading,
              bookingsQuery.isError,
              bookingsQuery.data?.filter(
                (booking) => booking.status === "PENDING",
              ).length,
            )}
          </strong>
          <span className="host-stat-link">Review bookings</span>
        </Link>
      </div>
    </section>
  );
}

export function HostUnitsPage() {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const unitsQuery = useQuery({
    queryKey: ["units", "mine"],
    queryFn: listMyUnits,
    staleTime: 30_000,
  });
  const citiesQuery = useQuery({
    queryKey: ["cities"],
    queryFn: listCities,
    staleTime: 5 * 60_000,
  });
  const categoriesQuery = useQuery({
    queryKey: ["unit-categories"],
    queryFn: listCategories,
    staleTime: 5 * 60_000,
  });
  const currenciesQuery = useQuery({
    queryKey: ["currencies"],
    queryFn: listCurrencies,
    staleTime: 5 * 60_000,
  });
  const units = unitsQuery.data ?? [];
  const cities = citiesQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const currencies = currenciesQuery.data ?? [];
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
  const refreshUnitQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["units"] }),
      queryClient.invalidateQueries({ queryKey: ["unit"] }),
    ]);
  };
  const closeEditor = () => {
    setIsCreating(false);
    setEditingUnit(null);
  };
  const createMutation = useMutation({
    mutationFn: createUnit,
    onSuccess: async () => {
      await refreshUnitQueries();
      closeEditor();
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateUnitPayload }) =>
      updateUnit(id, payload),
    onSuccess: async () => {
      await refreshUnitQueries();
      closeEditor();
    },
  });
  const activateMutation = useMutation({
    mutationFn: activateUnit,
    onSuccess: refreshUnitQueries,
  });
  const deactivateMutation = useMutation({
    mutationFn: deactivateUnit,
    onSuccess: refreshUnitQueries,
  });
  const deleteMutation = useMutation({
    mutationFn: deleteUnit,
    onSuccess: refreshUnitQueries,
  });
  const operationError = [
    activateMutation.error,
    deactivateMutation.error,
    deleteMutation.error,
  ].find(Boolean);
  const isMutating =
    createMutation.isPending ||
    updateMutation.isPending ||
    activateMutation.isPending ||
    deactivateMutation.isPending ||
    deleteMutation.isPending;
  const retryCatalogQueries = () => {
    void Promise.all([
      citiesQuery.refetch(),
      categoriesQuery.refetch(),
      currenciesQuery.refetch(),
    ]);
  };

  const handleSubmit = (payload: CreateUnitPayload) => {
    if (editingUnit) {
      updateMutation.mutate({ id: editingUnit.id, payload });
    } else {
      createMutation.mutate(payload);
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
            <button
              className="host-primary-button"
              type="button"
              onClick={() => setIsCreating(true)}
            >
              Add unit
            </button>
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
          isPending={createMutation.isPending || updateMutation.isPending}
          error={createMutation.error ?? updateMutation.error}
          onRetryCatalogs={retryCatalogQueries}
          onSubmit={handleSubmit}
          onCancel={closeEditor}
        />
      )}
      {operationError && (
        <p className="host-operation-error" role="alert">
          {getApiErrorMessage(operationError)}
        </p>
      )}
      {catalogsHaveError && !isCreating && !editingUnit && (
        <div className="host-operation-error" role="alert">
          <span>Unit form options could not be loaded.</span>{" "}
          <button type="button" onClick={retryCatalogQueries}>
            Retry options
          </button>
        </div>
      )}
      {unitsQuery.isLoading ? (
        <p role="status">Loading your units...</p>
      ) : unitsQuery.isError ? (
        <div className="host-empty-state" role="alert">
          <p>Your units could not be loaded.</p>
          <button type="button" onClick={() => void unitsQuery.refetch()}>
            Retry
          </button>
        </div>
      ) : units.length === 0 ? (
        <p className="host-empty-state">You haven’t listed any units yet.</p>
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
              onEdit={() => {
                createMutation.reset();
                updateMutation.reset();
                setIsCreating(false);
                setEditingUnit(unit);
              }}
              onActivate={() => activateMutation.mutate(unit.id)}
              onDeactivate={() => deactivateMutation.mutate(unit.id)}
              onDelete={() => {
                if (
                  window.confirm(
                    `Delete "${unit.title}"? This cannot be undone.`,
                  )
                ) {
                  deleteMutation.mutate(unit.id);
                }
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export function HostBookingsPage() {
  const bookingsQuery = useQuery({
    queryKey: ["bookings", "host"],
    queryFn: listHostBookings,
    staleTime: 30_000,
  });
  const bookings = bookingsQuery.data ?? [];

  return (
    <section
      className="host-page-section"
      aria-labelledby="host-bookings-title"
    >
      <div className="host-page-heading">
        <p className="host-kicker">Guest requests</p>
        <h2 id="host-bookings-title">Bookings</h2>
        <p>Review requests and keep up with upcoming stays.</p>
      </div>
      {bookingsQuery.isLoading ? (
        <p role="status">Loading booking requests...</p>
      ) : bookingsQuery.isError ? (
        <div className="host-empty-state" role="alert">
          <p>Booking requests could not be loaded.</p>
          <button type="button" onClick={() => void bookingsQuery.refetch()}>
            Retry
          </button>
        </div>
      ) : bookings.length === 0 ? (
        <p className="host-empty-state">There are no booking requests yet.</p>
      ) : (
        <div className="host-list">
          {bookings.map((booking) => (
            <BookingRow key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </section>
  );
}

function getQueryCount(
  isLoading: boolean,
  isError: boolean,
  count: number | undefined,
) {
  if (isLoading) return "...";
  if (isError) return "—";
  return count ?? 0;
}

interface UnitRowProps {
  unit: Unit;
  currencyCode?: string;
  isMutating: boolean;
  onEdit: () => void;
  onActivate: () => void;
  onDeactivate: () => void;
  onDelete: () => void;
}

function UnitRow({
  unit,
  currencyCode,
  isMutating,
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
    <article className="host-list-row">
      <div>
        <h3>{unit.title}</h3>
        <p>
          {price} / night · {unit.maxGuests} guests
        </p>
      </div>
      <div className="host-unit-controls">
        <span
          className={`host-status${
            unit.isActive === undefined
              ? " is-unknown"
              : unit.isActive
                ? ""
                : " is-inactive"
          }`}
        >
          {status}
        </span>
        <div className="host-unit-actions">
          <button type="button" disabled={isMutating} onClick={onEdit}>
            Edit
          </button>
          {unit.isActive ? (
            <button type="button" disabled={isMutating} onClick={onDeactivate}>
              Deactivate
            </button>
          ) : (
            <button type="button" disabled={isMutating} onClick={onActivate}>
              Activate
            </button>
          )}
          <button
            className="host-danger-button"
            type="button"
            disabled={isMutating}
            onClick={onDelete}
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

function BookingRow({ booking }: { booking: Booking }) {
  return (
    <article className="host-list-row host-booking-row">
      <div>
        <h3>Booking {booking.id}</h3>
        <p>
          {booking.checkIn} to {booking.checkOut} · {booking.totalPrice}
        </p>
      </div>
      <div className="host-booking-actions">
        <span className="host-status">{booking.status.toLowerCase()}</span>
        <BookingActions booking={booking} actor="host" />
      </div>
    </article>
  );
}
