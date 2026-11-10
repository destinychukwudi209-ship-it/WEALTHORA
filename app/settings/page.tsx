
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Shell, PageTitle } from "@/components/shell";
import { createClient } from "@/lib/supabase/client";

type VerificationState =
  | "loading"
  | "verified"
  | "unverified"
  | "signed-out";

export default function Settings() {
  const [verification, setVerification] =
    useState<VerificationState>("loading");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function checkEmail() {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();

      if (!active) return;

      if (error || !data.user) {
        setVerification("signed-out");
        return;
      }

      setEmail(data.user.email ?? "");
      setVerification(
        data.user.email_confirmed_at
          ? "verified"
          : "unverified"
      );
    }

    checkEmail();

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

      if (error) {
        setMessage(
          "Unable to send confirmation email. Please try again."
        );
        return;
      }

      setMessage(
        "If your account needs verification, a new confirmation email has been sent. Check your inbox and spam folder."
      );
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setSending(false);
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
      title: "Transaction PIN",
      description:
        "Secure PIN creation and server-side verification still need to be built.",
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
            <h2 className="font-semibold">
              Email verification
            </h2>

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
                {sending
                  ? "Sending..."
                  : "Resend confirmation email"}
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

        {pendingFeatures.map((item) => (
          <section className="panel" key={item.title}>
            <h2 className="font-semibold">
              {item.title}
            </h2>

            <p className="muted mt-2 text-sm">
              {item.description}
            </p>

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

          <Link
            href="/notifications"
            className="btn mt-4 inline-block"
          >
            Open notification settings
          </Link>
        </section>
      </div>
    </Shell>
  );
  }
