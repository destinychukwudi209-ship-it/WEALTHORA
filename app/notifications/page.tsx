import Link from "next/link";
import { Shell, PageTitle } from "@/components/shell";

const settings = [
  "Two-factor authentication",
  "Email and phone verification",
  "Transaction PIN",
  "Login and device history",
  "Suspicious login alerts",
  "Active session management",
  "Freeze account",
];

export default function Settings() {
  return (
    <Shell>
      <PageTitle
        title="Security & settings"
        subtitle="Protect your WEALTHORA account."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {settings.map((item) => (
          <div className="panel" key={item}>
            <h2 className="font-semibold">{item}</h2>
            <p className="muted mt-2 text-sm">
              This security feature is not yet activated.
            </p>
          </div>
        ))}

        <div className="panel">
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
        </div>
      </div>
    </Shell>
  );
}
