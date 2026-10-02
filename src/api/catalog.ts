import type {
  ApiResponse,
  Category,
  City,
  Country,
  CreateCategoryPayload,
  CreateCityPayload,
  CreateCountryPayload,
  CreateCurrencyPayload,
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

export async function createCity(payload: CreateCityPayload): Promise<City> {
  const response = await client.post<ApiResponse<City>>("/api/cities", payload);
  return response.data.data;
}

export async function listCurrencies(): Promise<Currency[]> {
  const response = await client.get<ApiResponse<Currency[]>>("/api/currencies");
  return response.data.data;
}

export async function createCurrency(
  payload: CreateCurrencyPayload,
): Promise<Currency> {
  const response = await client.post<ApiResponse<Currency>>(
    "/api/currencies",
    payload,
  );
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
): Promise<Category> {
  const response = await client.post<ApiResponse<Category>>(
    "/api/unit-categories",
    payload,
  );
  return response.data.data;
}
