import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listCategories, listCities, listCurrencies } from "../api/catalog";
import { ErrorBoundary } from "../components/errors/ErrorBoundary";
import { BookingWidgetError } from "../components/features/bookings/BookingWidgetError";
import { BookingWidget } from "../components/features/bookings/BookingWidget";
import { UnitReviews } from "../components/features/reviews/UnitReviews";
import { Gallery } from "../components/features/units/Gallery";
import { QueryErrorState } from "../components/ui/QueryErrorState";
import { formatCurrency } from "../components/features/bookings/bookingDateUtils";
import { useUnitQuery } from "../hooks/useUnitsQuery";
import { catalogKeys } from "../queries/catalogKeys";

export default function UnitDetailPage() {
  const { id } = useParams();
  const { data: unit, isLoading, error, refetch } = useUnitQuery(id ?? "");
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
  const cities = citiesQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const currencies = currenciesQuery.data ?? [];
  const citiesError = citiesQuery.isError;
  const categoriesError = categoriesQuery.isError;
  const catalogError =
    citiesQuery.error ?? categoriesQuery.error ?? currenciesQuery.error;
  const retryCatalogQueries = () => {
    void Promise.all([
      citiesQuery.refetch(),
      categoriesQuery.refetch(),
      currenciesQuery.refetch(),
    ]);
  };

  if (isLoading) {
    return (
      <main className="unit-detail-state" aria-live="polite" aria-busy="true">
        Loading stay details...
      </main>
    );
  }

  if (error) {
    return (
      <main className="unit-detail-state">
        <h1>Stay details unavailable</h1>
        <QueryErrorState error={error} onRetry={() => void refetch()} />
        <Link to="/units">Back to stays</Link>
      </main>
    );
  }

  if (!unit) {
    return (
      <main className="unit-detail-state">
        <h1>Stay not found</h1>
        <p>This listing does not exist or may have been removed.</p>
        <Link to="/units">Back to stays</Link>
      </main>
    );
  }

  const cityName = cities.find((city) => city.id === unit.cityId)?.name;
  const categoryName = categories.find(
    (category) => category.id === unit.categoryId,
  )?.name;
  const currencyCode = currencies.find(
    (currency) => currency.id === unit.currencyId,
  )?.code;
  const formatPrice = (amount: number) => formatCurrency(amount, currencyCode);

  return (
    <main className="unit-detail-page">
      <Link className="unit-detail-back" to="/units">
        <span aria-hidden="true">←</span> Back to stays
      </Link>
      {catalogError && (
        <QueryErrorState error={catalogError} onRetry={retryCatalogQueries} />
      )}

      <div className="unit-detail-layout">
        <div className="unit-detail-content">
          <Gallery
            alt={unit.title}
            images={unit.photos?.map((photo) => photo.url) ?? []}
          />
          <section className="unit-summary" aria-labelledby="unit-title">
            <p className="unit-summary-meta">
              {cityName ??
                (citiesError ? "City unavailable" : "Loading city...")}
              <span aria-hidden="true">·</span>
              {categoryName ??
                (categoriesError
                  ? "Category unavailable"
                  : "Loading category...")}
            </p>
            <h1 id="unit-title">{unit.title}</h1>
            <dl className="unit-facts">
              <div>
                <dt>Location</dt>
                <dd>
                  {cityName ?? (citiesError ? "Unavailable" : "Loading...")}
                </dd>
              </div>
              <div>
                <dt>Type</dt>
                <dd>
                  {categoryName ??
                    (categoriesError ? "Unavailable" : "Loading...")}
                </dd>
              </div>
              <div>
                <dt>Guests</dt>
                <dd>Up to {unit.maxGuests}</dd>
              </div>
              <div>
                <dt>Price per night</dt>
                <dd>{formatPrice(unit.pricePerNight)}</dd>
              </div>
            </dl>
            <section
              className="unit-description"
              aria-labelledby="unit-about-title"
            >
              <h2 id="unit-about-title">About this stay</h2>
              <p>{unit.description}</p>
            </section>
          </section>
        </div>

        <aside className="unit-detail-sidebar" aria-label="Booking">
          <ErrorBoundary
            resetKeys={[unit.id]}
            fallback={({ resetErrorBoundary }) => (
              <BookingWidgetError onRetry={resetErrorBoundary} />
            )}
          >
            <BookingWidget
              unitId={unit.id}
              pricePerNight={unit.pricePerNight}
              currencyCode={currencyCode}
            />
          </ErrorBoundary>
        </aside>
      </div>
      <UnitReviews unitId={unit.id} />
    </main>
  );
}
