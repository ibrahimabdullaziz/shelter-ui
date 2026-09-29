import { useState, type FormEvent } from "react";
import { getApiErrorMessage } from "../../../lib/getApiErrorMessage";
import type {
  Category,
  City,
  CreateUnitPayload,
  Currency,
  Unit,
} from "../../../types/api";

interface HostUnitFormProps {
  unit?: Unit;
  cities: City[];
  categories: Category[];
  currencies: Currency[];
  catalogsLoading: boolean;
  catalogsReady: boolean;
  catalogsHaveError: boolean;
  isPending: boolean;
  error: unknown;
  onRetryCatalogs: () => void;
  onSubmit: (payload: CreateUnitPayload) => void;
  onCancel: () => void;
}

export function HostUnitForm({
  unit,
  cities,
  categories,
  currencies,
  catalogsLoading,
  catalogsReady,
  catalogsHaveError,
  isPending,
  error,
  onRetryCatalogs,
  onSubmit,
  onCancel,
}: HostUnitFormProps) {
  const [cityId, setCityId] = useState(unit?.cityId ?? "");
  const [categoryId, setCategoryId] = useState(unit?.categoryId ?? "");
  const [currencyId, setCurrencyId] = useState(unit?.currencyId ?? "");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    onSubmit({
      title: String(values.get("title") ?? "").trim(),
      description: String(values.get("description") ?? "").trim(),
      pricePerNight: Number(values.get("pricePerNight")),
      maxGuests: Number(values.get("maxGuests")),
      cityId: String(values.get("cityId") ?? ""),
      categoryId: String(values.get("categoryId") ?? ""),
      currencyId: String(values.get("currencyId") ?? ""),
    });
  };

  return (
    <form className="host-unit-form" onSubmit={handleSubmit}>
      <div className="host-unit-form-heading">
        <h3>{unit ? "Edit unit" : "Add a unit"}</h3>
        <button type="button" onClick={onCancel} disabled={isPending}>
          Cancel
        </button>
      </div>

      {catalogsLoading && <p role="status">Loading form options...</p>}
      {catalogsHaveError && (
        <div className="host-operation-error" role="alert">
          <span>Some form options could not be loaded.</span>{" "}
          <button type="button" onClick={onRetryCatalogs}>
            Retry
          </button>
        </div>
      )}
      {error != null && (
        <p className="host-operation-error" role="alert">
          {getApiErrorMessage(error)}
        </p>
      )}

      <div className="host-unit-form-grid">
        <label className="host-form-field">
          Name
          <input name="title" required defaultValue={unit?.title ?? ""} />
        </label>
        <label className="host-form-field">
          Price per night
          <input
            name="pricePerNight"
            type="number"
            min="0"
            step="0.01"
            required
            defaultValue={unit?.pricePerNight ?? ""}
          />
        </label>
        <label className="host-form-field">
          Maximum guests
          <input
            name="maxGuests"
            type="number"
            min="1"
            step="1"
            required
            defaultValue={unit?.maxGuests ?? ""}
          />
        </label>
        <label className="host-form-field">
          City
          <select
            name="cityId"
            required
            value={cityId}
            onChange={(event) => setCityId(event.target.value)}
          >
            <option value="" disabled>
              Select a city
            </option>
            {unit?.cityId &&
              !cities.some((city) => city.id === unit.cityId) && (
                <option value={unit.cityId}>Current city (unavailable)</option>
              )}
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </label>
        <label className="host-form-field">
          Category
          <select
            name="categoryId"
            required
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
          >
            <option value="" disabled>
              Select a category
            </option>
            {unit?.categoryId &&
              !categories.some(
                (category) => category.id === unit.categoryId,
              ) && (
                <option value={unit.categoryId}>
                  Current category (unavailable)
                </option>
              )}
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label className="host-form-field">
          Currency
          <select
            name="currencyId"
            required
            value={currencyId}
            onChange={(event) => setCurrencyId(event.target.value)}
          >
            <option value="" disabled>
              Select a currency
            </option>
            {unit?.currencyId &&
              !currencies.some(
                (currency) => currency.id === unit.currencyId,
              ) && (
                <option value={unit.currencyId}>
                  Current currency (unavailable)
                </option>
              )}
            {currencies.map((currency) => (
              <option key={currency.id} value={currency.id}>
                {currency.code} - {currency.name}
              </option>
            ))}
          </select>
        </label>
        <label className="host-form-field host-form-field-wide">
          Description
          <textarea
            name="description"
            required
            rows={4}
            defaultValue={unit?.description ?? ""}
          />
        </label>
      </div>

      <div className="host-unit-form-actions">
        <button
          className="host-primary-button"
          type="submit"
          disabled={isPending || !catalogsReady}
        >
          {isPending ? "Saving..." : unit ? "Save changes" : "Create unit"}
        </button>
      </div>
    </form>
  );
}
