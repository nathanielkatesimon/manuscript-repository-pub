"use client";

import { useEffect, useState } from "react";
import useUserStore from "@/store/userStore";
import { apiFetch } from "@/lib/apiFetch";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

interface DownloadRequestCounts {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

interface DashboardStats {
  students_count: number;
  advisers_count: number;
  manuscripts_count: number;
  download_requests: DownloadRequestCounts;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400 mb-3">
      {children}
    </p>
  );
}

function Divider() {
  return <hr className="border-t border-gray-300 my-8" />;
}

function SummaryCard({
  value,
  label,
  description,
  accentColor,
  icon,
}: {
  value: number;
  label: string;
  description: string;
  accentColor: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className="bg-gray-50 rounded-lg pl-4 pr-5 py-4 flex flex-col gap-1.5 border-l-[3px]"
      style={{ borderColor: accentColor }}
    >
      <div className="flex items-center justify-between">
        <span className="text-3xl font-medium leading-none" style={{ color: accentColor }}>
          {value}
        </span>
        <span className="text-gray-300">{icon}</span>
      </div>
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <span className="text-xs text-gray-400">{description}</span>
    </div>
  );
}

function RequestCard({
  value,
  label,
  accentColor,
  badge,
}: {
  value: number;
  label: string;
  accentColor?: string;
  badge?: string;
}) {
  return (
    <div
      className={`bg-gray-50 rounded-lg px-5 py-4 flex flex-col gap-1.5 ${accentColor ? "border-l-[3px]" : ""}`}
      style={accentColor ? { borderColor: accentColor } : {}}
    >
      <span className="text-3xl font-medium leading-none text-gray-800">{value}</span>
      <span className="text-sm text-gray-500">{label}</span>
      {badge && (
        <span
          className="mt-1 inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
          style={{ background: "#FAEEDA", color: "#854F0B" }}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

function BarChart({ pending, approved, rejected, total }: DownloadRequestCounts) {
  const pct = (n: number) => (total === 0 ? 0 : Math.round((n / total) * 100));

  const rows = [
    { label: "Pending",  value: pending,  pct: pct(pending),  color: "#EF9F27" },
    { label: "Approved", value: approved, pct: pct(approved), color: "#639922" },
    { label: "Rejected", value: rejected, pct: pct(rejected), color: "#E24B4A" },
  ];

  return (
    <div className="flex flex-col gap-2.5 mt-5">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-3 text-xs">
          <span className="w-14 text-gray-500 shrink-0">{r.label}</span>
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${r.pct}%`, background: r.color }}
            />
          </div>
          <span className="w-8 text-right font-medium text-gray-700">{r.pct}%</span>
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const { token } = useUserStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    apiFetch(`${API_BASE_URL}/api/v1/admins/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setStats(data.data ?? null))
      .catch(() => setError("Could not load dashboard stats."))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="px-8 py-8">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-400">
          System-wide overview of users, content, and activity.
        </p>
      </div>

      {loading && <p className="mt-8 text-sm text-gray-400">Loading…</p>}
      {!loading && error && <p className="mt-8 text-sm text-red-500">{error}</p>}

      {!loading && stats && (
        <>
          <Divider />

          {/* Summary cards */}
          <SectionLabel>System summary</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <SummaryCard
              value={stats.students_count}
              label="Students"
              description="Registered student accounts"
              accentColor="#378ADD"
              icon={
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="8" cy="5" r="2.5" />
                  <path d="M2.5 13c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
                </svg>
              }
            />
            <SummaryCard
              value={stats.advisers_count}
              label="Advisers"
              description="Faculty adviser accounts"
              accentColor="#7F77DD"
              icon={
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="7" cy="5" r="2.5" />
                  <path d="M1.5 13c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
                  <path d="M12 3v4M14 5h-4" strokeLinecap="round" />
                </svg>
              }
            />
            <SummaryCard
              value={stats.manuscripts_count}
              label="Manuscripts"
              description="Submitted research papers"
              accentColor="#1D9E75"
              icon={
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="2" width="10" height="12" rx="1" />
                  <path d="M5.5 6h5M5.5 8.5h5M5.5 11h3" />
                </svg>
              }
            />
          </div>

          <Divider />

          {/* Download requests */}
          <div className="flex items-end justify-between mb-3">
            <div>
              <SectionLabel>Download requests</SectionLabel>
              <p className="text-xs text-gray-400 -mt-2">
                Breakdown of all file access requests submitted by students.
              </p>
            </div>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 rounded-full px-3 py-1">
              {stats.download_requests.total} total
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <RequestCard value={stats.download_requests.total}    label="Total" />
            <RequestCard value={stats.download_requests.pending}  label="Pending"  accentColor="#EF9F27" badge={stats.download_requests.pending > 0 ? "Needs review" : undefined} />
            <RequestCard value={stats.download_requests.approved} label="Approved" accentColor="#639922" />
            <RequestCard value={stats.download_requests.rejected} label="Rejected" accentColor="#E24B4A" />
          </div>

          <BarChart {...stats.download_requests} />

          <Divider />

          {/* Attention tip */}
          {stats.download_requests.pending > 0 && (
            <div className="rounded-r-lg border-l-[3px] border-amber-400 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              There {stats.download_requests.pending === 1 ? "is" : "are"}{" "}
              <strong>{stats.download_requests.pending}</strong> pending download{" "}
              {stats.download_requests.pending === 1 ? "request" : "requests"} that{" "}
              {stats.download_requests.pending === 1 ? "requires" : "require"} your attention.
              Review {stats.download_requests.pending === 1 ? "it" : "them"} in the Download Requests section.
            </div>
          )}
        </>
      )}
    </div>
  );
}