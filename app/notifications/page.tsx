
"use client";

import { useEffect, useRef, useState } from "react";
import { Shell, PageTitle } from "@/components/shell";
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

  return (
    <Shell>
      <PageTitle
        title="Announcements & notifications"
        subtitle="Your WEALTHORA alerts, messages and account updates."
      />

      <div className="space-y-5">
        <section className="panel">
          <h2 className="text-lg font-bold">Notification settings</h2>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold">Ringing notification sound 🔔</p>
              <p className="muted text-sm">
                Play a tune when a new message arrives.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void saveSound(!soundEnabled)}
              className="btn"
            >
              {soundEnabled ? "Sound ON" : "Sound OFF"}
            </button>
          </div>

          <button
            type="button"
            onClick={() => void playRing()}
            className="mt-4 rounded-xl border border-green-700 px-4 py-3 font-semibold text-green-800"
          >
            Test ringing tune
          </button>

          <div className="mt-5 border-t pt-4">
            <p className="font-semibold">Android pop-up notifications</p>
            <p className="muted mt-1 text-sm">
              Browser permission: {permission}
            </p>

            <button
              type="button"
              onClick={() => void enableNotifications()}
              className="btn mt-3"
            >
              Enable phone notifications
            </button>
          </div>
        </section>

        <section className="panel">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold">Your messages</h2>
            <span className="text-sm text-gray-500">
              {items.filter((item) => !item.is_read).length} unread
            </span>
          </div>

          {loading && <p className="muted mt-4">Loading messages...</p>}

          {!loading && items.length === 0 && (
            <p className="muted mt-4">
              You don't have any notifications yet.
            </p>
          )}

          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <article
                key={item.id}
                className="rounded-xl border border-gray-200 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-bold">{item.title}</h3>
                  {!item.is_read && (
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-800">
                      NEW
                    </span>
                  )}
                </div>

                <p className="mt-2 text-sm text-gray-600">
                  {item.message}
                </p>

                <p className="muted mt-3 text-xs">
                  {new Date(item.created_at).toLocaleString()}
                </p>

                {!item.is_read && (
                  <button
                    type="button"
                    onClick={() => void markRead(item.id)}
                    className="mt-3 text-sm font-bold text-green-800"
                  >
                    Mark as read
                  </button>
                )}
              </article>
            ))}
          </div>
        </section>

        {error && (
          <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}
      </div>
    </Shell>
  );
          }
        
