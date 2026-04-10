"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { swal } from "@/lib/swal";
import HeroPanel from "@/app/components/feature/login/HeroPanel";
import LoginCard from "@/app/components/feature/login/LoginCard";
import useUserStore from "@/store/userStore";

type LoginMode = "student" | "adviser" | "admin";

const CONFIG: Record<
  LoginMode,
  {
    title: string;
    identifierLabel: string;
    identifierPlaceholder: string;
    /** The CTA button shown in the top-right nav */
    ctaLabel: string;
    ctaTarget: LoginMode;
  }
> = {
  student: {
    title: "Login",
    identifierLabel: "USN",
    identifierPlaceholder: "USN",
    ctaLabel: "Adviser Login",
    ctaTarget: "adviser",
  },
  adviser: {
    title: "Adviser Login",
    identifierLabel: "Employee ID",
    identifierPlaceholder: "Employee ID",
    ctaLabel: "Student Login",
    ctaTarget: "student",
  },
  admin: {
    title: "Admin Login",
    identifierLabel: "Username",
    identifierPlaceholder: "Username",
    ctaLabel: "Student Login",
    ctaTarget: "student",
  },
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

export default function LoginPage() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const [mode, setMode] = useState<LoginMode>("student");
  const [authId, setAuthId] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace("/");
    }
  }, [user, router]);

  const cfg = CONFIG[mode];

  const handleModeChange = (newMode: LoginMode) => {
    setMode(newMode);
    setAuthId("");
    setPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = `${API_BASE_URL}/api/v1/${mode}s/session`;
      const body = { [mode]: { auth_id: authId, password } };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        useUserStore.getState().setUser(data.data, data.token);
        await swal.success(
          "Login Successful!",
          `Welcome, ${data.data?.first_name ?? ""}!`,
        );
      } else {
        const errors: string[] = data.errors ?? ["Login failed. Please try again."];
        await swal.error("Login Failed", errors.join("\n"));
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
          href="/register"
          className="text-sm font-medium text-gray-700 hover:text-black transition-colors"
        >
          Create Account
        </Link>

        {/* Switch between student ↔ adviser */}
        <button
          type="button"
          onClick={() => handleModeChange(cfg.ctaTarget)}
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white hover:opacity-95 hover:cursor-pointer active:scale-[0.98] transition-all duration-150"
        >
          {cfg.ctaLabel}
        </button>
      </header>

      {/* ── Main hero card ────────────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center px-6 pb-12">
        <div className="w-full max-w-4xl rounded-2xl bg-gray-400 grid grid-cols-1 md:grid-cols-2 overflow-hidden shadow-md">
          {/* Left — hero text */}
          <HeroPanel />

          {/* Right — login card */}
          <div className="flex items-center justify-center p-10">
            <LoginCard
              title={cfg.title}
              identifierLabel={cfg.identifierLabel}
              identifierPlaceholder={cfg.identifierPlaceholder}
              authId={authId}
              onAuthIdChange={(e) => setAuthId(e.target.value)}
              password={password}
              onPasswordChange={(e) => setPassword(e.target.value)}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </main>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="flex flex-col items-center gap-3 pb-8">
        {/* Admin login link — subtle, tucked in the footer */}
        {mode !== "admin" && (
          <button
            type="button"
            onClick={() => handleModeChange("admin")}
            className="text-xs text-gray-400 hover:text-primary hover:cursor-pointer transition-colors"
          >
            Admin Portal
          </button>
        )}

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