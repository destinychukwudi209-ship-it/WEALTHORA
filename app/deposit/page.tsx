import { Shell, PageTitle } from "@/components/shell";

export default function DepositPage() {
  return (
    <Shell>
      <PageTitle
        title="Deposit Funds"
        subtitle="WEALTHORA deposit information."
      />

      <div className="panel">
        <h2 className="font-semibold mb-2">
          Deposits are currently unavailable
        </h2>
        <p className="muted text-sm">
          Deposit services are not yet authorised for use.
          Please do not transfer money to any account claiming
          to represent WEALTHORA.
        </p>
      </div>
    </Shell>
  );
}
