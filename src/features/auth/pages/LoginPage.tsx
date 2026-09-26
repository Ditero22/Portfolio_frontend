import ThemeToggle from "@/shared/theme/ThemeToggle";
import {
  ArrowLeft,
  ArrowRight,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import PinField from "../components/PinField";
import { useAuthSession } from "../hooks/useAuthSession";
import { loginWithPin } from "../services/loginService";
import {
  requestPinResetChallenge,
  resetPinWithGoogle,
} from "../services/pinResetService";
import {
  loadGoogleIdentity,
  type GoogleIdentityApi,
} from "../utils/googleIdentity";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() ?? "";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthSession();
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const googleIdentityRef = useRef<GoogleIdentityApi | null>(null);
  const pinValuesRef = useRef({ pin: "", confirmation: "" });
  const nonceRef = useRef("");
  const isResettingRef = useRef(false);

  const [pin, setPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [isRecovering, setIsRecovering] = useState(false);
  const [nonce, setNonce] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isChallengeLoading, setIsChallengeLoading] = useState(false);
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const [googleScriptFailed, setGoogleScriptFailed] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    pinValuesRef.current = { pin: newPin, confirmation };
    nonceRef.current = nonce;
  }, [confirmation, newPin, nonce]);

  const isNewPinReady = newPin.length === 8 && confirmation.length === 8;
  const isPinConfirmed = isNewPinReady && newPin === confirmation;

  const loadChallenge = useCallback(
    async (options?: { preserveError?: boolean }) => {
      setNonce("");
      setIsChallengeLoading(true);
      setIsGoogleReady(false);
      setGoogleScriptFailed(false);
      if (!options?.preserveError) setError("");

      try {
        const challenge = await requestPinResetChallenge();
        setNonce(challenge.nonce);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Could not start Google verification.",
        );
      } finally {
        setIsChallengeLoading(false);
      }
    },
    [],
  );

  const handleGoogleCredential = useCallback(
    async (credential: string) => {
      const currentValues = pinValuesRef.current;
      const currentNonce = nonceRef.current;

      if (
        !/^\d{8}$/.test(currentValues.pin) ||
        currentValues.pin !== currentValues.confirmation
      ) {
        setError("Enter the same 8-digit PIN in both fields first.");
        return;
      }

      if (!currentNonce || isResettingRef.current) return;

      isResettingRef.current = true;
      setIsResetting(true);
      setError("");

      try {
        const response = await resetPinWithGoogle({
          credential,
          newPin: currentValues.pin,
          nonce: currentNonce,
        });
        setPin(currentValues.pin);
        setNewPin("");
        setConfirmation("");
        setNonce("");
        setIsRecovering(false);
        setNotice(response.message);
      } catch (resetError) {
        setError(
          resetError instanceof Error
            ? resetError.message
            : "Google verification failed.",
        );
        await loadChallenge({ preserveError: true });
      } finally {
        isResettingRef.current = false;
        setIsResetting(false);
      }
    },
    [loadChallenge],
  );

  useEffect(() => {
    if (!isRecovering || !nonce || !googleClientId) return;

    let isCurrent = true;

    void loadGoogleIdentity()
      .then((identity) => {
        if (!isCurrent || !nonce) return;

        googleIdentityRef.current = identity;
        identity.initialize({
          client_id: googleClientId,
          nonce,
          cancel_on_tap_outside: true,
          callback: (response) => {
            if (response.credential) {
              void handleGoogleCredential(response.credential);
            }
          },
        });
        setIsGoogleReady(true);
      })
      .catch((loadError: unknown) => {
        if (!isCurrent) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Google verification could not be loaded.",
        );
        setGoogleScriptFailed(true);
      });

    return () => {
      isCurrent = false;
      googleIdentityRef.current = null;
    };
  }, [handleGoogleCredential, isRecovering, nonce]);

  useEffect(() => {
    const identity = googleIdentityRef.current;
    const buttonContainer = googleButtonRef.current;

    if (
      !isRecovering ||
      !isPinConfirmed ||
      !isGoogleReady ||
      !identity ||
      !buttonContainer
    ) {
      return;
    }

    buttonContainer.replaceChildren();
    identity.renderButton(buttonContainer, {
      theme: "outline",
      size: "large",
      shape: "pill",
      text: "continue_with",
      width: Math.min(buttonContainer.clientWidth || 320, 400),
    });

    return () => buttonContainer.replaceChildren();
  }, [isGoogleReady, isPinConfirmed, isRecovering, nonce]);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!/^\d{8}$/.test(pin)) {
      setError("Enter your 8-digit admin PIN to continue.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await loginWithPin(pin);
      login(response.user, response.accessToken);
      navigate("/admin", { replace: true });
    } catch (loginError) {
      setError(
        loginError instanceof Error ? loginError.message : "Login failed.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function openRecovery() {
    setIsRecovering(true);
    setError("");
    setNotice("");
    setNewPin("");
    setConfirmation("");
    void loadChallenge();
  }

  function closeRecovery() {
    setIsRecovering(false);
    setNonce("");
    setNewPin("");
    setConfirmation("");
    setError("");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-paper px-4 py-16 text-ink sm:px-6">
      <div className="pointer-events-none absolute inset-0 -z-0 bg-grid opacity-50" />
      <div className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-teal-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-96 w-96 rounded-full bg-cyan-500/5 blur-3xl" />

      <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>

      <div className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-3xl border border-ink/10 bg-paper/90 shadow-[0_32px_100px_-55px_rgba(0,0,0,0.65)] backdrop-blur-xl lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="relative hidden min-h-[620px] flex-col justify-between overflow-hidden border-r border-ink/10 bg-ink/[0.035] p-10 lg:flex">
          <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full border border-ink/10" />
          <div className="pointer-events-none absolute -right-6 -top-10 h-52 w-52 rounded-full border border-ink/10" />

          <div className="relative">
            <Link
              to="/"
              className="font-mono text-xs tracking-[0.18em] text-ink/55 transition hover:text-ink"
            >
              KARL ORTEGA <span className="text-teal-500">/</span> PORTFOLIO
            </Link>
            <p className="mt-20 font-mono text-[10px] uppercase tracking-[0.24em] text-teal-600 dark:text-teal-300">
              Private workspace
            </p>
            <h1 className="mt-4 max-w-sm text-6xl leading-[0.85] text-ink">
              Welcome
              <br />
              <span className="text-ink/45">back.</span>
            </h1>
            <p className="mt-6 max-w-sm text-sm leading-7 text-ink/60">
              Sign in to manage your portfolio, projects, stories, and settings.
            </p>
          </div>

          <div className="relative rounded-2xl border border-ink/10 bg-paper/70 p-5">
            <div className="flex items-start gap-3">
              <span className="rounded-xl border border-teal-500/20 bg-teal-500/10 p-2.5 text-teal-700 dark:text-teal-300">
                <ShieldCheck size={18} />
              </span>
              <div>
                <p className="text-sm font-semibold">
                  Account recovery is protected
                </p>
                <p className="mt-1 text-xs leading-5 text-ink/55">
                  Changing your PIN requires a verified Google sign-in for your
                  approved account.
                </p>
              </div>
            </div>
          </div>
        </aside>

        <section className="flex min-h-[620px] flex-col justify-center p-6 sm:p-10 lg:px-14">
          <div className="mb-9 flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs text-ink/55 transition hover:text-ink lg:hidden"
            >
              <ArrowLeft size={14} />
              Back to portfolio
            </Link>
            <span className="ml-auto inline-flex items-center gap-2 rounded-full border border-ink/10 bg-ink/[0.035] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.15em] text-ink/50">
              <LockKeyhole size={12} />
              Secure admin
            </span>
          </div>

          {isRecovering ? (
            <div className="mx-auto w-full max-w-md">
              <button
                type="button"
                onClick={closeRecovery}
                className="mb-7 inline-flex items-center gap-2 text-xs text-ink/55 transition hover:text-ink"
              >
                <ArrowLeft size={14} />
                Back to sign in
              </button>

              <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-2xl border border-teal-500/20 bg-teal-500/10 text-teal-700 dark:text-teal-300">
                <KeyRound size={21} />
              </div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-teal-600 dark:text-teal-300">
                PIN recovery
              </p>
              <h2 className="mt-2 text-4xl leading-none">Set a new PIN</h2>
              <p className="mt-4 text-sm leading-6 text-ink/55">
                Choose a new 8-digit PIN, then verify your Google account to
                save it.
              </p>

              <div className="mt-8 space-y-5">
                <PinField
                  label="New PIN"
                  value={newPin}
                  onChange={setNewPin}
                  autoFocus
                />
                <PinField
                  label="Confirm new PIN"
                  value={confirmation}
                  onChange={setConfirmation}
                />
              </div>

              {newPin.length === 8 &&
                confirmation.length === 8 &&
                newPin !== confirmation && (
                  <p className="mt-3 text-xs text-amber-600 dark:text-amber-300">
                    These PINs do not match yet.
                  </p>
                )}

              {error && (
                <p
                  role="alert"
                  className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-xs leading-5 text-red-600 dark:text-red-300"
                >
                  {error}
                </p>
              )}

              <div className="mt-6 min-h-12">
                {!googleClientId ? (
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs leading-5 text-ink/60">
                    Google verification is not configured for this site yet.
                  </div>
                ) : isChallengeLoading ? (
                  <div className="flex h-12 items-center justify-center gap-2 text-xs text-ink/50">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink/20 border-t-teal-500" />
                    Preparing secure verification…
                  </div>
                ) : !nonce ? (
                  <button
                    type="button"
                    onClick={() => void loadChallenge()}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-ink/15 text-sm transition hover:bg-ink/5"
                  >
                    Try Google verification again
                    <ArrowRight size={15} />
                  </button>
                ) : isPinConfirmed ? (
                  <>
                    {!isGoogleReady && !googleScriptFailed && (
                      <div className="flex h-12 items-center justify-center gap-2 text-xs text-ink/50">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink/20 border-t-teal-500" />
                        Loading Google…
                      </div>
                    )}
                    {googleScriptFailed && (
                      <button
                        type="button"
                        onClick={() => void loadChallenge()}
                        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-ink/15 text-sm transition hover:bg-ink/5"
                      >
                        Retry Google verification
                        <ArrowRight size={15} />
                      </button>
                    )}
                    <div
                      ref={googleButtonRef}
                      className={
                        !isGoogleReady
                          ? "hidden"
                          : "flex min-h-12 justify-center"
                      }
                    />
                  </>
                ) : (
                  <div className="flex min-h-12 items-center justify-center rounded-xl border border-dashed border-ink/15 px-3 text-center text-xs text-ink/45">
                    Enter matching 8-digit PINs to continue with Google.
                  </div>
                )}
              </div>

              {isResetting && (
                <p className="mt-3 text-center text-xs text-ink/50">
                  Verifying account and updating PIN…
                </p>
              )}
            </div>
          ) : (
            <div className="mx-auto w-full max-w-md">
              <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-2xl border border-ink/10 bg-ink/[0.04] text-ink/75">
                <LockKeyhole size={20} />
              </div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/45">
                Admin portal
              </p>
              <h2 className="mt-2 text-4xl leading-none">Sign in</h2>
              <p className="mt-4 text-sm leading-6 text-ink/55">
                Enter your private 8-digit PIN to continue to your dashboard.
              </p>

              <form
                onSubmit={handleLogin}
                className="mt-8 space-y-6"
              >
                <PinField
                  label="Admin PIN"
                  value={pin}
                  onChange={setPin}
                  autoFocus
                />

                {error && (
                  <p
                    role="alert"
                    className="rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-xs leading-5 text-red-600 dark:text-red-300"
                  >
                    {error}
                  </p>
                )}
                {notice && (
                  <p
                    role="status"
                    className="rounded-xl border border-teal-500/20 bg-teal-500/5 px-3 py-2.5 text-xs leading-5 text-teal-700 dark:text-teal-300"
                  >
                    {notice}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="group flex h-12 w-full items-center justify-between rounded-full bg-ink px-5 text-sm font-semibold text-paper transition hover:bg-teal-600 hover:text-white disabled:cursor-wait disabled:opacity-60"
                >
                  <span>
                    {isLoading ? "Checking PIN…" : "Continue to dashboard"}
                  </span>
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </button>
              </form>

              <div className="my-7 border-t border-ink/10" />

              <button
                type="button"
                onClick={openRecovery}
                className="flex w-full items-center justify-between rounded-xl px-1 py-2 text-left text-xs text-ink/55 transition hover:text-ink"
              >
                <span>Forgot your PIN?</span>
                <span className="inline-flex items-center gap-2">
                  Verify with Google <ArrowRight size={14} />
                </span>
              </button>

              <Link
                to="/"
                className="mt-8 hidden w-fit items-center gap-2 text-xs text-ink/45 transition hover:text-ink lg:inline-flex"
              >
                <ArrowLeft size={14} />
                Return to portfolio
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
