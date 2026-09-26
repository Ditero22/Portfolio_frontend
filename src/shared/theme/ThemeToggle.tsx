import { useId, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { getTheme, setTheme, subscribeTheme } from "./theme";

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeTheme, getTheme);
  const groupName = useId();

  return (
    <div
      role="radiogroup"
      aria-label="Color theme"
      className="inline-flex gap-1 rounded-lg border border-ink/20 bg-surface p-1"
    >
      {(["light", "dark"] as const).map((value) => {
        const Icon = value === "light" ? Sun : Moon;
        const label = value === "light" ? "Light mode" : "Dark mode";
        return (
          <label
            key={value}
            title={label}
            className="relative cursor-pointer"
          >
            <input
              type="radio"
              name={groupName}
              value={value}
              checked={theme === value}
              onChange={() => setTheme(value)}
              aria-label={label}
              className="peer sr-only"
            />
            <span className="flex h-6 w-6  items-center justify-center rounded-md text-ink/60 transition hover:bg-ink/5 peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink">
              <Icon
                size={14}
                aria-hidden="true"
              />
            </span>
          </label>
        );
      })}
    </div>
  );
}
