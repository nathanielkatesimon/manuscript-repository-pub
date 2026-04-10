"use client";

import { useState } from "react";
import Link from "next/link";
import { swal } from "@/lib/swal";
import HeroPanel from "@/app/components/feature/login/HeroPanel";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/passwords/forgot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: { email } }),
      });

      const data = await response.json();

      if (response.ok) {
        await swal.success(
          "Email Sent",
          data.message ?? "If that email exists in our system, a reset link has been sent.",
        );
        setEmail("");
      } else {
        const errors: string[] = data.errors ?? ["Something went wrong. Please try again."];
        await swal.error("Request Failed", errors.join("\n"));
      }
    } catch {
      await swal.connectionError();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ── Top nav ───────────────────────────────────────────────── */}
      <header className="flex items-center justify-end gap-4 px-8 py-4">
        <Link
          href="/login"
          className="text-sm font-medium text-gray-700 hover:text-black transition-colors"
        >
          Back to Login
        </Link>
      </header>

      {/* ── Main hero card ────────────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center px-6 pb-12">
        <div className="w-full max-w-4xl rounded-2xl bg-gray-400 grid grid-cols-1 md:grid-cols-2 overflow-hidden shadow-md">
          {/* Left — hero text */}
          <HeroPanel />

          {/* Right — forgot password card */}
          <div className="flex items-center justify-center p-10">
            <div className="bg-white rounded-2xl shadow-lg px-8 py-8 w-full max-w-sm flex flex-col items-center gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">ACLC College of Ormoc</p>
                <h2 className="text-lg font-extrabold tracking-wide text-gray-700 uppercase mt-0.5">
                  Forgot Password
                </h2>
              </div>

              <p className="text-sm text-gray-500 text-center">
                Enter the email address associated with your account and we&apos;ll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <input
                    type="email"
                    placeholder="Email Address"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-tint focus:bg-white focus:outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-1 w-full rounded-lg bg-primary py-3 text-sm font-bold text-white hover:opacity-95 hover:cursor-pointer active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Sending…" : "Send Reset Link"}
                </button>
              </form>

              <Link
                href="/login"
                className="text-xs text-primary opacity-50 hover:opacity-100 transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="flex flex-col items-center gap-3 pb-8">
        <p className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="inline-flex items-center justify-center rounded-full border border-gray-400 w-4 h-4 text-[10px] leading-none text-gray-500">
            c
          </span>
          2026 ACLC College of Ormoc
        </p>
      </footer>
    </div>
  );
}
