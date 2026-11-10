
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Shell, PageTitle } from "@/components/shell";
import { createClient } from "@/lib/supabase/client";

type PinState = "loading" | "ready" | "signed-out" | "unverified" | "error";

export default function Settings() {
  const [verification, setVerification] = useState<
    "loading" | "verified" | "unverified" | "signed-out"
  >("loading");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  const [pinState, setPinState] = useState<PinState>("loading");
  const [hasPin, setHasPin] = useState(false);
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinMessage, setPinMessage] = useState("");
  const [savingPin, setSavingPin] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadSettings() {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();

      if (!active) return;

      if (error || !data.user) {
        setVerification("signed-out");
        setPinState("signed-out");
        return;
      }

      setEmail(data.user.email ?? "");

      const verified = Boolean(data.user.email_confirmed_at);
      setVerification(verified ? "verified" : "unverified");

      if (!verified) {
        setPinState("unverified");
        return;
      }

      const { data: status, error: statusError } =
        await supabase.rpc("get_transaction_pin_status");

      if (!active) return;

      if (statusError || !status?.ok) {
        setPinState("error");
        return;
      }

      setHasPin(Boolean(status.has_pin));
      setPinState("ready");
    }

    loadSettings();

    return () => {
      active = false;
    };
  }, []);

  async function resendConfirmation() {
    if (!email || sending) return;

    setSending(true);
    setMessage("");

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo:
            `${window.location.origin}/auth/callback`,
        },
      });

      setMessage(
        error
          ? "Unable to send confirmation email. Please try again."
          : "If your account needs verification, a confirmation email has been sent. Check your inbox and spam folder."
      );
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  }

  async function savePin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (savingPin) return;

    setPinMessage("");

    if (!/^[0-9]{6}$/.test(newPin)) {
      setPinMessage("Your new PIN must contain exactly six digits.");
      return;
    }

    if (newPin !== confirmPin) {
      setPinMessage("The PINs do not match. Please try again.");
      return;
    }

    if (hasPin && !/^[0-9]{6}$/.test(currentPin)) {
      setPinMessage("Enter your current six-digit PIN.");
      return;
    }

    setSavingPin(true);

    try {
      const supabase = createClient();

      const { data, error } = await supabase.rpc(
        "set_transaction_pin",
        {
          p_new_pin: newPin,
          p_current_pin: hasPin ? currentPin : null,
        }
      );

      if (error) {
        setPinMessage("Unable to save your PIN. Please try again.");
        return;
      }

      if (!data?.ok) {
        const messages: Record<string, string> = {
          locked: "Too many incorrect attempts. Try again in 15 minutes.",
          current_pin_incorrect: "Your current PIN is incorrect.",
          invalid_pin: "Enter a valid six-digit PIN.",
          email_not_verified: "Verify your email before setting a PIN.",
          profile_missing: "Your account profile could not be found.",
          unauthenticated: "Please sign in again.",
        };

        setPinMessage(
          messages[data?.code] ?? "PIN could not be saved. Please try again."
        );
        return;
      }

      setHasPin(true);
      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
      setPinMessage("Your Transaction PIN has been saved successfully.");
    } catch {
      setPinMessage("Something went wrong. Please try again.");
    } finally {
      setSavingPin(false);
    }
  }

  const pendingFeatures = [
    {
      title: "Two-factor authentication",
      description:
        "Authenticator-based two-step sign-in still needs to be implemented and tested.",
    },
    {
      title: "Phone verification",
      description:
        "SMS verification requires a configured SMS provider.",
    },
    {
      title: "Login and device history",
      description:
        "Secure login event tracking still needs to be connected.",
    },
    {
      title: "Suspicious login alerts",
      description:
        "Login risk detection and alert rules still need to be configured.",
    },
    {
      title: "Active session management",
      description:
        "Session listing and secure session revocation still need to be implemented.",
    },
    {
      title: "Freeze account",
      description:
        "A protected account-freeze and recovery process still needs to be implemented.",
    },
  ];

  return (
    <Shell>
      <PageTitle
        title="Security & settings"
        subtitle="Protect your WEALTHORA account."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <section className="panel md:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-semibold">Email verification</h2>

            {verification === "verified" && (
              <span className="text-sm font-semibold text-green-400">
                Verified
              </span>
            )}

            {verification === "unverified" && (
              <span className="text-sm font-semibold text-amber-400">
                Action required
              </span>
            )}
          </div>

          {verification === "loading" && (
            <p className="muted mt-2 text-sm">
              Checking verification status...
            </p>
          )}

          {verification === "signed-out" && (
            <p className="muted mt-2 text-sm">
              Sign in to check your email verification.
            </p>
          )}

          {verification === "verified" && (
            <p className="muted mt-2 text-sm">
              Your email address has been confirmed.
            </p>
          )}

          {verification === "unverified" && (
            <>
              <p className="muted mt-2 text-sm">
                Your email address has not been confirmed.
                Check your inbox for the confirmation link.
              </p>

              <button
                type="button"
                onClick={resendConfirmation}
                disabled={sending}
                className="btn mt-4 disabled:opacity-60"
              >
                {sending ? "Sending..." : "Resend confirmation email"}
              </button>
            </>
          )}

          {message && (
            <p role="status" className="mt-3 rounded-xl border border-[#526b36] bg-[#17251a] p-3 text-sm text-gray-200">
              {message}
            </p>
          )}
        </section>

        <section className="panel md:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-semibold">Transaction PIN</h2>

            {pinState === "ready" && (
              <span className="text-sm font-semibold text-green-400">
                {hasPin ? "PIN created" : "Not set up"}
              </span>
            )}
          </div>

          {pinState === "loading" && (
            <p className="muted mt-2 text-sm">
              Checking Transaction PIN status...
            </p>
          )}

          {pinState === "signed-out" && (
            <p className="muted mt-2 text-sm">
              Sign in to manage your Transaction PIN.
            </p>
          )}

          {pinState === "unverified" && (
            <p className="muted mt-2 text-sm">
              Verify your email before creating a Transaction PIN.
            </p>
          )}

          {pinState === "error" && (
            <p className="mt-2 text-sm text-amber-300">
              Could not load PIN status. Please refresh and try again.
            </p>
          )}

          {pinState === "ready" && (
            <>
              <p className="muted mt-2 text-sm">
                {hasPin
                  ? "Change your six-digit PIN using your current PIN."
                  : "Create a six-digit PIN to add another layer of account security."}
              </p>

              <form onSubmit={savePin} className="mt-4 space-y-3">
                {hasPin && (
                  <input
                    type="password"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={6}
                    pattern="[0-9]{6}"
                    value={currentPin}
                    onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="Current six-digit PIN"
                    aria-label="Current Transaction PIN"
                    required
                    className="w-full rounded-xl border border-white/15 bg-transparent p-3 text-white"
                  />
                )}

                <input
                  type="password"
                  inputMode="numeric"
                  autoComplete="new-password"
                  maxLength={6}
                  pattern="[0-9]{6}"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="New six-digit PIN"
                  aria-label="New Transaction PIN"
                  required
                  className="w-full rounded-xl border border-white/15 bg-transparent p-3 text-white"
                />

                <input
                  type="password"
                  inputMode="numeric"
                  autoComplete="new-password"
                  maxLength={6}
                  pattern="[0-9]{6}"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Confirm new PIN"
                  aria-label="Confirm new Transaction PIN"
                  required
                  className="w-full rounded-xl border border-white/15 bg-transparent p-3 text-white"
                />

                <button
                  type="submit"
                  disabled={savingPin}
                  className="btn disabled:opacity-60"
                >
                  {savingPin
                    ? "Saving..."
                    : hasPin
                      ? "Change Transaction PIN"
                      : "Create Transaction PIN"}
                </button>
              </form>

              {pinMessage && (
                <p role="status" className="mt-3 text-sm text-amber-300">
                  {pinMessage}
                </p>
              )}

              <p className="muted mt-3 text-xs">
                Never share your PIN with anyone. This setup is not yet connected to withdrawal or payment authorization.
              </p>
            </>
          )}
        </section>

        {pendingFeatures.map((item) => (
          <section className="panel" key={item.title}>
            <h2 className="font-semibold">{item.title}</h2>
            <p className="muted mt-2 text-sm">{item.description}</p>
            <p className="mt-3 text-xs font-semibold text-amber-300">
              Not activated yet
            </p>
          </section>
        ))}

        <section className="panel">
          <h2 className="font-semibold">
            Notification preferences 🔔
          </h2>
          <p className="muted mt-2 text-sm">
            Manage your ringing tune and phone notification settings.
          </p>
          <Link href="/notifications" className="btn mt-4 inline-block">
            Open notification settings
          </Link>
        </section>
      </div>
    </Shell>
  );
        }
    
