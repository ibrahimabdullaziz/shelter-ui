import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, type ReactNode } from "react";
import {
  createCategory,
  createCity,
  createCountry,
  createCurrency,
  listCategories,
  listCities,
  listCountries,
  listCurrencies,
} from "../api/catalog";
import { Button } from "../components/ui/Button";
import { QueryErrorState } from "../components/ui/QueryErrorState";
import { getApiErrorMessage } from "../lib/getApiErrorMessage";
import { catalogKeys } from "../queries/catalogKeys";

interface CatalogFormProps {
  title: string;
  error: unknown;
  isPending: boolean;
  isSuccess: boolean;
  successMessage: string;
  submitLabel: string;
  disabled?: boolean;
  onSubmit: (formData: FormData, form: HTMLFormElement) => void;
  children: ReactNode;
}

function CatalogForm({
  title,
  error,
  isPending,
  isSuccess,
  successMessage,
  submitLabel,
  disabled = false,
  onSubmit,
  children,
}: CatalogFormProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(new FormData(event.currentTarget), event.currentTarget);
  };

  return (
    <section
      className="admin-catalog-section"
      aria-labelledby={`${title}-title`}
    >
      <h2 id={`${title}-title`}>{title}</h2>
      <form className="admin-catalog-form" onSubmit={handleSubmit}>
        {error != null && (
          <p className="ui-feedback ui-feedback--error" role="alert">
            {getApiErrorMessage(error)}
          </p>
        )}
        {isSuccess && (
          <p className="ui-feedback ui-feedback--success" role="status">
            {successMessage}
          </p>
        )}
        {children}
        <Button
          type="submit"
          variant="primary"
          disabled={disabled || isPending}
        >
          {isPending ? "Saving..." : submitLabel}
        </Button>
      </form>
    </section>
  );
}

function readField(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

export default function AdminCatalogPage() {
  const queryClient = useQueryClient();
  const countriesQuery = useQuery({
    queryKey: catalogKeys.countries(),
    queryFn: listCountries,
    staleTime: 5 * 60_000,
  });
  const citiesQuery = useQuery({
    queryKey: catalogKeys.cities(),
    queryFn: listCities,
    staleTime: 5 * 60_000,
  });
  const currenciesQuery = useQuery({
    queryKey: catalogKeys.currencies(),
    queryFn: listCurrencies,
    staleTime: 5 * 60_000,
  });
  const categoriesQuery = useQuery({
    queryKey: catalogKeys.categories(),
    queryFn: listCategories,
    staleTime: 5 * 60_000,
  });

  const countryMutation = useMutation({
    mutationFn: createCountry,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: catalogKeys.countries() }),
  });
  const cityMutation = useMutation({
    mutationFn: createCity,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: catalogKeys.cities() }),
  });
  const currencyMutation = useMutation({
    mutationFn: createCurrency,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: catalogKeys.currencies() }),
  });
  const categoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: catalogKeys.categories() }),
  });

  const catalogError =
    countriesQuery.error ??
    citiesQuery.error ??
    currenciesQuery.error ??
    categoriesQuery.error;
  const retryCatalogs = () => {
    void Promise.all([
      countriesQuery.refetch(),
      citiesQuery.refetch(),
      currenciesQuery.refetch(),
      categoriesQuery.refetch(),
    ]);
  };

  return (
    <main className="admin-catalog-page">
      <header className="admin-catalog-heading">
        <p className="host-kicker">ADMINISTRATION</p>
        <h1>Catalogs</h1>
      </header>

      {catalogError && (
        <QueryErrorState error={catalogError} onRetry={retryCatalogs} />
      )}

      <div className="admin-catalog-grid">
        <CatalogForm
          title="Countries"
          error={countryMutation.error}
          isPending={countryMutation.isPending}
          isSuccess={countryMutation.isSuccess}
          successMessage="Country created."
          submitLabel="Add country"
          onSubmit={(formData, form) =>
            countryMutation.mutate(
              {
                name: readField(formData, "name"),
                code: readField(formData, "code"),
              },
              { onSuccess: () => form.reset() },
            )
          }
        >
          <label className="host-form-field">
            Country name
            <input name="name" minLength={3} required />
          </label>
          <label className="host-form-field">
            Country code
            <input name="code" required />
          </label>
          <CatalogItems
            items={(countriesQuery.data ?? []).map(({ id, name, code }) => ({
              id,
              label: `${name} · ${code}`,
            }))}
          />
        </CatalogForm>

        <CatalogForm
          title="Cities"
          error={cityMutation.error}
          isPending={cityMutation.isPending}
          isSuccess={cityMutation.isSuccess}
          successMessage="City created."
          submitLabel="Add city"
          disabled={!countriesQuery.data?.length}
          onSubmit={(formData, form) =>
            cityMutation.mutate(
              {
                name: readField(formData, "name"),
                countryId: readField(formData, "countryId"),
              },
              { onSuccess: () => form.reset() },
            )
          }
        >
          <label className="host-form-field">
            City name
            <input name="name" minLength={3} required />
          </label>
          <label className="host-form-field">
            Country
            <select name="countryId" required defaultValue="">
              <option value="" disabled>
                Select a country
              </option>
              {(countriesQuery.data ?? []).map((country) => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </select>
          </label>
          <CatalogItems
            items={(citiesQuery.data ?? []).map(({ id, name }) => ({
              id,
              label: name,
            }))}
          />
        </CatalogForm>

        <CatalogForm
          title="Currencies"
          error={currencyMutation.error}
          isPending={currencyMutation.isPending}
          isSuccess={currencyMutation.isSuccess}
          successMessage="Currency created."
          submitLabel="Add currency"
          onSubmit={(formData, form) =>
            currencyMutation.mutate(
              {
                code: readField(formData, "code"),
                symbol: readField(formData, "symbol"),
              },
              { onSuccess: () => form.reset() },
            )
          }
        >
          <label className="host-form-field">
            Currency code
            <input name="code" required />
          </label>
          <label className="host-form-field">
            Symbol
            <input name="symbol" required />
          </label>
          <CatalogItems
            items={(currenciesQuery.data ?? []).map(({ id, code, symbol }) => ({
              id,
              label: symbol ? `${code} · ${symbol}` : code,
            }))}
          />
        </CatalogForm>

        <CatalogForm
          title="Categories"
          error={categoryMutation.error}
          isPending={categoryMutation.isPending}
          isSuccess={categoryMutation.isSuccess}
          successMessage="Category created."
          submitLabel="Add category"
          onSubmit={(formData, form) =>
            categoryMutation.mutate(
              { name: readField(formData, "name") },
              { onSuccess: () => form.reset() },
            )
          }
        >
          <label className="host-form-field">
            Category name
            <input name="name" minLength={3} required />
          </label>
          <CatalogItems
            items={(categoriesQuery.data ?? []).map(({ id, name }) => ({
              id,
              label: name,
            }))}
          />
        </CatalogForm>
      </div>
    </main>
  );
}

function CatalogItems({
  items,
}: {
  items: Array<{ id: string; label: string }>;
}) {
  return (
    <ul className="admin-catalog-items">
      {items.map((item) => (
        <li key={item.id}>{item.label}</li>
      ))}
    </ul>
  );
}
