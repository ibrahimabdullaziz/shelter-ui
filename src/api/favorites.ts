import type { ApiResponse, Favorite } from "../types/api";
import client from "./client";

export async function listFavoriteUnitIds(): Promise<string[]> {
  const response = await client.get<ApiResponse<Favorite[]>>("/api/favorites");
  return response.data.data.map((favorite) => favorite.unitId);
}

export async function addFavorite(unitId: string): Promise<void> {
  await client.post(`/api/units/${unitId}/favorite`);
}

export async function removeFavorite(unitId: string): Promise<void> {
  await client.delete(`/api/units/${unitId}/favorite`);
}
