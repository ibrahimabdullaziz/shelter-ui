import type { ApiResponse, UnitReviews } from "../types/api";
import client from "./client";

export async function getUnitReviews(unitId: string): Promise<UnitReviews> {
  const response = await client.get<ApiResponse<UnitReviews>>(
    `/api/units/${unitId}/reviews`,
  );
  return response.data.data;
}
