import { useQuery } from "@tanstack/react-query";
import { getUnitReviews } from "../../../api/reviews";
import { EmptyState } from "../../ui/EmptyState";
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
  const reviews = data?.reviews ?? [];
  const averageRating = data?.avgRating?._avg?.rating;

  return (
    <section className="unit-reviews" aria-labelledby="unit-reviews-title">
      <header className="unit-reviews-header">
        <div>
          <p className="unit-reviews-eyebrow">GUEST FEEDBACK</p>
          <h2 id="unit-reviews-title">Reviews</h2>
        </div>
        {(typeof averageRating === "number" || reviews.length > 0) && (
          <div
            className="unit-reviews-summary"
            role="group"
            aria-label={
              typeof averageRating === "number"
                ? `${averageRating.toFixed(1)} out of 5 average rating from ${reviews.length} reviews`
                : `${reviews.length} reviews`
            }
          >
            {typeof averageRating === "number" && (
              <>
                <strong>{averageRating.toFixed(1)}</strong>
                <span>/ 5</span>
              </>
            )}
            <span className="unit-reviews-count">
              {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
            </span>
          </div>
        )}
      </header>

      {isLoading ? (
        <p className="unit-reviews-status" role="status">
          Loading reviews...
        </p>
      ) : isError ? (
        <QueryErrorState error={error} onRetry={() => void refetch()} />
      ) : !reviews.length ? (
        <EmptyState
          icon="☆"
          title="No reviews yet"
          description="No guest reviews have been returned for this stay."
        />
      ) : (
        <ul className="unit-review-list">
          {reviews.map((review) => (
            <li className="unit-review" key={review.id}>
              <div className="unit-review-heading">
                <span
                  className="unit-review-stars"
                  role="img"
                  aria-label={`${review.rating} out of 5 stars`}
                >
                  {Array.from({ length: 5 }, (_, starIndex) => (
                    <span aria-hidden="true" key={starIndex}>
                      {starIndex < review.rating ? "★" : "☆"}
                    </span>
                  ))}
                </span>
                <strong>{review.rating} / 5</strong>
              </div>
              <p className="unit-review-author">
                <span>Guest ID</span>
                <code>{review.guestId}</code>
              </p>
              <p className="unit-review-comment">
                {review.comment || "No comment provided."}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
