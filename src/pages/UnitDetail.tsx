import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { listCategories, listCities, listCurrencies } from "../api/catalog";
import { ErrorBoundary } from "../components/errors/ErrorBoundary";
import { BookingWidgetError } from "../components/features/bookings/BookingWidgetError";
import { BookingWidget } from "../components/features/bookings/BookingWidget";
import { UnitReviews } from "../components/features/reviews/UnitReviews";
import { Gallery } from "../components/features/units/Gallery";
import { QueryErrorState } from "../components/ui/QueryErrorState";
import { PageTransition } from "../components/ui/PageTransition";
import { Modal } from "../components/ui/Modal";
import { Button } from "../components/ui/Button";
import { useState } from "react";
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

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  return (
    <PageTransition>
      <main className="unit-detail-page">
        <Link className="unit-detail-back" to="/units">
          <span aria-hidden="true">←</span> Back to stays
        </Link>
        {catalogError && (
          <QueryErrorState error={catalogError} onRetry={retryCatalogQueries} />
        )}

        <div className="unit-detail-layout-immersive">
          <motion.div
            className="unit-detail-content"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <Gallery
              alt={unit.title}
              images={unit.photos?.map((photo) => photo.url) ?? []}
            />
            <section className="unit-summary" aria-labelledby="unit-title">
              <div className="unit-summary-header">
                <div>
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
                </div>
                <div className="unit-summary-price-badge">
                  <strong>{formatPrice(unit.pricePerNight)}</strong>
                  <span>/ night</span>
                </div>
              </div>
              
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
              </dl>
              <section
                className="unit-description"
                aria-labelledby="unit-about-title"
              >
                <h2 id="unit-about-title">About this stay</h2>
                <p>{unit.description}</p>
              </section>
            </section>
          </motion.div>
        </div>
        <UnitReviews unitId={unit.id} />

        {/* Floating Action Bar */}
        <div className="unit-action-bar">
          <div className="unit-action-bar-inner">
            <div className="unit-action-bar-price">
              <strong>{formatPrice(unit.pricePerNight)}</strong>
              <span>/ night</span>
            </div>
            <Button
              variant="primary"
              size="large"
              onClick={() => setIsBookingModalOpen(true)}
            >
              Book this stay
            </Button>
          </div>
        </div>

        {/* Booking Modal */}
        <Modal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          size="default"
          label="Book this stay"
        >
          <div className="unit-booking-modal-content">
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
          </div>
        </Modal>
      </main>
    </PageTransition>
  );
}
