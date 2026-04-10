"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { swal } from "@/lib/swal";
import HeroPanel from "@/app/components/feature/login/HeroPanel";
import PasswordField from "@/app/components/PasswordField";
import useUserStore from "@/store/userStore";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      await swal.error("Invalid Link", "The password reset link is missing a token. Please request a new one.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/passwords/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: { token, password, password_confirmation: passwordConfirmation },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        useUserStore.getState().setUser(data.data, data.token);
        await swal.success(
          "Password Reset!",
          `Your password has been updated. Welcome back, ${data.data?.first_name ?? ""}!`,
        );
        router.replace("/");
      } else {
        const errors: string[] = data.errors ?? ["Password reset failed. Please try again."];
        await swal.error("Reset Failed", errors.join("\n"));
      }
    } catch {
      await swal.connectionError();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg px-8 py-8 w-full max-w-sm flex flex-col items-center gap-4">
      <div className="text-center">
        <p className="text-sm text-gray-600">ACLC College of Ormoc</p>
        <h2 className="text-lg font-extrabold tracking-wide text-gray-700 uppercase mt-0.5">
          Reset Password
        </h2>
      </div>

      <p className="text-sm text-gray-500 text-center">
        Enter your new password below.
      </p>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
        <PasswordField
          label=""
          placeholder="New Password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <PasswordField
          label=""
          placeholder="Confirm New Password"
          autoComplete="new-password"
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 w-full rounded-lg bg-primary py-3 text-sm font-bold text-white hover:opacity-95 hover:cursor-pointer active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Resetting…" : "Reset Password"}
        </button>
      </form>

      <Link
        href="/login"
        className="text-xs text-primary opacity-50 hover:opacity-100 transition-colors"
      >
        Back to Login
      </Link>
    </div>
  );
}

export default function ResetPasswordPage() {
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

          {/* Right — reset password card */}
          <div className="flex items-center justify-center p-10">
            <Suspense fallback={<div className="text-white">Loading…</div>}>
              <ResetPasswordForm />
            </Suspense>
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
