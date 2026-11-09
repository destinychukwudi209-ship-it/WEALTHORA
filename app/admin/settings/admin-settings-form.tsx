
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Preferences = {
  notification_email: boolean;
  notification_in_app: boolean;
  notification_sound: boolean;
};

type PlatformValues = {
  platform_name: string;
  support_email: string;
  support_phone: string;
};

const defaults: Preferences = {
  notification_email: true,
  notification_in_app: true,
  notification_sound: true,
};

const platformDefaults: PlatformValues = {
  platform_name: "WEALTHORA",
  support_email: "wealthora.support@gmail.com",
  support_phone: "",
};

export default function AdminSettingsForm() {
  const [preferences, setPreferences] = useState(defaults);
  const [platform, setPlatform] = useState(platformDefaults);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadSettings() {
      const supabase = createClient();

      const { data: { user }, error: authError } =
        await supabase.auth.getUser();

      if (authError || !user) {
        if (active) {
          setMessage("Please sign in again to load admin settings.");
          setLoading(false);
        }
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role,status")
        .eq("id", user.id)
        .maybeSingle();

      if (
        profileError ||
        !profile ||
        profile.status !== "active" ||
        !["admin", "super_admin", "finance", "support"].includes(profile.role)
      ) {
        if (active) {
          setMessage("Your administrator permissions could not be verified.");
          setLoading(false);
        }
        return;
      }

      if (active) setIsSuperAdmin(profile.role === "super_admin");

      const { data: userSettings, error: userError } = await supabase
        .from("user_settings")
        .select("notification_email,notification_in_app,notification_sound")
        .eq("user_id", user.id)
        .maybeSingle();

      if (userError) {
        if (active) setMessage("Could not load notification preferences.");
      } else if (userSettings && active) {
        setPreferences({
          notification_email: userSettings.notification_email,
          notification_in_app: userSettings.notification_in_app,
          notification_sound: userSettings.notification_sound,
        });
      }

      if (profile.role === "super_admin") {
        const { data: rows, error: platformError } = await supabase
          .from("platform_settings")
          .select("setting_key,setting_value");

        if (platformError) {
          if (active) setMessage("Could not load platform settings.");
        } else if (rows && active) {
          const values: Record<string, unknown> = {};

          rows.forEach((row) => {
            values[row.setting_key] = row.setting_value;
          });

          const readValue = (key: string, fallback: string) => {
            const value = values[key];
            if (
              value &&
              typeof value === "object" &&
              "value" in value &&
              typeof (value as { value: unknown }).value === "string"
            ) {
              return (value as { value: string }).value;
            }
            return fallback;
          };

          setPlatform({
            platform_name: readValue("platform_name", platformDefaults.platform_name),
            support_email: readValue("support_email", platformDefaults.support_email),
            support_phone: readValue("support_phone", platformDefaults.support_phone),
          });
        }
      }

      if (active) setLoading(false);
    }

    loadSettings();

    return () => {
      active = false;
    };
  }, []);

  async function saveSettings() {
    setSaving(true);
    setMessage("");

    try {
      const supabase = createClient();
      const { data: { user }, error: authError } =
        await supabase.auth.getUser();

      if (authError || !user) {
        setMessage("Your session has expired. Please sign in again.");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role,status")
        .eq("id", user.id)
        .maybeSingle();

      if (
        profileError ||
        !profile ||
        profile.status !== "active" ||
        !["admin", "super_admin", "finance", "support"].includes(profile.role)
      ) {
        setMessage("You are not authorized to save these settings.");
        return;
      }

      const { error: preferenceError } = await supabase
        .from("user_settings")
        .upsert({
          user_id: user.id,
          ...preferences,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });

      if (preferenceError) {
        setMessage("Could not save your notification preferences: " + preferenceError.message);
        return;
      }

      if (profile.role === "super_admin") {
        const entries = [
          ["platform_name", platform.platform_name.trim()],
          ["support_email", platform.support_email.trim()],
          ["support_phone", platform.support_phone.trim()],
        ] as const;

        for (const [setting_key, value] of entries) {
          const { error } = await supabase
            .from("platform_settings")
            .upsert({
              setting_key,
              setting_value: { value },
              updated_by: user.id,
              updated_at: new Date().toISOString(),
            }, { onConflict: "setting_key" });

          if (error) {
            setMessage("Notification preferences saved, but platform settings failed: " + error.message);
            return;
          }
        }
      }

      setMessage("Settings saved successfully.");
    } catch {
      setMessage("An unexpected error occurred while saving settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="panel p-5">Loading administrator settings...</div>;
  }

  return (
    <div className="grid gap-6">
      {message && (
        <div className="rounded-xl border border-[#31583a] bg-[#10291a] p-4 text-sm text-lime-200">
          {message}
        </div>
      )}

      <section className="rounded-2xl border border-[#24452b] bg-[#09170e] p-5">
        <h2 className="text-lg font-bold text-white">
          Admin notification preferences
        </h2>
        <p className="mt-2 text-sm text-gray-400">
          These preferences apply to your own administrator account.
        </p>

        <div className="mt-5 grid gap-4">
          {([
            ["notification_email", "Email notifications"],
            ["notification_in_app", "In-app notifications"],
            ["notification_sound", "Notification sound"],
          ] as const).map(([key, label]) => (
            <label key={key} className="flex items-center justify-between gap-4 rounded-xl border border-[#24452b] p-4">
              <span className="text-sm font-semibold text-white">{label}</span>
              <input
                type="checkbox"
                checked={preferences[key]}
                onChange={(e) =>
                  setPreferences((current) => ({
                    ...current,
                    [key]: e.target.checked,
                  }))
                }
                className="h-5 w-5 accent-lime-400"
              />
            </label>
          ))}
        </div>
      </section>

      {isSuperAdmin && (
        <section className="rounded-2xl border border-lime-500/30 bg-[#09170e] p-5">
          <h2 className="text-lg font-bold text-lime-300">
            Platform settings
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Only the active super administrator can change these details.
          </p>

          <div className="mt-5 grid gap-4">
            <label className="grid gap-2 text-sm font-semibold">
              Platform name
              <input
                value={platform.platform_name}
                onChange={(e) =>
                  setPlatform({ ...platform, platform_name: e.target.value })
                }
                className="rounded-xl bg-[#e8f0ff] p-3 text-[#111827]"
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold">
              Support email
              <input
                type="email"
                value={platform.support_email}
                onChange={(e) =>
                  setPlatform({ ...platform, support_email: e.target.value })
                }
                className="rounded-xl bg-[#e8f0ff] p-3 text-[#111827]"
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold">
              Support phone
              <input
                type="tel"
                value={platform.support_phone}
                onChange={(e) =>
                  setPlatform({ ...platform, support_phone: e.target.value })
                }
                className="rounded-xl bg-[#e8f0ff] p-3 text-[#111827]"
              />
            </label>
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={saveSettings}
        disabled={saving}
        className="w-full rounded-xl bg-[#b7ff35] px-5 py-4 font-extrabold text-[#071b10] disabled:opacity-50"
      >
        {saving ? "Saving settings..." : "Save admin settings"}
      </button>

      <p className="text-xs leading-5 text-gray-500">
        Email delivery and notification sound playback still depend on their
        respective notification services and browser permissions being configured.
      </p>
    </div>
  );
        }
                  
