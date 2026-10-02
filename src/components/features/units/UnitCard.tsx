import { useIsMutating } from "@tanstack/react-query";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../../ui/Button";
import { useUnitQuery } from "../../../hooks/useUnitsQuery";
import {
  favoriteQueryKeys,
  useFavoriteUnitIds,
  useToggleFavoriteMutation,
} from "../../../hooks/useFavorites";
import { useAuthStore } from "../../../store/authStore";
import { useCurrentUserQuery } from "../../../hooks/useAuthQueries";
import { getApiErrorMessage } from "../../../lib/getApiErrorMessage";
import type { Unit } from "../../../types/api";

interface UnitCardProps {
  unit: Unit;
  cityName?: string;
  categoryName?: string;
  currencyCode?: string;
}

export function UnitCard({
  unit,
  cityName,
  categoryName,
  currencyCode,
}: UnitCardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    data: unitDetails,
    isLoading: isPhotoLoading,
    isError: isPhotoError,
  } = useUnitQuery(unit.id);
  const isAuthenticated = useAuthStore(
    (state) => state.authStatus === "authenticated",
  );
  const currentUserQuery = useCurrentUserQuery();
  const isGuest = currentUserQuery.data?.role === "GUEST";
  const canSaveFavorite = !isAuthenticated || isGuest;
  const favoritesQuery = useFavoriteUnitIds(isGuest);
  const favoriteMutation = useToggleFavoriteMutation();
  const isFavoritePending =
    useIsMutating({
      mutationKey: favoriteQueryKeys.toggle(),
      predicate: (mutation) => {
        const variables = mutation.state.variables as
          | { unitId?: string }
          | undefined;
        return variables?.unitId === unit.id;
      },
    }) > 0;
  const isFavorite = favoritesQuery.data?.includes(unit.id) ?? false;

  const coverPhoto = unitDetails?.photos?.[0];
  let nightlyPrice = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
  }).format(unit.pricePerNight);
  if (currencyCode) {
    try {
      nightlyPrice = new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: currencyCode,
      }).format(unit.pricePerNight);
    } catch {
      nightlyPrice = `${nightlyPrice} ${currencyCode}`;
    }
  }

  return (
    <article className="unit-card">
      <Link className="unit-card-link" to={`/units/${unit.id}`}>
        <div className="unit-card-media">
          {coverPhoto ? (
            <img
              src={coverPhoto.url}
              alt={`${unit.title} cover photo`}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="unit-card-photo-placeholder" role="status">
              {isPhotoLoading
                ? "Loading photo"
                : isPhotoError
                  ? "Photo unavailable"
                  : "No photo available"}
            </div>
          )}
        </div>

        <div className="unit-card-body">
          <p className="unit-card-meta">
            <span>{cityName ?? unit.cityId}</span>
            <span aria-hidden="true">·</span>
            <span>{categoryName ?? unit.categoryId}</span>
          </p>
          <h2 className="unit-card-title">{unit.title}</h2>
          <p className="unit-card-description">{unit.description}</p>

          <div className="unit-card-price-row">
            <span className="unit-card-price">{nightlyPrice}</span>
            <span className="unit-card-price-unit">/ night</span>
          </div>
        </div>
      </Link>

      {canSaveFavorite && (
        <Button
          className="unit-favorite-toggle"
          variant="secondary"
          type="button"
          aria-pressed={isFavorite}
          aria-busy={isFavoritePending}
          aria-label={
            isFavorite
              ? `Remove ${unit.title} from favorites`
              : `Add ${unit.title} to favorites`
          }
          title={isAuthenticated ? undefined : "Sign in to save this unit"}
          disabled={isFavoritePending}
          onClick={() => {
            if (!isAuthenticated) {
              navigate("/login", { state: { from: location } });
              return;
            }
            if (isGuest)
              favoriteMutation.mutate({ unitId: unit.id, isFavorite });
          }}
        >
          {isFavorite ? "♥" : "♡"}
        </Button>
      )}

      {favoritesQuery.isError && isGuest && (
        <p className="unit-card-feedback" role="alert">
          {getApiErrorMessage(favoritesQuery.error)}{" "}
          <Button
            type="button"
            variant="quiet"
            size="small"
            onClick={() => void favoritesQuery.refetch()}
          >
            Retry favorites
          </Button>
        </p>
      )}
      {favoriteMutation.isError && (
        <p className="unit-card-feedback" role="alert">
          {getApiErrorMessage(favoriteMutation.error)}
        </p>
      )}
    </article>
  );
}
