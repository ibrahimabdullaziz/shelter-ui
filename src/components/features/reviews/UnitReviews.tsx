import { useQuery } from "@tanstack/react-query";
import { getUnitReviews } from "../../../api/reviews";
import { QueryErrorState } from "../../ui/QueryErrorState";
import { reviewKeys } from "../../../queries/reviewKeys";

interface UnitReviewsProps {
  unitId: string;
}

export function UnitReviews({ unitId }: UnitReviewsProps) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: reviewKeys.byUnit(unitId),
    queryFn: () => getUnitReviews(unitId),
    enabled: Boolean(unitId),
    staleTime: 30_000,
  });

  return (
    <section aria-labelledby="unit-reviews-title" style={{ marginTop: "28px" }}>
      <h2
        id="unit-reviews-title"
        style={{ margin: "0 0 16px", color: "#173b34" }}
      >
        Reviews
      </h2>

      {isLoading ? (
        <p role="status">Loading reviews...</p>
      ) : isError ? (
        <QueryErrorState error={error} onRetry={() => void refetch()} />
      ) : !data?.reviews.length ? (
        <p>No reviews yet.</p>
      ) : (
        <>
          {typeof data.avgRating?._avg?.rating === "number" && (
            <p style={{ margin: "0 0 16px", color: "#536760" }}>
              Average rating: {data.avgRating._avg.rating.toFixed(1)} / 5
            </p>
          )}

          <ul
            style={{
              display: "grid",
              gap: "16px",
              margin: 0,
              padding: 0,
              listStyle: "none",
            }}
          >
            {data.reviews.map((review) => (
              <li
                key={review.id}
                style={{
                  padding: "16px 0",
                  borderTop: "1px solid #dfe6e3",
                }}
              >
                <p style={{ margin: "0 0 6px", color: "#173b34" }}>
                  <strong>Rating:</strong> {review.rating} / 5
                </p>
                <p style={{ margin: "0 0 6px", color: "#536760" }}>
                  <strong>Guest ID:</strong> {review.guestId}
                </p>
                <p style={{ margin: 0, color: "#536760", lineHeight: 1.6 }}>
                  {review.comment || "No comment provided."}
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
