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

export default function AdminNotifications() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("announcement");
  const [audience, setAudience] = useState("all");
  const [preview, setPreview] = useState(false);
  const [status, setStatus] = useState("");

  async function sendNotification() {
    setStatus("Sending...");

    try {
      const response = await fetch(
        "/api/admin/notifications/send",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            message,
            type,
            audience,
          }),
        }
      );

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
          <h2 className="text-lg font-bold">
            Create notification
          </h2>

          <div>
            <label className="mb-2 block font-semibold">
              Notification category
            </label>
            <select
              className="w-full rounded-xl border p-3"
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
            <label className="mb-2 block font-semibold">
              Send to
            </label>
            <select
              className="w-full rounded-xl border p-3"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
            >
              <option value="all">All active customers</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block font-semibold">
              Notification title
            </label>
            <input
              className="w-full rounded-xl border p-3"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter notification title"
              maxLength={100}
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold">
              Message
            </label>
            <textarea
              className="w-full rounded-xl border p-3"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message to customers..."
              rows={5}
              maxLength={2000}
            />
          </div>

          <button
            type="button"
            className="btn w-full"
            disabled={!title.trim() || !message.trim()}
            onClick={() => setPreview(true)}
          >
            Preview notification
          </button>
        </section>

        {preview && (
          <section className="panel space-y-3">
            <h2 className="text-lg font-bold">
              Preview
            </h2>

            <p className="text-sm font-semibold">
              Category: {type}
            </p>

            <h3 className="text-xl font-bold">
              {title}
            </h3>

            <p className="whitespace-pre-wrap">
              {message}
            </p>

            <p className="muted text-sm">
              Audience: All active customers
            </p>

            <button
              type="button"
              className="btn w-full"
              onClick={sendNotification}
            >
              Send notification
            </button>

            <button
              type="button"
              className="w-full rounded-xl border p-3 font-semibold"
              onClick={() => setPreview(false)}
            >
              Go back and edit
            </button>
          </section>
        )}

        {status && (
          <p className="rounded-xl border p-3 text-sm">
            {status}
          </p>
        )}
      </div>
    </Shell>
  );
            }
