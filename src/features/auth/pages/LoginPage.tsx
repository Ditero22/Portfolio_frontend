import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuthSession } from "../hooks/useAuthSession";
import { loginWithPin } from "../services/loginService";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthSession();

  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  function handlePinChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);

    const pinArray = pin.padEnd(8, "").split("");
    pinArray[index] = digit;

    const newPin = pinArray.join("").slice(0, 8);
    setPin(newPin);

    if (digit && index < 7) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (
      event.key === "Backspace" &&
      !pin[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(
    event: React.ClipboardEvent<HTMLInputElement>,
  ) {
    event.preventDefault();

    const pastedPin = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 8);

    setPin(pastedPin);

    const nextIndex = Math.min(pastedPin.length, 7);
    inputRefs.current[nextIndex]?.focus();
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    if (pin.length !== 8) {
      setError("Please enter your 8-digit PIN.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await loginWithPin(pin);

      login(response.user, response.accessToken);

      navigate("/admin", { replace: true });
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Login failed.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#020202] px-6 text-white">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-6"
      >
        <div>
          <h1 className="text-4xl">Admin Login</h1>

          <p className="mt-2 text-sm text-gray-400">
            Enter your 8-digit PIN.
          </p>
        </div>

        <div className="relative">
          <div className="flex justify-between gap-2">
            {Array.from({ length: 8 }).map((_, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputRefs.current[index] = element;
                }}
                type={showPin ? "text" : "password"}
                inputMode="numeric"
                maxLength={1}
                value={pin[index] ?? ""}
                onChange={(event) =>
                  handlePinChange(index, event.target.value)
                }
                onKeyDown={(event) =>
                  handleKeyDown(index, event)
                }
                onPaste={handlePaste}
                className="h-12 w-10 border border-gray-700 bg-transparent text-center text-xl outline-none focus:border-white"
                autoComplete="off"
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowPin((value) => !value)}
            className="absolute -right-8 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-white"
            aria-label={showPin ? "Hide PIN" : "Show PIN"}
          >
            {showPin ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full border border-white px-4 py-3 transition hover:bg-white hover:text-black disabled:opacity-50"
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}