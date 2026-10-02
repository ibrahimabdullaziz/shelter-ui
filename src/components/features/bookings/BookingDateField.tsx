interface BookingDateFieldProps {
  label: string;
  value: string;
  min: string;
  error: string;
  errorId: string;
  disabled: boolean;
  onFocus: () => void;
  onChange: (value: string) => void;
}

export function BookingDateField({
  label,
  value,
  min,
  error,
  errorId,
  disabled,
  onFocus,
  onChange,
}: BookingDateFieldProps) {
  return (
    <label className="booking-date-field">
      <span>{label}</span>
      <input
        type="date"
        value={value}
        min={min}
        disabled={disabled}
        onFocus={onFocus}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <span className="booking-date-error" id={errorId} role="alert">
          {error}
        </span>
      )}
    </label>
  );
}
