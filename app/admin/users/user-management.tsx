
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Customer = {
  id: string;
  full_name: string | null;
  role: string;
  status: string;
  created_at: string;
};

const statuses = ["pending", "active", "frozen", "suspended", "closed"];

export default function UserManagement({
  currentUserId,
  currentRole,
}: {
  currentUserId: string;
  currentRole: string;
}) {
  const supabase = createClient();

  const [users, setUsers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("profiles")
      .select("id,full_name,role,status,created_at")
      .eq("role", "customer")
      .order("created_at", { ascending: false });

    if (error) {
      setUsers([]);
      setErrorMessage(
        `Database error (${error.code || "unknown"}): ${error.message}`
      );
    } else {
      setUsers((data || []) as Customer[]);
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    if (currentRole !== "admin" && currentRole !== "super_admin") {
      setLoading(false);
      return;
    }

    loadUsers();

    const refreshTimer = window.setInterval(() => {
      loadUsers();
    }, 20000);

    return () => window.clearInterval(refreshTimer);
  }, [currentRole, loadUsers]);

  const customers = useMemo(() => {
    const term = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesFilter =
        filter === "all" || user.status === filter;

      const matchesSearch =
        (user.full_name || "").toLowerCase().includes(term) ||
        user.id.toLowerCase().includes(term);

      return matchesFilter && matchesSearch;
    });
  }, [users, search, filter]);

  async function changeStatus(user: Customer, newStatus: string) {
    if (
      user.id === currentUserId ||
      user.role !== "customer" ||
      !statuses.includes(newStatus)
    ) {
      return;
    }

    const confirmed = window.confirm(
      `Change ${user.full_name || "this customer's"} status to ${newStatus}?`
    );

    if (!confirmed) return;

    setSavingId(user.id);
    setErrorMessage("");
    setSuccessMessage("");

    const { data, error } = await supabase
      .from("profiles")
      .update({ status: newStatus })
      .eq("id", user.id)
      .eq("role", "customer")
      .select("id")
      .maybeSingle();

    if (error) {
      setErrorMessage(
        `Status update failed (${error.code || "unknown"}): ${error.message}`
      );
    } else if (!data) {
      setErrorMessage(
        "No account was updated. Check your administrator permissions."
      );
    } else {
      setSuccessMessage("Customer account status updated.");
      await loadUsers();
    }

    setSavingId("");
  }

  if (currentRole !== "admin" && currentRole !== "super_admin") {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-5 text-red-300">
        You do not have permission to manage customer accounts.
      </div>
    );
  }

  const activeCount = users.filter((u) => u.status === "active").length;
  const pendingCount = users.filter((u) => u.status === "pending").length;
  const restrictedCount = users.filter((u) =>
    ["frozen", "suspended", "closed"].includes(u.status)
  ).length;

  return (
    <div className="space-y-5">

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Total customers", users.length],
          ["Active", activeCount],
          ["Pending", pendingCount],
          ["Restricted", restrictedCount],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-[#24452b] bg-[#09170e] p-4"
          >
            <p className="text-xs text-gray-400">{label}</p>
            <p className="mt-2 text-2xl font-extrabold text-lime-300">
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-[#24452b] bg-[#09170e] p-4">

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-white">Live customer records</h2>
            <p className="mt-1 text-xs text-gray-400">
              Records are retrieved directly from the WEALTHORA database.
              Automatic refresh every 20 seconds.
            </p>
          </div>

          <button
            onClick={loadUsers}
            disabled={loading}
            className="rounded-lg border border-lime-500/40 px-4 py-2 text-xs font-bold text-lime-300 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh now"}
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 rounded-xl border border-red-500/40 bg-red-950/30 p-4">
            <p className="font-bold text-red-300">
              Unable to retrieve customer records
            </p>
            <p className="mt-2 break-words text-sm text-red-200">
              {errorMessage}
            </p>
          </div>
        )}

        {successMessage && (
          <p className="mt-4 rounded-lg border border-green-500/30 bg-green-950/20 p-3 text-sm text-green-300">
            {successMessage}
          </p>
        )}

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer name or account ID"
            className="w-full rounded-xl border border-[#31583a] bg-[#050806] px-4 py-3 text-sm text-white outline-none"
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full rounded-xl border border-[#31583a] bg-[#050806] px-4 py-3 text-sm text-white"
          >
            <option value="all">All account statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <h3 className="mt-6 font-bold text-white">
          Customer accounts ({customers.length})
        </h3>

        {loading && users.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">
            Loading real customer records...
          </p>
        ) : !errorMessage && customers.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">
            No customer profile records found yet.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {customers.map((user) => (
              <div
                key={user.id}
                className="rounded-xl border border-[#24452b] bg-[#050806] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="font-bold text-white">
                      {user.full_name || "Unnamed customer"}
                    </h4>

                    <p className="mt-2 break-all text-xs text-gray-400">
                      Account ID: {user.id}
                    </p>

                    <p className="mt-2 text-xs text-gray-500">
                      Registered:{" "}
                      {new Date(user.created_at).toLocaleString()}
                    </p>
                  </div>

                  <span className="rounded-full border border-lime-500/30 px-3 py-1 text-xs font-semibold text-lime-300">
                    {user.status}
                  </span>
                </div>

                <div className="mt-4">
                  <label className="mb-2 block text-xs text-gray-400">
                    Manage account status
                  </label>

                  <select
                    value={user.status}
                    disabled={savingId === user.id}
                    onChange={(e) =>
                      changeStatus(user, e.target.value)
                    }
                    className="w-full rounded-lg border border-[#31583a] bg-[#10291a] px-3 py-3 text-sm text-white disabled:opacity-50"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>

                  {savingId === user.id && (
                    <p className="mt-2 text-xs text-lime-300">
                      Saving account status...
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
  
