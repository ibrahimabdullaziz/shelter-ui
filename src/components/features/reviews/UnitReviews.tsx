import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link, useLocation } from "react-router-dom";
import { createUnitReview, getUnitReviews } from "../../../api/reviews";
import { listMyBookings } from "../../../api/bookings";
import { useCurrentUserQuery } from "../../../hooks/useAuthQueries";
import { getApiErrorMessage } from "../../../lib/getApiErrorMessage";
import {
  createReviewSchema,
  type CreateReviewFormValues,
} from "../../../lib/validation/reviewSchemas";
import { bookingKeys } from "../../../queries/bookingKeys";
import { reviewKeys } from "../../../queries/reviewKeys";
import type { CreateReviewPayload } from "../../../types/api";
import { Button } from "../../ui/Button";
import { EmptyState } from "../../ui/EmptyState";
import { QueryErrorState } from "../../ui/QueryErrorState";

interface UnitReviewsProps {
  unitId: string;
}

function getReviewerName(
  firstName: unknown,
  lastName: unknown,
): string | undefined {
  const parts = [firstName, lastName]
    .filter(
      (name): name is string =>
        typeof name === "string" &&
        name.trim() !== "" &&
        name.trim().toLowerCase() !== "undefined" &&
        name.trim().toLowerCase() !== "null",
    )
    .map((name) => name.trim());
  return parts.length ? parts.join(" ") : undefined;
}

export function UnitReviews({ unitId }: UnitReviewsProps) {
  const location = useLocation();
  const queryClient = useQueryClient();
  const currentUserQuery = useCurrentUserQuery();
  const guestId =
    currentUserQuery.data?.role === "GUEST"
      ? currentUserQuery.data.id
      : undefined;
  const currentUserName = getReviewerName(
    currentUserQuery.data?.firstName,
    currentUserQuery.data?.lastName,
  );
  const bookingsQuery = useQuery({
    queryKey: bookingKeys.mine(),
    queryFn: listMyBookings,
    enabled: Boolean(guestId),
    staleTime: 30_000,
    retry: false,
  });
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: reviewKeys.byUnit(unitId),
    queryFn: () => getUnitReviews(unitId),
    enabled: Boolean(unitId),
    staleTime: 30_000,
  });
  const createMutation = useMutation({
    mutationFn: (payload: CreateReviewPayload) =>
      createUnitReview(unitId, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: reviewKeys.byUnit(unitId) }),
  });
  const reviews = data?.reviews ?? [];
  const averageRating = data?.avgRating?._avg?.rating;
  const hasCompletedStay =
    bookingsQuery.data?.some(
      (booking) => booking.unitId === unitId && booking.status === "COMPLETED",
    ) ?? false;
  const hasReviewed = Boolean(
    guestId && reviews.some((review) => review.guestId === guestId),
  );
  const canReview = Boolean(
    guestId &&
    data &&
    !isError &&
    bookingsQuery.isSuccess &&
    hasCompletedStay &&
    !hasReviewed &&
    !createMutation.isSuccess,
  );

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
                <span>
                  {getReviewerName(
                    review.guest?.firstName,
                    review.guest?.lastName,
                  ) ??
                    (guestId === review.guestId ? currentUserName : undefined) ??
                    "Guest"}
                </span>
              </p>
              <p className="unit-review-comment">
                {review.comment || "No comment provided."}
              </p>
            </li>
          ))}
        </ul>
      )}

      {guestId && bookingsQuery.isLoading && (
        <p className="unit-review-eligibility" role="status">
          Checking completed stays...
        </p>
      )}
      {guestId && bookingsQuery.isError && (
        <QueryErrorState
          error={bookingsQuery.error}
          onRetry={() => void bookingsQuery.refetch()}
        />
      )}
      {canReview && (
        <ReviewSubmissionForm
          isPending={createMutation.isPending}
          error={createMutation.error}
          onSubmit={(payload) => createMutation.mutate(payload)}
        />
      )}
      {createMutation.isSuccess && (
        <p
          className="ui-feedback ui-feedback--success unit-review-feedback"
          role="status"
        >
          Your review was submitted.
        </p>
      )}
      {guestId &&
        bookingsQuery.isSuccess &&
        hasCompletedStay &&
        hasReviewed && (
          <p className="unit-review-eligibility" role="status">
            You have already reviewed this stay.
          </p>
        )}
      {guestId && bookingsQuery.isSuccess && !hasCompletedStay && (
        <p className="unit-review-eligibility">
          Reviews are available after a completed stay.
        </p>
      )}
      {!currentUserQuery.data && (
        <p className="unit-review-eligibility">
          <Link to="/login" state={{ from: location }}>
            Sign in as a guest to review this stay
          </Link>
        </p>
      )}
    </section>
  );
}

interface ReviewSubmissionFormProps {
  isPending: boolean;
  error: unknown;
  onSubmit: (payload: CreateReviewPayload) => void;
}

function ReviewSubmissionForm({
  isPending,
  error,
  onSubmit,
}: ReviewSubmissionFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateReviewFormValues>({
    resolver: zodResolver(createReviewSchema),
    defaultValues: { comment: "" },
  });
  const selectedRating = watch("rating");
  const submit = handleSubmit(({ rating, comment }) =>
    onSubmit({ rating, comment: comment?.trim() || undefined }),
  );

  return (
    <form className="unit-review-form" onSubmit={submit} noValidate>
      <h3>Share your review</h3>
      {error != null && (
        <p className="ui-feedback ui-feedback--error" role="alert">
          {getApiErrorMessage(error)}
        </p>
      )}
      <fieldset className="unit-review-rating-fieldset">
        <legend>Your rating</legend>
        <div
          className="unit-review-rating-options"
          role="group"
          aria-label="Choose a rating"
        >
          {[1, 2, 3, 4, 5].map((rating) => (
            <Button
              key={rating}
              className="unit-review-rating-option"
              variant="secondary"
              type="button"
              aria-label={`${rating} out of 5 stars`}
              aria-pressed={selectedRating === rating}
              aria-describedby={
                errors.rating ? "review-rating-error" : undefined
              }
              onClick={() =>
                setValue("rating", rating, {
                  shouldDirty: true,
                  shouldTouch: true,
                  shouldValidate: true,
                })
              }
            >
              <span aria-hidden="true">
                {selectedRating && selectedRating >= rating ? "★" : "☆"}
              </span>
            </Button>
          ))}
        </div>
        {errors.rating && (
          <small className="form-error" id="review-rating-error">
            {errors.rating.message}
          </small>
        )}
      </fieldset>
      <label className="form-field unit-review-comment-field">
        <span>Comment (optional)</span>
        <textarea rows={4} {...register("comment")} />
      </label>
      <Button type="submit" variant="primary" disabled={isPending}>
        {isPending ? "Submitting review..." : "Submit review"}
      </Button>
    </form>
  );
}
