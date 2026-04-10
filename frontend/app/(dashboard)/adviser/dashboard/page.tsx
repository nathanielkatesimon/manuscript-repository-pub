"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import useUserStore from "@/store/userStore";
import ManuscriptCard, { type Manuscript } from "@/app/components/ManuscriptCard";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

const PER_PAGE = 20;

interface Meta {
  current_page: number;
  total_pages: number;
  total_count: number;
  per_page: number;
}

interface StatusCounts {
  pending: number;
  revision: number;
  approve: number;
  rejected: number;
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | "…")[] = [];
  const delta = 2;
  const left = currentPage - delta;
  const right = currentPage + delta;

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= left && i <= right)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex h-8 w-8 items-center justify-center rounded-md text-sm text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Previous page"
      >
        ‹
      </button>

      {pages.map((p, i) =>
        p === "…" ? (
          <span
            key={`ellipsis-${i}`}
            className="flex h-8 w-8 items-center justify-center text-sm text-gray-400"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            className={`flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors ${
              p === currentPage
                ? "bg-primary text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            aria-current={p === currentPage ? "page" : undefined}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex h-8 w-8 items-center justify-center rounded-md text-sm text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Next page"
      >
        ›
      </button>
    </nav>
  );
}

function AnalyticsCard({
  label,
  count,
  bgClass,
  textClass,
  href,
}: {
  label: string;
  count: number;
  bgClass: string;
  textClass: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={`rounded-2xl ${bgClass} px-6 py-5 flex flex-col gap-1 hover:opacity-80 transition-opacity`}
    >
      <p className={`text-3xl font-bold ${textClass}`}>{count}</p>
      <p className={`text-sm font-medium ${textClass}`}>{label}</p>
    </Link>
  );
}

export default function AdviserDashboardPage() {
  const { user, token } = useUserStore();
  const [counts, setCounts] = useState<StatusCounts>({
    pending: 0,
    revision: 0,
    approve: 0,
    rejected: 0,
  });
  const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
  const [meta, setMeta] = useState<Meta>({
    current_page: 1,
    total_pages: 1,
    total_count: 0,
    per_page: PER_PAGE,
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch counts for each status in parallel
  useEffect(() => {
    if (!token || !user) return;

    const fetchCounts = async () => {
      try {
        const statuses = ["pending", "revision", "approve", "rejected"] as const;
        const results = await Promise.all(
          statuses.map((status) =>
            fetch(
              `${API_BASE_URL}/api/v1/manuscripts?q[adviser_id_eq]=${user.id}&q[status_eq]=${status}&per_page=1&page=1`,
              { headers: { Authorization: `Bearer ${token}` } }
            ).then((r) => r.json())
          )
        );
        setCounts({
          pending: results[0].meta?.total_count ?? 0,
          revision: results[1].meta?.total_count ?? 0,
          approve: results[2].meta?.total_count ?? 0,
          rejected: results[3].meta?.total_count ?? 0,
        });
      } catch {
        // silently fail for counts
      }
    };

    fetchCounts();
  }, [token, user]);

  // Fetch approved manuscripts
  const fetchManuscripts = useCallback(async () => {
    if (!token || !user) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        per_page: String(PER_PAGE),
        "q[adviser_id_eq]": String(user.id),
        "q[status_eq]": "approve",
      });

      const res = await fetch(`${API_BASE_URL}/api/v1/manuscripts?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        setError("Failed to load manuscripts.");
        return;
      }

      const data = await res.json();
      setManuscripts(data.data ?? []);
      if (data.meta) setMeta(data.meta);
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }, [token, user, page]);

  useEffect(() => {
    fetchManuscripts();
  }, [fetchManuscripts]);

  return (
    <div className="flex flex-col gap-8 px-8 py-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of manuscripts assigned to you.
        </p>
      </div>

      {/* Analytics cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AnalyticsCard
          label="Pending"
          count={counts.pending}
          bgClass="bg-yellow-50"
          textClass="text-yellow-800"
          href="/adviser/pending"
        />
        <AnalyticsCard
          label="For Revision"
          count={counts.revision}
          bgClass="bg-blue-50"
          textClass="text-blue-800"
          href="/adviser/revision"
        />
        <AnalyticsCard
          label="Approved"
          count={counts.approve}
          bgClass="bg-green-50"
          textClass="text-green-800"
          href="/adviser/dashboard"
        />
        <AnalyticsCard
          label="Rejected"
          count={counts.rejected}
          bgClass="bg-red-50"
          textClass="text-red-800"
          href="/adviser/rejected"
        />
      </div>

      <hr className="border-gray-200" />

      {/* Approved manuscripts section */}
      <div className="flex flex-col gap-6">
        <h2 className="text-lg font-bold text-gray-900">Approved Manuscripts</h2>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
            Loading…
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="flex items-center justify-center py-20 text-red-500 text-sm">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && manuscripts.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <p className="text-sm">No approved manuscripts yet.</p>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && manuscripts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {manuscripts.map((m) => (
              <ManuscriptCard
                key={m.id}
                manuscript={m}
                href={`/adviser/manuscripts/${m.id}`}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && (
          <Pagination
            currentPage={meta.current_page}
            totalPages={meta.total_pages}
            onPageChange={(p) => setPage(p)}
          />
        )}
      </div>
    </div>
  );
}
