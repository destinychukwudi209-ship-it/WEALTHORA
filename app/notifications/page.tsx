
"use client";

import { useEffect, useRef, useState } from "react";
import DashboardShell from "@/components/dashboard-shell";
import { createClient } from "@/lib/supabase/client";

type Notice = {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
};

export default function Notifications() {
  const [items, setItems] = useState<Notice[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [permission, setPermission] = useState("default");
  const [error, setError] = useState("");
  const audioRef = useRef<AudioContext | null>(null);
  const supabase = createClient();

  async function playRing() {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as typeof window & {
          webkitAudioContext?: typeof AudioContext;
        }).webkitAudioContext;

      if (!AudioContextClass) return;

      if (!audioRef.current) {
        audioRef.current = new AudioContextClass();
      }

      const ctx = audioRef.current;

      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      [880, 1175, 880].forEach((frequency, index) => {
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = ctx.currentTime + index * 0.22;

        oscillator.frequency.value = frequency;
        oscillator.type = "sine";
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.18, start + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.18);

        oscillator.connect(gain);
        gain.connect(ctx.destination);
        oscillator.start(start);
        oscillator.stop(start + 0.2);
      });
    } catch {
      setError("Your browser could not play the notification sound.");
    }
  }

  async function enableNotifications() {
    if (!("Notification" in window)) {
      setError("This browser does not support system notifications.");
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
    } catch {
      setError("Could not request notification permission.");
    }
  }

  async function markRead(id: string) {
    const { error: updateError } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);

    if (updateError) {
      setError("Could not mark this notification as read.");
      return;
    }

    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, is_read: true } : item
      )
    );
  }

  useEffect(() => {
    let active = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function start() {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (!active) return;

      if (authError || !user) {
        setError("Please sign in again to view your notifications.");
        setLoading(false);
        return;
      }

      if ("Notification" in window) {
        setPermission(Notification.permission);
      }

      const { data: preferences } = await supabase
        .from("notification_preferences")
        .select("sound_enabled")
        .eq("user_id", user.id)
        .maybeSingle();

      if (active && preferences) {
        setSoundEnabled(preferences.sound_enabled);
      }

      const { data, error: loadError } = await supabase
        .from("notifications")
        .select("id,title,message,type,is_read,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (!active) return;

      if (loadError) {
        setError("Could not load notifications.");
      } else {
        setItems((data || []) as Notice[]);
      }

      setLoading(false);

      channel = supabase
        .channel(`wealthora-notifications-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const notice = payload.new as Notice;

            setItems((current) => [notice, ...current]);

            if (soundEnabled) {
              void playRing();
            }

            if (
              "Notification" in window &&
              Notification.permission === "granted"
            ) {
              try {
                new Notification(`WEALTHORA: ${notice.title}`, {
                  body: notice.message,
                });
              } catch {
                setError("Your browser could not show a phone notification.");
              }
            }
          }
        )
        .subscribe();
    }

    void start();

    return () => {
      active = false;
      if (channel) void supabase.removeChannel(channel);
    };
  }, [supabase, soundEnabled]);

  async function saveSound(value: boolean) {
    setSoundEnabled(value);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSoundEnabled(!value);
      setError("Please sign in again.");
      return;
    }

    const { error: saveError } = await supabase
      .from("notification_preferences")
      .upsert(
        {
          user_id: user.id,
          sound_enabled: value,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (saveError) {
      setSoundEnabled(!value);
      setError("Could not save your sound preference.");
    }
  }

  const card =
    "rounded-2xl border border-blue-100 bg-white p-5 text-[#17366f] shadow-sm";

  return (
    <DashboardShell>
      <div className="mb-6 rounded-3xl bg-gradient-to-r from-[#e4efff] to-[#e5f5ff] p-6">
        <p className="text-sm font-semibold text-blue-700">
          Account centre
        </p>
        <h1 className="mt-2 text-3xl font-extrabold text-[#153675]">
          Notifications
        </h1>
        <p className="mt-2 text-sm text-blue-800">
          Your WEALTHORA announcements, messages and account updates.
        </p>
      </div>

      <div className="space-y-5">
        <section className={card}>
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-2xl">
              🔔
            </span>
            <div>
              <h2 className="text-lg font-bold">Notification settings</h2>
              <p className="text-sm text-slate-500">
                Control how you receive your alerts.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-blue-50 p-4">
            <div>
              <p className="font-bold text-[#17366f]">
                Ringing notification sound
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Play a tune when a new message arrives.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void saveSound(!soundEnabled)}
              className={`rounded-xl px-5 py-3 font-bold text-white ${
                soundEnabled ? "bg-blue-700" : "bg-slate-500"
              }`}
            >
              {soundEnabled ? "Sound ON" : "Sound OFF"}
            </button>
          </div>

          <button
            type="button"
            onClick={() => void playRing()}
            className="mt-4 w-full rounded-xl border border-blue-200 bg-white px-4 py-3 font-bold text-blue-800"
          >
            ▶ Test ringing tune
          </button>

          <div className="mt-5 border-t border-blue-100 pt-5">
            <h3 className="font-bold">Android phone notifications</h3>
            <p className="mt-2 text-sm text-slate-600">
              Permission status: {permission}
            </p>

            <button
              type="button"
              onClick={() => void enableNotifications()}
              className="mt-3 w-full rounded-xl bg-blue-700 px-5 py-3 font-bold text-white"
            >
              Enable phone notifications
            </button>
          </div>
        </section>

        <section className={card}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Your messages</h2>
              <p className="mt-1 text-sm text-slate-500">
                Account alerts and announcements sent to you.
              </p>
            </div>

            <span className="rounded-full bg-blue-100 px-3 py-2 text-sm font-bold text-blue-800">
              {items.filter((item) => !item.is_read).length} unread
            </span>
          </div>

          {loading && (
            <p className="mt-5 text-sm text-slate-500">
              Loading your messages...
            </p>
          )}

          {!loading && items.length === 0 && (
            <div className="mt-5 rounded-xl bg-blue-50 p-5 text-center">
              <p className="text-2xl">📭</p>
              <p className="mt-2 font-semibold text-[#17366f]">
                No notifications yet
              </p>
              <p className="mt-1 text-sm text-slate-500">
                New account updates will appear here.
              </p>
            </div>
          )}

          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <article
                key={item.id}
                className={`rounded-xl border p-4 ${
                  item.is_read
                    ? "border-blue-100 bg-white"
                    : "border-blue-300 bg-blue-50"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-bold text-[#17366f]">
                    {item.title}
                  </h3>

                  {!item.is_read && (
                    <span className="rounded-full bg-blue-700 px-3 py-1 text-xs font-bold text-white">
                      NEW
                    </span>
                  )}
                </div>

                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {item.message}
                </p>

                <p className="mt-3 text-xs text-slate-500">
                  {new Date(item.created_at).toLocaleString()}
                </p>

                {!item.is_read && (
                  <button
                    type="button"
                    onClick={() => void markRead(item.id)}
                    className="mt-3 rounded-lg bg-blue-100 px-4 py-2 text-sm font-bold text-blue-800"
                  >
                    Mark as read
                  </button>
                )}
              </article>
            ))}
          </div>
        </section>

        {error && (
          <p
            role="alert"
            className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}
      </div>
    </DashboardShell>
  );
                  }
      
