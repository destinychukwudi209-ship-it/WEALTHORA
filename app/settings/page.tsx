
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Shell, PageTitle } from "@/components/shell";
import { createClient } from "@/lib/supabase/client";

type PinState =
  | "loading"
  | "ready"
  | "signed-out"
  | "unverified"
  | "error";

function PinInput({
  value,
  onChange,
  placeholder,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        inputMode="numeric"
        autoComplete="off"
        maxLength={6}
        pattern="[0-9]{6}"
        value={value}
        onChange={(e) =>
          onChange(e.target.value.replace(/\D/g, "").slice(0, 6))
        }
        placeholder={placeholder}
        aria-label={label}
        required
        style={{
          backgroundColor: "#ffffff",
          color: "#000000",
          caretColor: "#000000",
          WebkitTextFillColor: "#000000",
          opacity: 1,
        }}
        className="w-full rounded-xl border border-gray-300 p-3 pr-16 placeholder:text-gray-500"
      />

      <button
        type="button"
        onClick={() => setVisible((previous) => !previous)}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-sm font-semibold text-black"
      >
        {visible ? "Hide" : "Show"}
      </button>
    </div>
  );
}

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
        setPinMessage(
          statusError
            ? `${statusError.message} (code: ${statusError.code ?? "unknown"})`
            : JSON.stringify(status)
        );
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
          emailRedirectTo: `${window.location.origin}/auth/callback`,
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
            <p
              role="status"
              className="mt-3 rounded-xl border border-[#526b36] bg-[#17251a] p-3 text-sm text-gray-200"
            >
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
            <div className="mt-2 break-words text-sm text-amber-300">
              <p>PIN status error:</p>
              <p>{pinMessage}</p>
            </div>
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
                  <PinInput
                    value={currentPin}
                    onChange={setCurrentPin}
                    placeholder="Current six-digit PIN"
                    label="Current Transaction PIN"
                  />
                )}

                <PinInput
                  value={newPin}
                  onChange={setNewPin}
                  placeholder="New six-digit PIN"
                  label="New Transaction PIN"
                />

                <PinInput
                  value={confirmPin}
                  onChange={setConfirmPin}
                  placeholder="Confirm new PIN"
                  label="Confirm new Transaction PIN"
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
                Never share your PIN with anyone. This setup is not yet
                connected to withdrawal or payment authorization.
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
                      
