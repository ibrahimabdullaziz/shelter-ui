import type {
  ApiResponse,
  CreateReviewPayload,
  Review,
  UnitReviews,
} from "../types/api";
import client from "./client";

export async function getUnitReviews(unitId: string): Promise<UnitReviews> {
  const response = await client.get<ApiResponse<UnitReviews>>(
    `/api/units/${unitId}/reviews`,
  );
  return response.data.data;
}

export async function createUnitReview(
  unitId: string,
  payload: CreateReviewPayload,
): Promise<Review> {
  const response = await client.post<ApiResponse<Review>>(
    `/api/units/${unitId}/reviews`,
    payload,
  );
  return response.data.data;
}
