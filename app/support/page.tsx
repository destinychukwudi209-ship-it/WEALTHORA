
"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Headphones,
  MessageCircle,
  Plus,
  Send,
  ShieldCheck,
  Clock3,
  CheckCircle2,
  ChevronRight,
  LifeBuoy,
  X,
  Ticket,
  Sparkles,
} from "lucide-react";
import { Shell } from "@/components/shell";
import { createClient } from "@/lib/supabase/client";

type SupportTicket = {
  id: string;
  ticket_number: string;
  category: string;
  subject: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  created_at: string;
  updated_at: string;
};

type SupportMessage = {
  id: string;
  sender_id: string;
  sender_role: "customer" | "support";
  message: string;
  created_at: string;
};

const categories = [
  "Account access",
  "Profile and verification",
  "Deposits",
  "Withdrawals",
  "Transactions",
  "Technical issue",
  "Other",
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

function statusStyle(status: SupportTicket["status"]) {
  if (status === "resolved" || status === "closed") {
    return "bg-emerald-50 text-emerald-700";
  }
  if (status === "in_progress") {
    return "bg-amber-50 text-amber-700";
  }
  return "bg-blue-50 text-blue-700";
}

export default function SupportPage() {
  const supabase = useMemo(() => createClient(), []);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [selected, setSelected] = useState<SupportTicket | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState(categories[0]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const loadTickets = useCallback(async () => {
    const { data, error: fetchError } = await supabase
      .from("support_tickets")
      .select("*")
      .order("updated_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      return;
    }

    const rows = (data || []) as SupportTicket[];
    setTickets(rows);

    if (selected) {
      const updated = rows.find((ticket) => ticket.id === selected.id);
      if (updated) setSelected(updated);
    }
  }, [supabase, selected]);

  const loadMessages = useCallback(async (ticketId: string) => {
    const { data, error: fetchError } = await supabase
      .from("support_messages")
      .select("*")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
      return;
    }

    setMessages((data || []) as SupportMessage[]);
  }, [supabase]);

  useEffect(() => {
    let mounted = true;

    async function initialise() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!mounted) return;

      if (!user) {
        setError("Please sign in to contact WEALTHORA Support.");
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("support_tickets")
        .select("*")
        .order("updated_at", { ascending: false });

      if (!mounted) return;

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setTickets((data || []) as SupportTicket[]);
      }

      setLoading(false);
    }

    void initialise();
    return () => { mounted = false; };
  }, [supabase]);

  async function createTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!subject.trim() || !message.trim()) {
      setError("Please enter a subject and describe your issue.");
      return;
    }

    setSending(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError("Please sign in again.");
      setSending(false);
      return;
    }

    const { data: ticket, error: ticketError } = await supabase
      .from("support_tickets")
      .insert({
        user_id: user.id,
        category,
        subject: subject.trim(),
      })
      .select("*")
      .single();

    if (ticketError || !ticket) {
      setError(ticketError?.message || "Could not create your ticket.");
      setSending(false);
      return;
    }

    const { error: messageError } = await supabase
      .from("support_messages")
      .insert({
        ticket_id: ticket.id,
        sender_id: user.id,
        sender_role: "customer",
        message: message.trim(),
      });

    if (messageError) {
      setError("Your ticket was created, but your message could not be saved. Please open the ticket and try again.");
      setSending(false);
      await loadTickets();
      return;
    }

    const newTicket = ticket as SupportTicket;
    setTickets((previous) => [newTicket, ...previous]);
    setSelected(newTicket);
    setMessages([]);
    await loadMessages(newTicket.id);
    setSubject("");
    setMessage("");
    setShowForm(false);
    setNotice(`Ticket ${newTicket.ticket_number} created successfully.`);
    setSending(false);
  }

  async function sendReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || !reply.trim()) return;

    setSending(true);
    setError("");
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError("Please sign in again.");
      setSending(false);
      return;
    }

    const { error: sendError } = await supabase
      .from("support_messages")
      .insert({
        ticket_id: selected.id,
        sender_id: user.id,
        sender_role: "customer",
        message: reply.trim(),
      });

    if (sendError) {
      setError(sendError.message);
    } else {
      setReply("");
      await loadMessages(selected.id);
      await loadTickets();
    }

    setSending(false);
  }

  return (
    <Shell>
      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#062c20] via-[#075438] to-[#0b7650] p-6 text-white shadow-xl sm:p-9">
          <div className="absolute -right-12 -top-16 h-56 w-56 rounded-full border-[30px] border-white/5" />
          <div className="absolute -bottom-20 right-24 h-48 w-48 rounded-full bg-[#c8a75a]/10 blur-2xl" />
          <div className="relative z-10 max-w-2xl">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
              <Headphones className="h-6 w-6 text-[#e7ca7b]" />
            </div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-emerald-100">
              <Sparkles className="h-3.5 w-3.5 text-[#e7ca7b]" />
              WEALTHORA CARE
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              We're here to help.
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-6 text-emerald-50/85 sm:text-base">
              Have a question or need assistance? Send our support team a message
              and follow your request right here.
            </p>
            <button
              onClick={() => {
                setSelected(null);
                setShowForm(true);
                setNotice("");
                setError("");
              }}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#e4c477] px-5 py-3 text-sm font-bold text-[#183a2a] shadow-lg transition hover:bg-[#f0d58f]"
            >
              <Plus className="h-4 w-4" />
              Create a support ticket
            </button>
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
                <Ticket className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">My tickets</p>
                <p className="text-2xl font-bold text-gray-900">{tickets.length}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-50 p-3 text-amber-700">
                <Clock3 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Awaiting attention</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tickets.filter((t) => t.status === "open" || t.status === "in_progress").length}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Resolved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tickets.filter((t) => t.status === "resolved" || t.status === "closed").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {notice && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            {notice}
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {showForm && (
          <section className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">WEALTHORA CARE</p>
                <h2 className="mt-1 text-xl font-bold text-gray-900">Create a ticket</h2>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="rounded-xl bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"
                aria-label="Close form"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={createTicket} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Help category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                >
                  {categories.map((item) => <option key={item}>{item}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Subject</label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  maxLength={120}
                  placeholder="What do you need help with?"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Describe your issue</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  maxLength={4000}
                  placeholder="Please explain how we can help..."
                  className="w-full resize-y rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  required
                />
              </div>
              <p className="text-xs leading-5 text-gray-500">
                Never include your password, OTP, card PIN, BVN or NIN in a support message.
              </p>
              <button
                disabled={sending}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#075438] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#06432e] disabled:opacity-50 sm:w-auto"
              >
                <Send className="h-4 w-4" />
                {sending ? "Creating ticket..." : "Submit ticket"}
              </button>
            </form>
          </section>
        )}

        <div className="grid items-start gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <div>
                <h2 className="font-bold text-gray-900">My support tickets</h2>
                <p className="mt-1 text-xs text-gray-500">Your support request history</p>
              </div>
              <LifeBuoy className="h-5 w-5 text-emerald-700" />
            </div>

            <div className="divide-y divide-gray-100">
              {loading ? (
                <p className="p-8 text-center text-sm text-gray-500">Loading your tickets...</p>
              ) : tickets.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                    <MessageCircle className="h-7 w-7" />
                  </div>
                  <p className="font-semibold text-gray-800">No tickets yet</p>
                  <p className="mt-1 text-sm text-gray-500">Your support conversations will appear here.</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="mt-5 text-sm font-bold text-emerald-700"
                  >
                    Create your first ticket
                  </button>
                </div>
              ) : tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => {
                    setSelected(ticket);
                    setShowForm(false);
                    setNotice("");
                    setError("");
                    void loadMessages(ticket.id);
                  }}
                  className={`flex w-full items-center gap-3 p-4 text-left transition hover:bg-emerald-50/50 ${
                    selected?.id === ticket.id ? "bg-emerald-50" : ""
                  }`}
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <Ticket className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-bold text-emerald-800">{ticket.ticket_number}</p>
                      <span className={`rounded-full px-2 py-1 text-[10px] font-bold capitalize ${statusStyle(ticket.status)}`}>
                        {ticket.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-sm font-semibold text-gray-900">{ticket.subject}</p>
                    <p className="mt-1 text-xs text-gray-500">{formatDate(ticket.created_at)}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
                </button>
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
            {selected ? (
              <>
                <div className="border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-white p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-emerald-800">{selected.ticket_number}</p>
                      <h2 className="mt-1 text-lg font-bold text-gray-900">{selected.subject}</h2>
                      <p className="mt-1 text-xs text-gray-500">{selected.category}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ${statusStyle(selected.status)}`}>
                      {selected.status.replace("_", " ")}
                    </span>
                  </div>
                </div>

                <div className="max-h-[420px] min-h-[220px] space-y-4 overflow-y-auto bg-gray-50/70 p-5">
                  {messages.length === 0 ? (
                    <p className="py-12 text-center text-sm text-gray-500">Loading conversation...</p>
                  ) : messages.map((item) => {
                    const isCustomer = item.sender_role === "customer";
                    return (
                      <div key={item.id} className={`flex ${isCustomer ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[88%] rounded-2xl p-4 shadow-sm ${
                          isCustomer
                            ? "rounded-br-sm bg-[#075438] text-white"
                            : "rounded-bl-sm border border-gray-100 bg-white text-gray-800"
                        }`}>
                          <p className={`mb-2 text-[10px] font-bold uppercase tracking-wide ${
                            isCustomer ? "text-emerald-100" : "text-emerald-700"
                          }`}>
                            {isCustomer ? "You" : "WEALTHORA Support"}
                          </p>
                          <p className="whitespace-pre-wrap text-sm leading-6">{item.message}</p>
                          <p className={`mt-2 text-[10px] ${isCustomer ? "text-emerald-100" : "text-gray-400"}`}>
                            {formatDate(item.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {selected.status !== "resolved" && selected.status !== "closed" ? (
                  <form onSubmit={sendReply} className="flex gap-2 border-t border-gray-100 bg-white p-4">
                    <input
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      placeholder="Write a message..."
                      maxLength={4000}
                      className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-emerald-600"
                    />
                    <button
                      disabled={sending || !reply.trim()}
                      aria-label="Send message"
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#075438] text-white hover:
bg-[#06432e] disabled:opacity-50"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </form>
                ) : (
                  <p className="border-t border-gray-100 p-4 text-center text-xs text-gray-500">
                    This ticket is closed. Create a new ticket if you need more help.
                  </p>
                )}
              </>
            ) : (
              <div className="flex min-h-[350px] flex-col items-center justify-center p-8 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <MessageCircle className="h-8 w-8" />
                </div>
                <h2 className="font-bold text-gray-900">Your support conversation</h2>
                <p className="mt-2 max-w-xs text-sm leading-6 text-gray-500">
                  Select a ticket to view its messages and continue your conversation with our support team.
                </p>
                <div className="mt-5 flex items-center gap-2 text-xs text-emerald-700">
                  <ShieldCheck className="h-4 w-4" />
                  Private support conversations
                </div>
              </div>
            )}
          </section>
        </div>

        <div className="flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
          <p className="text-xs leading-5 text-amber-900">
            <strong>Your security matters.</strong> WEALTHORA Support will never ask you to share your password, OTP or card PIN. Keep sensitive identity details private.
          </p>
        </div>

        <p className="pb-4 text-center text-xs text-gray-400">
          WEALTHORA CARE · Building wealth with trust
        </p>
      </main>
    </Shell>
  );
    }
