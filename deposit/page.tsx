
import { Shell, PageTitle } from "@/components/shell";
import { requireUser } from "@/lib/auth";

export default async function DepositPage() {
  const { supabase } = await requireUser();

  const { data: accounts, error } = await supabase
    .from("deposit_accounts")
    .select("id, bank_name, account_name, account_number, instructions")
    .eq("is_active", true);

  return (
    <Shell>
      <PageTitle
        title="Deposit Funds"
        subtitle="Fund your WEALTHORA Main Balance."
      />

      <div className="panel mb-5">
        <h2 className="font-semibold mb-2">
          How to deposit
        </h2>
        <p className="muted text-sm">
          Transfer money to one of the active bank accounts
          displayed below. Keep your payment receipt.
        </p>
      </div>

      {error ? (
        <div className="panel">
          <p className="text-red-500">
            Unable to load bank accounts. Please try again later.
          </p>
        </div>
      ) : !accounts || accounts.length === 0 ? (
        <div className="panel">
          <h2 className="font-semibold mb-2">
            No deposit account available
          </h2>
          <p className="muted text-sm">
            Our team has not added an active deposit bank
            account yet. Please check again later.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {accounts.map((account) => (
            <div className="panel" key={account.id}>
              <p className="text-sm muted mb-2">
                Bank name
              </p>
              <h3 className="font-semibold mb-4">
                {account.bank_name}
              </h3>

              <p className="text-sm muted mb-1">
                Account name
              </p>
              <p className="font-semibold mb-4">
                {account.account_name}
              </p>

              <p className="text-sm muted mb-1">
                Account number
              </p>
              <p className="font-bold text-xl tracking-wider">
                {account.account_number}
              </p>

              {account.instructions && (
                <p className="text-sm muted mt-4">
                  {account.instructions}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="panel mt-5">
        <h2 className="font-semibold mb-2">
          Important
        </h2>
        <p className="muted text-sm">
          Your Main Balance will only be credited after
          an administrator verifies and approves your
          payment. Never transfer money to an unverified
          account.
        </p>
      </div>
    </Shell>
  );
          }
