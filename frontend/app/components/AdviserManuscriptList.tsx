"use client";

import { useEffect, useState, useCallback } from "react";
import useUserStore from "@/store/userStore";
import ManuscriptCard, { type Manuscript } from "@/app/components/ManuscriptCard";
import SelectField from "@/app/components/SelectField";
import { apiFetch } from "@/lib/apiFetch";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

const PER_PAGE = 20;

const SORT_OPTIONS = [
  { value: "created_at desc", label: "Newest First" },
  { value: "created_at asc", label: "Oldest First" },
  { value: "title asc", label: "Title (A–Z)" },
  { value: "title desc", label: "Title (Z–A)" },
];

interface Meta {
  current_page: number;
  total_pages: number;
  total_count: number;
  per_page: number;
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

interface Props {
  status: string;
  title: string;
  description: string;
}

export default function AdviserManuscriptList({ status, title, description }: Props) {
  const { user, token } = useUserStore();
  const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
  const [meta, setMeta] = useState<Meta>({
    current_page: 1,
    total_pages: 1,
    total_count: 0,
    per_page: PER_PAGE,
  });
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("created_at desc");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchManuscripts = useCallback(async () => {
    if (!token || !user) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        per_page: String(PER_PAGE),
        "q[adviser_id_eq]": String(user.id),
        "q[status_eq]": status,
        "q[s]": sortBy,
      });
      if (debouncedSearch.trim()) {
        params.set("q[title_or_authors_or_research_type_cont]", debouncedSearch.trim());
      }

      const res = await apiFetch(`${API_BASE_URL}/api/v1/manuscripts?${params.toString()}`, {
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
  }, [token, user, page, debouncedSearch, status, sortBy]);

  useEffect(() => {
    fetchManuscripts();
  }, [fetchManuscripts]);

  return (
    <div className="flex flex-col gap-6 px-8 py-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>

      {/* Search bar */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search manuscripts…"
              className="w-full rounded-md border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-tint focus:bg-white focus:outline-none transition-colors"
            />
          </div>

          <SelectField
            label="Sort by"
            hideLabel
            options={SORT_OPTIONS}
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
          />

          {!loading && (
            <p className="text-sm text-gray-400">
              {meta.total_count} {meta.total_count === 1 ? "result" : "results"}
            </p>
          )}
        </div>
        <p className="text-xs text-gray-400">
          Searches by title, author(s), and research type.
        </p>
      </div>

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
          <p className="text-sm">No manuscripts found.</p>
        </div>
      )}

      {/* Grid */}
      {!loading && !error && manuscripts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {manuscripts.map((m) => (
            <ManuscriptCard
              key={m.id}
              manuscript={m}
              showStatus
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
  );
}
