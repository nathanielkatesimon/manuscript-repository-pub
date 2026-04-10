"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import useUserStore from "@/store/userStore";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

interface Manuscript {
  id: number;
  title: string;
  authors: string | null;
  program_or_track: string | null;
  research_type: string | null;
  status: string;
  completion_date: string | null;
  student_id: number | null;
  adviser_id: number | null;
  created_at: string;
}

interface Meta {
  current_page: number;
  total_pages: number;
  total_count: number;
  per_page: number;
}

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approve: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  revision: "bg-blue-100 text-blue-800",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  approve: "Approved",
  rejected: "Rejected",
  revision: "For Revision",
};

export default function AdminManuscriptsPage() {
  const { token } = useUserStore();
  const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const fetchManuscripts = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("per_page", "20");
      if (search.trim()) params.set("q[title_cont]", search.trim());
      if (statusFilter) params.set("q[status_eq]", statusFilter);

      const res = await fetch(`${API_BASE_URL}/api/v1/admins/manuscripts?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setManuscripts(data.data ?? []);
        setMeta(data.meta ?? null);
      } else {
        setError("Failed to load manuscripts.");
      }
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }, [token, page, search, statusFilter]);

  useEffect(() => {
    fetchManuscripts();
  }, [fetchManuscripts]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchManuscripts();
  }

  return (
    <div className="flex flex-col gap-6 px-8 py-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manuscripts</h1>
        <p className="mt-1 text-sm text-gray-500">Browse and view all manuscripts in the system.</p>
      </div>

      {/* Filters */}
      <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Search by title</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="rounded-md border border-gray-200 bg-gray-50 py-2 px-3 text-sm text-gray-900 focus:border-primary focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="rounded-md border border-gray-200 bg-gray-50 py-2 px-3 text-sm text-gray-900 focus:border-primary focus:outline-none"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approve">Approved</option>
            <option value="revision">For Revision</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md bg-primary px-5 py-2 text-sm font-bold text-white hover:opacity-90 hover:cursor-pointer"
        >
          Search
        </button>
      </form>

      {loading && <p className="text-sm text-gray-400">Loading…</p>}
      {!loading && error && <p className="text-sm text-red-500">{error}</p>}
      {!loading && !error && manuscripts.length === 0 && (
        <p className="text-sm text-gray-400 py-20 text-center">No manuscripts found.</p>
      )}

      {!loading && !error && manuscripts.length > 0 && (
        <>
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Title</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Authors</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Program / Track</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {manuscripts.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700 max-w-xs truncate font-medium">{m.title}</td>
                    <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{m.authors ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{m.program_or_track ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[m.status] ?? "bg-gray-100 text-gray-700"}`}
                      >
                        {STATUS_LABELS[m.status] ?? m.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {m.completion_date ? new Date(m.completion_date).getFullYear() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/manuscripts/${m.id}`}
                        className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta && meta.total_pages > 1 && (
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>
                Page {meta.current_page} of {meta.total_pages} ({meta.total_count} total)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={meta.current_page <= 1}
                  className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-40 hover:cursor-pointer disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(meta.total_pages, p + 1))}
                  disabled={meta.current_page >= meta.total_pages}
                  className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-40 hover:cursor-pointer disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
