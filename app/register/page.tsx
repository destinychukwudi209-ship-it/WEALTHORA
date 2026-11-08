
"use client";

import Link from "next/link";

export default function Register() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050806] px-4 py-10 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(91,150,25,0.12),_transparent_65%)]" />

      <form
        className="relative z-10 grid w-full max-w-[610px] gap-6 rounded-[30px] border border-[#293b27] bg-[#0e1712] px-7 py-10 shadow-2xl sm:px-10"
        onSubmit={(e) => {
          e.preventDefault();
          alert("Account registration is not connected yet. Please wait for setup to finish.");
        }}
      >
        <div className="text-center">
          <h1 className="text-4xl font-black tracking-[0.08em]">
            <span className="text-[#b7ff36]">WEALTH</span>
            <span className="text-white">ORA</span>
          </h1>
          <p className="mt-4 text-[#929b94]">
            Your financial growth platform
          </p>
        </div>

        <div>
          <h2 className="text-3xl font-bold">Create Account</h2>
          <p className="mt-3 text-[#929b94]">
            Join WEALTHORA today.
          </p>
        </div>

        {[
          { label: "Full Name", type: "text", placeholder: "Enter your full name" },
          { label: "Email Address", type: "email", placeholder: "Enter your email" },
          { label: "Phone Number", type: "tel", placeholder: "Enter your phone number" },
          { label: "Password", type: "password", placeholder: "Create a strong password" },
        ].map((field) => (
          <div key={field.label}>
            <label className="mb-3 block font-medium text-[#e2e8e3]">
              {field.label}
            </label>
            <input
              className="w-full rounded-2xl border border-[#dce7f7] bg-[#e8f0ff] px-5 py-5 text-base text-[#111827] outline-none focus:border-[#b7ff36] focus:ring-2 focus:ring-[#b7ff36]/30"
              type={field.type}
              required
              placeholder={field.placeholder}
              minLength={field.type === "password" ? 12 : undefined}
            />
          </div>
        ))}

        <button
          className="w-full rounded-2xl bg-[#b7ff36] px-5 py-5 text-xl font-bold text-[#071006]"
        >
          Create Account
        </button>

        <p className="text-center text-sm text-[#929b94]">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-[#b7ff36]">
            Sign In
          </Link>
        </p>

        <p className="text-center text-xs text-[#929b94]">
          Secure account registration.
        </p>
      </form>
    </main>
  );
}
