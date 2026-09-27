import type {
  ApiResponse,
  Category,
  City,
  Country,
  CreateCategoryPayload,
  CreateCityPayload,
  CreateCountryPayload,
  Currency,
} from "../types/api";
import client from "./client";

export async function listCountries(): Promise<Country[]> {
  const response = await client.get<ApiResponse<Country[]>>("/api/countries");
  return response.data.data;
}

export async function createCountry(
  payload: CreateCountryPayload,
): Promise<Country> {
  const response = await client.post<ApiResponse<Country>>(
    "/api/countries",
    payload,
  );
  return response.data.data;
}

export async function listCities(): Promise<City[]> {
  const response = await client.get<ApiResponse<City[]>>("/api/cities");
  return response.data.data;
}

export async function createCity(payload: CreateCityPayload): Promise<void> {
  await client.post("/api/cities", payload);
}

export async function listCurrencies(): Promise<Currency[]> {
  const response = await client.get<ApiResponse<Currency[]>>("/api/currencies");
  return response.data.data;
}

export async function listCategories(): Promise<Category[]> {
  const response = await client.get<ApiResponse<Category[]>>(
    "/api/unit-categories",
  );
  return response.data.data;
}

export async function createCategory(
  payload: CreateCategoryPayload,
): Promise<void> {
  await client.post("/api/unit-categories", payload);
}
