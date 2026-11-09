import Link from "next/link";
import { redirect, revalidatePath } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { Shell, PageTitle } from "@/components/shell";

export const dynamic = "force-dynamic";

type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

const statuses: TicketStatus[] = [
  "open",
  "in_progress",
  "resolved",
  "closed",
];

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusStyle(status: string) {
  if (status === "resolved" || status === "closed") {
    return "bg-emerald-100 text-emerald-800";
  }

  if (status === "in_progress") {
    return "bg-amber-100 text-amber-800";
  }

  return "bg-blue-100 text-blue-800";
}

export default async function AdminSupportPage({
  searchParams,
}: {
  searchParams: Promise<{ ticket?: string }>;
}) {
  const { supabase, profile } = await requireAdmin();

  if (!["admin", "super_admin", "support"].includes(profile.role)) {
    redirect("/admin");
  }

  const params = await searchParams;
  const selectedId = params.ticket || "";

  const { data: tickets, error: ticketError } = await supabase
    .from("support_tickets")
    .select("*")
    .order("updated_at", { ascending: false });

  const selectedTicket =
    (tickets || []).find((ticket) => ticket.id === selectedId) || null;

  let messages: {
    id: string;
    sender_role: string;
    message: string;
    created_at: string;
  }[] = [];

  let messageError = "";

  if (selectedTicket) {
    const { data, error } = await supabase
      .from("support_messages")
      .select("*")
      .eq("ticket_id", selectedTicket.id)
      .order("created_at", { ascending: true });

    if (error) {
      messageError = error.message;
    } else {
      messages = data || [];
    }
  }

  async function sendReply(formData: FormData) {
    "use server";

    const { supabase, user, profile } = await requireAdmin();

    if (!["admin", "super_admin", "support"].includes(profile.role)) {
      redirect("/admin");
    }

    const ticketId = String(formData.get("ticket_id") || "");
    const message = String(formData.get("message") || "").trim();

    if (!ticketId || !message || message.length > 4000) {
      redirect("/admin/support?ticket=" + encodeURIComponent(ticketId));
    }

    const { data: ticket } = await supabase
      .from("support_tickets")
      .select("id")
      .eq("id", ticketId)
      .maybeSingle();

    if (!ticket) {
      redirect("/admin/support");
    }

    const { error } = await supabase
      .from("support_messages")
      .insert({
        ticket_id: ticketId,
        sender_id: user.id,
        sender_role: "support",
        message,
      });

    if (error) {
      redirect(
        "/admin/support?ticket=" +
          encodeURIComponent(ticketId) +
          "&error=reply"
      );
    }

    await supabase
      .from("support_tickets")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", ticketId);

    revalidatePath("/admin/support");
    revalidatePath("/support");

    redirect("/admin/support?ticket=" + encodeURIComponent(ticketId));
  }

  async function updateStatus(formData: FormData) {
    "use server";

    const { supabase, profile } = await requireAdmin();

    if (!["admin", "super_admin", "support"].includes(profile.role)) {
      redirect("/admin");
    }

    const ticketId = String(formData.get("ticket_id") || "");
    const status = String(formData.get("status") || "");

    if (!ticketId || !statuses.includes(status as TicketStatus)) {
      redirect("/admin/support");
    }

    const { error } = await supabase
      .from("support_tickets")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", ticketId);

    if (error) {
      redirect(
        "/admin/support?ticket=" +
          encodeURIComponent(ticketId) +
          "&error=status"
      );
    }

    revalidatePath("/admin/support");
    revalidatePath("/support");

    redirect("/admin/support?ticket=" + encodeURIComponent(ticketId));
  }

  return (
    <Shell>
      <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6">
        <PageTitle
          title="Support Inbox"
          subtitle="Manage customer support requests and conversations."
        />

        <section className="rounded-3xl bg-gradient-to-br from-[#062c20] via-[#075438] to-[#0b7650] p-6 text-white shadow-xl sm:p-8">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-200">
            WEALTHORA CARE · ADMIN
          </p>

          <h1 className="mt-3 text-2xl font-extrabold sm:text-3xl">
            Customer Support Inbox
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-emerald-50">
            View customer requests, respond to messages and keep track of
            support ticket progress.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3">
              <p className="text-xs text-emerald-100">Total tickets</p>
              <p className="mt-1 text-2xl font-bold">
                {tickets?.length || 0}
              </p>
            </div>

            <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3">
              <p className="text-xs text-emerald-100">Awaiting attention</p>
              <p className="mt-1 text-2xl font-bold">
                {(tickets || []).filter(
                  (ticket) =>
                    ticket.status === "open" ||
                    ticket.status === "in_progress"
                ).length}
              </p>
            </div>

            <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3">
              <p className="text-xs text-emerald-100">Resolved</p>
              <p className="mt-1 text-2xl font-bold">
                {(tickets || []).filter(
                  (ticket) =>
                    ticket.status === "resolved" ||
                    ticket.status === "closed"
                ).length}
              </p>
            </div>
          </div>
        </section>

        {ticketError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            Could not load support tickets: {ticketError.message}
          </div>
        )}

        {params.ticket && params.error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            The requested action could not be completed. Please try again.
          </div>
        )}

        <div className="grid items-start gap-5 lg:grid-cols-[0.85fr_1.15fr]">
          <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 p-5">
              <h2 className="font-bold text-gray-900">Customer requests</h2>
              <p className="mt-1 text-xs text-gray-600">
                Select a ticket to open its conversation.
              </p>
            </div>

            {!tickets?.length ? (
              <div className="px-5 py-12 text-center">
                <p className="font-semibold text-gray-900">
                  No support tickets yet
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  Customer requests will appear here when submitted.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {tickets.map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={`/admin/support?ticket=${ticket.id}`}
                    className={`block p-4 transition hover:bg-emerald-50 ${
                      selectedId === ticket.id
                        ? "bg-emerald-50"
                        : "bg-white"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold text-emerald-800">
                        {ticket.ticket_number}
                      </span>

                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ${statusStyle(ticket.status)}`}
                      >
                        {ticket.status.replace("_", " ")}
                      </span>
                    </div>

                    <p className="mt-2 text-sm font-bold text-gray-900">
                      {ticket.subject}
                    </p>

                    <p className="mt-1 text-xs text-gray-600">
                      {ticket.category}
                    </p>

                    <p className="mt-2 text-[11px] text-gray-500">
                      Last updated: {formatDate(ticket.updated_at)}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
            {selectedTicket ? (
              <>
                <div className="border-b border-gray-200 bg-emerald-50 p-5">
                  <p className="text-xs font-bold text-emerald-800">
                    {selectedTicket.ticket_number}
                  </p>

                  <h2 className="mt-2 text-lg font-bold text-gray-900">
                    {selectedTicket.subject}
                  </h2>

                  <p className="mt-1 text-xs text-gray-700">
                    {selectedTicket.category}
                  </p>

                  <p className="mt-2 break-all text-[11px] text-gray-500">
                    Customer account ID: {selectedTicket.user_id}
                  </p>

                  <div className="mt-4 border-t border-emerald-200 pt-4">
                    <form action={updateStatus} className="flex flex-wrap gap-2">
                      <input
                        type="hidden"
                        name="ticket_id"
                        value={selectedTicket.id}
                      />

                      <select
                        name="status"
                        defaultValue={selectedTicket.status}
                        className="min-w-0 flex-1 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {status.replace("_", " ").toUpperCase()}
                          </option>
                        ))}
                      </select>

                      <button
                        type="submit"
                        className="rounded-xl bg-[#075438] px-4 py-2 text-xs font-bold text-white"
                      >
                        Update status
                      </button>
                    </form>
                  </div>
                </div>

                <div className="max-h-[480px] min-h-[240px] space-y-4 overflow-y-auto bg-[#f4f7f5] p-4 sm:p-5">
                  {messageError ? (
                    <p className="rounded-xl bg-red-50 p-4 text-sm text-red-800">
                      Could not load messages: {messageError}
                    </p>
                  ) : messages.length === 0 ? (
                    <p className="py-12 text-center text-sm text-gray-600">
                      No messages have been saved for this ticket.
                    </p>
                  ) : (
                    messages.map((item) => {
                      const isSupport = item.sender_role === "support";

                      return (
                        <div
                          key={item.id}
                          className={`flex ${
                            isSupport ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[90%] rounded-2xl p-4 shadow-sm ${
                              isSupport
                                ? "rounded-br-sm bg-[#075438] text-white"
                                : "rounded-bl-sm border border-gray-200 bg-white text-gray-900"
                            }`}
                          >
                            <p
                              className={`mb-2 text-[10px] font-bold uppercase tracking-wide ${
                                isSupport
                                  ? "text-emerald-100"
                                  : "text-emerald-800"
                              }`}
                            >
                              {isSupport ? "WEALTHORA Support" : "Customer"}
                            </p>

                            <p className="whitespace-pre-wrap break-words text-sm leading-6">
                              {item.message}
                            </p>

                            <p
                              className={`mt-2 text-[10px] ${
                                isSupport
                                  ? "text-emerald-100"
                                  : "text-gray-500"
                              }`}
                            >
                              {formatDate(item.created_at)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <form action={sendReply} className="space-y-3 border-t border-gray-200 bg-white p-4">
                  <input
                    type="hidden"
                    name="ticket_id"
                    value={selectedTicket.id}
                  />

                  <label className="block text-sm font-bold text-gray-900">
                    Reply as WEALTHORA Support
                  </label>

                  <textarea
                    name="message"
                    rows={4}
                    maxLength={4000}
                    required
                    placeholder="Write your response to the customer..."
                    className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm text-gray-900 outline-none focus:border-emerald-600"
                  />

                  <p className="text-xs text-gray-500">
                    Never request a customer's password, OTP or card PIN.
                  </p>

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-[#075438] px-5 py-3 font-bold text-white hover:bg-[#06432e] sm:w-auto"
                  >
                    Send support reply
                  </button>
                </form>
              </>
            ) : (
              <div className="flex min-h-[350px] flex-col items-center justify-center p-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <span className="text-2xl">✉</span>
                </div>

                <h2 className="mt-4 font-bold text-gray-900">
                  Open a customer ticket
                </h2>

                <p className="mt-2 max-w-xs text-sm leading-6 text-gray-600">
                  Choose a request from the inbox to read the conversation and
                  reply to the customer.
                </p>
              </div>
            )}
          </section>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-950">
          <strong>Security notice:</strong> This inbox is restricted to
          authorized support administrators. All customer messages are
          protected by database access policies.
        </div>
      </main>
    </Shell>
  );
      }
