"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import useUserStore from "@/store/userStore";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

const PER_PAGE = 20;

interface DownloadRequest {
  id: number;
  manuscript_id: number;
  manuscript_title: string | null;
  manuscript_cover_img_url: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

interface Meta {
  current_page: number;
  total_pages: number;
  total_count: number;
  per_page: number;
}

const REQUEST_STATUS_STYLES: Record<string, { label: string; className: string }> = {
  pending:  { label: "Pending",  className: "bg-yellow-100 text-yellow-800" },
  approved: { label: "Approved", className: "bg-green-100 text-green-800" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-800" },
};

function RequestStatusBadge({ status }: { status: string }) {
  const style = REQUEST_STATUS_STYLES[status.toLowerCase()] ?? {
    label: status.charAt(0).toUpperCase() + status.slice(1),
    className: "bg-gray-100 text-gray-700",
  };
  return (
    <span className={`absolute top-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-semibold leading-none ${style.className}`}>
      {style.label}
    </span>
  );
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
          <span key={`ellipsis-${i}`} className="flex h-8 w-8 items-center justify-center text-sm text-gray-400">
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

export default function MyDownloadsPage() {
  const { token } = useUserStore();
  const [requests, setRequests] = useState<DownloadRequest[]>([]);
  const [meta, setMeta] = useState<Meta>({ current_page: 1, total_pages: 1, total_count: 0, per_page: PER_PAGE });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        per_page: String(PER_PAGE),
      });
      const res = await fetch(`${API_BASE_URL}/api/v1/students/download_requests?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setError("Failed to load download requests.");
        return;
      }
      const data = await res.json();
      setRequests(data.data ?? []);
      if (data.meta) setMeta(data.meta);
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }, [token, page]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return (
    <div className="flex flex-col gap-6 px-8 py-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Downloads</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track your manuscript download requests and access approved downloads.
        </p>
      </div>

      {/* Count */}
      {!loading && (
        <p className="text-sm text-gray-400">
          {meta.total_count} {meta.total_count === 1 ? "request" : "requests"}
        </p>
      )}

      {/* Divider */}
      <hr className="border-gray-200" />

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
      {!loading && !error && requests.length === 0 && (
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
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <p className="text-sm">You have no download requests yet.</p>
        </div>
      )}

      {/* Grid */}
      {!loading && !error && requests.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {requests.map((req) => {
            const coverSrc = req.manuscript_cover_img_url
              ? `${API_BASE_URL}${req.manuscript_cover_img_url}`
              : null;
            return (
              <Link
                key={req.id}
                href={`/student/downloads/${req.id}`}
                className="block hover:opacity-90 transition-opacity"
              >
                <div className="flex flex-col gap-2">
                  <div
                    className="relative overflow-hidden rounded-lg bg-gray-100 border border-gray-200 mx-auto"
                    style={{ width: 169, height: 232 }}
                  >
                    {coverSrc ? (
                      <Image
                        src={coverSrc}
                        alt={req.manuscript_title ?? "Manuscript"}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-gray-300">
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
                      </div>
                    )}
                    <RequestStatusBadge status={req.status} />
                  </div>
                  <div className="w-full" style={{ maxWidth: 169, margin: "0 auto" }}>
                    <p className="truncate text-sm font-semibold text-gray-900 leading-snug">
                      {req.manuscript_title ?? "Untitled"}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{req.status}</p>
                  </div>
                </div>
              </Link>
            );
          })}
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
  );
}
