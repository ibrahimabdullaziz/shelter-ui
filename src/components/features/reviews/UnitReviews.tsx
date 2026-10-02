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
    <section className="unit-reviews" aria-labelledby="unit-reviews-title">
      <h2 id="unit-reviews-title">Reviews</h2>

      {isLoading ? (
        <p role="status">Loading reviews...</p>
      ) : isError ? (
        <QueryErrorState error={error} onRetry={() => void refetch()} />
      ) : !data?.reviews.length ? (
        <p className="unit-reviews-empty">No reviews yet.</p>
      ) : (
        <>
          {typeof data.avgRating?._avg?.rating === "number" && (
            <p className="unit-reviews-average">
              <strong>{data.avgRating._avg.rating.toFixed(1)}</strong>
              <span>Average rating · / 5</span>
            </p>
          )}

          <ul className="unit-review-list">
            {data.reviews.map((review) => (
              <li className="unit-review" key={review.id}>
                <p className="unit-review-rating">
                  <strong>Rating:</strong> {review.rating} / 5
                </p>
                <p className="unit-review-author">
                  <strong>Guest ID:</strong> {review.guestId}
                </p>
                <p className="unit-review-comment">
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
