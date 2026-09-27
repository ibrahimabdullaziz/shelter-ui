import type {
  ApiResponse,
  CreateUnitPayload,
  Unit,
  UnitFilters,
  UnitPhoto,
  UpdateUnitPayload,
} from "../types/api";
import client from "./client";

export async function listUnits(filters: UnitFilters = {}): Promise<Unit[]> {
  const response = await client.get<ApiResponse<Unit[]>>("/api/units", {
    params: filters,
  });
  return response.data.data;
}

export async function listMyUnits(): Promise<Unit[]> {
  const response = await client.get<ApiResponse<Unit[]>>("/api/units/mine");
  return response.data.data;
}

export async function getUnit(id: string): Promise<Unit> {
  const response = await client.get<ApiResponse<Unit>>(`/api/units/${id}`);
  return response.data.data;
}

export async function createUnit(payload: CreateUnitPayload): Promise<Unit> {
  const response = await client.post<ApiResponse<Unit>>("/api/units", payload);
  return response.data.data;
}

export async function updateUnit(
  id: string,
  payload: UpdateUnitPayload,
): Promise<void> {
  await client.patch(`/api/units/${id}`, payload);
}

export async function deleteUnit(id: string): Promise<void> {
  await client.delete(`/api/units/${id}`);
}

export async function activateUnit(id: string): Promise<void> {
  await client.patch(`/api/units/${id}/activate`);
}

export async function deactivateUnit(id: string): Promise<void> {
  await client.patch(`/api/units/${id}/deactivate`);
}

export async function uploadUnitPhoto(
  unitId: string,
  photo: File,
): Promise<UnitPhoto> {
  const formData = new FormData();
  formData.append("photo", photo);

  const response = await client.post<ApiResponse<UnitPhoto>>(
    `/api/units/${unitId}/photos`,
    formData,
  );
  return response.data.data;
}

export async function deleteUnitPhoto(photoId: string): Promise<void> {
  await client.delete(`/api/units/photos/${photoId}`);
}
