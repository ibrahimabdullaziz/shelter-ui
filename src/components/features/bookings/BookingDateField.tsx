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
    <label style={{ display: "grid", gap: "6px", color: "#34443f" }}>
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
        <span id={errorId} role="alert" style={{ color: "#a43129" }}>
          {error}
        </span>
      )}
    </label>
  );
}
