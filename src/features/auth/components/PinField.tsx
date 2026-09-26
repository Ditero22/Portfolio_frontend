import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

type PinFieldProps = {
  label: string;
  value: string;
  onChange: (pin: string) => void;
  autoFocus?: boolean;
};

export default function PinField({
  label,
  value,
  onChange,
  autoFocus = false,
}: PinFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium text-ink/65">
        {label}
      </span>
      <span className="relative block">
        <input
          autoFocus={autoFocus}
          type={isVisible ? "text" : "password"}
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          maxLength={8}
          value={value}
          onChange={(event) =>
            onChange(event.target.value.replace(/\D/g, "").slice(0, 8))
          }
          className="h-14 w-full rounded-xl border border-ink/15 bg-ink/[0.035] px-4 pr-12 text-center font-mono text-xl tracking-[0.55em] text-ink outline-none transition placeholder:tracking-normal placeholder:text-ink/25 focus:border-teal-500/70 focus:bg-ink/[0.055]"
          placeholder="••••••••"
          aria-label={label}
          aria-describedby={`${label.toLowerCase().replaceAll(" ", "-")}-hint`}
        />
        <button
          type="button"
          onClick={() => setIsVisible((visible) => !visible)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-ink/45 transition hover:bg-ink/5 hover:text-ink"
          aria-label={isVisible ? "Hide PIN" : "Show PIN"}
        >
          {isVisible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </span>
      <span
        id={`${label.toLowerCase().replaceAll(" ", "-")}-hint`}
        className="sr-only"
      >
        Enter exactly 8 digits.
      </span>
    </label>
  );
}
