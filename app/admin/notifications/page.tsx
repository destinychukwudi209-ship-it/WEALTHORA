
"use client";

import { useState } from "react";
import { Shell, PageTitle } from "@/components/shell";

const categories = [
  "announcement",
  "deposit",
  "withdrawal",
  "investment",
  "security",
];

const inputStyle =
  "w-full rounded-xl border border-gray-300 bg-white p-3 text-gray-900 caret-green-700 placeholder:text-gray-400 focus:border-green-700 focus:outline-none focus:ring-2 focus:ring-green-700/20";

export default function AdminNotifications() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("announcement");
  const [audience, setAudience] = useState("all");
  const [preview, setPreview] = useState(false);
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  async function sendNotification() {
    if (!title.trim() || !message.trim() || sending) return;

    setSending(true);
    setStatus("Sending notification...");

    try {
      const response = await fetch("/api/admin/notifications/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
          type,
          audience,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setStatus(result.error || "Could not send notification.");
        return;
      }

      setStatus("Notification sent successfully!");
      setTitle("");
      setMessage("");
      setPreview(false);
    } catch {
      setStatus("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Shell>
      <PageTitle
        title="Admin Notification Centre"
        subtitle="Send announcements and important customer alerts."
      />

      <div className="space-y-5">
        <section className="panel space-y-4">
          <h2 className="text-lg font-bold text-white">
            Create notification
          </h2>

          <div>
            <label className="mb-2 block font-semibold text-white">
              Notification category
            </label>

            <select
              className={inputStyle}
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() +
                    category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block font-semibold text-white">
              Send to
            </label>

            <select
              className={inputStyle}
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
            >
              <option value="all">All active customers</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block font-semibold text-white">
              Notification title
            </label>

            <input
              type="text"
              className={inputStyle}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter notification title"
              maxLength={100}
            />

            <p className="mt-1 text-xs text-gray-400">
              {title.length}/100 characters
            </p>
          </div>

          <div>
            <label className="mb-2 block font-semibold text-white">
              Message
            </label>

            <textarea
              className={`${inputStyle} min-h-32 resize-y`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message to customers..."
              rows={5}
              maxLength={2000}
            />

            <p className="mt-1 text-xs text-gray-400">
              {message.length}/2000 characters
            </p>
          </div>

          <button
            type="button"
            className="btn w-full"
            disabled={!title.trim() || !message.trim()}
            onClick={() => {
              setStatus("");
              setPreview(true);
            }}
          >
            Preview notification
          </button>
        </section>

        {preview && (
          <section className="panel space-y-3">
            <h2 className="text-lg font-bold text-white">
              Notification preview
            </h2>

            <p className="text-sm font-semibold text-green-400">
              Category: {type}
            </p>

            <h3 className="text-xl font-bold text-white break-words">
              {title}
            </h3>

            <p className="whitespace-pre-wrap break-words text-white">
              {message}
            </p>

            <p className="muted text-sm">
              Audience: All active customers
            </p>

            <button
              type="button"
              className="btn w-full"
              disabled={sending}
              onClick={() => void sendNotification()}
            >
              {sending ? "Sending..." : "Send notification"}
            </button>

            <button
              type="button"
              className="w-full rounded-xl border border-gray-400 p-3 font-semibold text-white"
              disabled={sending}
              onClick={() => setPreview(false)}
            >
              Go back and edit
            </button>
          </section>
        )}

        {status && (
          <p
            className={`rounded-xl border p-3 text-sm ${
              status.includes("successfully")
                ? "border-green-500 bg-green-950 text-green-300"
                : "border-gray-500 bg-gray-900 text-white"
            }`}
          >
            {status}
          </p>
        )}
      </div>
    </Shell>
  );
              }
