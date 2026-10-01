import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listCategories, listCities, listCurrencies } from "../api/catalog";
import { ErrorBoundary } from "../components/errors/ErrorBoundary";
import { BookingWidgetError } from "../components/features/bookings/BookingWidgetError";
import { BookingWidget } from "../components/features/bookings/BookingWidget";
import { UnitReviews } from "../components/features/reviews/UnitReviews";
import { Gallery } from "../components/features/units/Gallery";
import { QueryErrorState } from "../components/ui/QueryErrorState";
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
  const currenciesError = currenciesQuery.isError;
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
      <main style={{ padding: "24px" }}>
        <p>Loading unit...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ padding: "24px" }}>
        <h1>Unit detail</h1>
        <QueryErrorState error={error} onRetry={() => void refetch()} />
        <Link to="/units">Back to listings</Link>
      </main>
    );
  }

  if (!unit) {
    return (
      <main style={{ padding: "24px" }}>
        <h1>Unit not found</h1>
        <p>This listing does not exist or may have been removed.</p>
        <Link to="/units">Back to listings</Link>
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
  const formatPrice = (amount: number) =>
    currencyCode
      ? new Intl.NumberFormat(undefined, {
          style: "currency",
          currency: currencyCode,
        }).format(amount)
      : `${amount.toFixed(2)}${currenciesError ? " (currency unavailable)" : ""}`;

  return (
    <main style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
      <Link
        to="/units"
        style={{ display: "inline-block", marginBottom: "16px" }}
      >
        ← Back to listings
      </Link>
      {catalogError && (
        <QueryErrorState error={catalogError} onRetry={retryCatalogQueries} />
      )}

      <article
        style={{
          background: "#fff",
          border: "1px solid #dfe6e3",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 8px 28px rgba(17, 24, 39, 0.06)",
        }}
      >
        <div style={{ padding: "20px" }}>
          <Gallery alt={unit.title} />
        </div>

        <div style={{ padding: "24px" }}>
          <h1 style={{ margin: "0 0 12px", color: "#173b34" }}>{unit.title}</h1>

          <p style={{ margin: "0 0 16px", color: "#536760", lineHeight: 1.6 }}>
            {unit.description}
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "16px",
              marginBottom: "20px",
            }}
          >
            <div>
              <strong>City:</strong>
              <div>
                {cityName ??
                  (citiesError ? "City unavailable" : "Loading city...")}
              </div>
            </div>
            <div>
              <strong>Category:</strong>
              <div>
                {categoryName ??
                  (categoriesError
                    ? "Category unavailable"
                    : "Loading category...")}
              </div>
            </div>
            <div>
              <strong>Max guests:</strong>
              <div>{unit.maxGuests}</div>
            </div>
            <div>
              <strong>Price:</strong>
              <div>{formatPrice(unit.pricePerNight)} / night</div>
            </div>
          </div>

          <div
            style={{ color: "#1f594c", fontWeight: 700, fontSize: "1.4rem" }}
          >
            {formatPrice(unit.pricePerNight)}
          </div>
        </div>
      </article>

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
      <UnitReviews unitId={unit.id} />
    </main>
  );
}
