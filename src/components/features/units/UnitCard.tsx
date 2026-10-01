import { useIsMutating } from "@tanstack/react-query";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUnitQuery } from "../../../hooks/useUnitsQuery";
import {
  favoriteQueryKeys,
  useFavoriteUnitIds,
  useToggleFavoriteMutation,
} from "../../../hooks/useFavorites";
import { useAuthStore } from "../../../store/authStore";
import { getApiErrorMessage } from "../../../lib/getApiErrorMessage";
import type { Unit } from "../../../types/api";

interface UnitCardProps {
  unit: Unit;
  cityName?: string;
  categoryName?: string;
}

export function UnitCard({ unit, cityName, categoryName }: UnitCardProps) {
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
  const favoritesQuery = useFavoriteUnitIds(isAuthenticated);
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

  return (
    <article
      style={{
        position: "relative",
        border: "1px solid #dfe6e3",
        borderRadius: "12px",
        background: "#fff",
        overflow: "hidden",
        boxShadow: "0 4px 14px rgba(17, 24, 39, 0.04)",
      }}
    >
      <Link
        to={`/units/${unit.id}`}
        style={{ display: "block", color: "inherit", textDecoration: "none" }}
      >
        <div
          style={{
            height: "180px",
            background: "linear-gradient(135deg, #dfeae6, #c9d9d3)",
          }}
        >
          {coverPhoto ? (
            <img
              src={coverPhoto.url}
              alt={`${unit.title} cover photo`}
              loading="lazy"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                display: "grid",
                width: "100%",
                height: "100%",
                placeItems: "center",
                color: "#173b34",
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              {isPhotoLoading
                ? "Loading photo..."
                : isPhotoError
                  ? "Photo unavailable"
                  : "No photo available"}
            </div>
          )}
        </div>

        <div style={{ padding: "16px" }}>
          <h3 style={{ margin: "0 0 8px", color: "#173b34" }}>{unit.title}</h3>

          <p style={{ margin: "0 0 12px", color: "#536760", lineHeight: 1.5 }}>
            {unit.description}
          </p>

          <p style={{ margin: "0 0 6px", color: "#536760" }}>
            City: {cityName ?? unit.cityId}
          </p>

          <p style={{ margin: "0 0 12px", color: "#536760" }}>
            Category: {categoryName ?? unit.categoryId}
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            <span style={{ color: "#1f594c", fontWeight: 700 }}>
              ${unit.pricePerNight}
            </span>
            <span style={{ color: "#6b7a75", fontSize: "12px" }}>/ night</span>
          </div>
        </div>
      </Link>

      <button
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
          favoriteMutation.mutate({ unitId: unit.id, isFavorite });
        }}
        style={{
          position: "absolute",
          top: "12px",
          right: "12px",
          zIndex: 1,
          minWidth: "72px",
          minHeight: "36px",
          border: "1px solid #dfe6e3",
          borderRadius: "18px",
          background: isFavorite ? "#1f594c" : "#fff",
          color: isFavorite ? "#fff" : "#173b34",
          cursor: isAuthenticated ? "pointer" : "pointer",
        }}
      >
        {isFavorite ? "Saved" : "Save"}
      </button>

      {favoritesQuery.isError && isAuthenticated && (
        <p role="alert" style={{ margin: "0 12px 12px", color: "#a43129" }}>
          {getApiErrorMessage(favoritesQuery.error)}{" "}
          <button type="button" onClick={() => void favoritesQuery.refetch()}>
            Retry favorites
          </button>
        </p>
      )}
      {favoriteMutation.isError && (
        <p role="alert" style={{ margin: "0 12px 12px", color: "#a43129" }}>
          {getApiErrorMessage(favoriteMutation.error)}
        </p>
      )}
    </article>
  );
}
