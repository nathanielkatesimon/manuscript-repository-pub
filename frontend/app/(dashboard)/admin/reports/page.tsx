"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import useUserStore from "@/store/userStore";
import { apiFetch } from "@/lib/apiFetch";

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

interface ReportSummary {
  approve: number;
  rejected: number;
  revision: number;
}

interface ReportManuscripts {
  approve: Manuscript[];
  rejected: Manuscript[];
  revision: Manuscript[];
}

interface ReportData {
  summary: ReportSummary;
  manuscripts: ReportManuscripts;
}

const STATUS_BADGE: Record<string, string> = {
  approve: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  revision: "bg-blue-100 text-blue-800",
};

const STATUS_LABELS: Record<string, string> = {
  approve: "Approved",
  rejected: "Rejected",
  revision: "For Revision",
};

function SummaryCard({
  label,
  count,
  colorClass,
}: {
  label: string;
  count: number;
  colorClass: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
      <span className={`text-3xl font-bold ${colorClass}`}>{count}</span>
      <span className="text-sm font-medium text-gray-500">{label}</span>
    </div>
  );
}

function ManuscriptTable({
  title,
  manuscripts,
  status,
}: {
  title: string;
  manuscripts: Manuscript[];
  status: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <h2 className="text-base font-semibold text-gray-800">{title}</h2>
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[status] ?? "bg-gray-100 text-gray-700"}`}
        >
          {manuscripts.length}
        </span>
      </div>
      {manuscripts.length === 0 ? (
        <p className="text-sm text-gray-400 py-6 text-center rounded-xl border border-gray-200 bg-white">
          No manuscripts found.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Title</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Authors</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Program / Track</th>
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
      )}
    </div>
  );
}

export default function AdminReportsPage() {
  const { token } = useUserStore();
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    apiFetch(`${API_BASE_URL}/api/v1/admins/report`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setReport(data.data);
        } else {
          setError("Failed to load report.");
        }
      })
      .catch(() => setError("Could not connect to the server."))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="flex flex-col gap-8 px-8 py-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manuscript status summary and detailed records.
        </p>
      </div>

      {loading && <p className="text-sm text-gray-400">Loading…</p>}
      {!loading && error && <p className="text-sm text-red-500">{error}</p>}

      {!loading && !error && report && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SummaryCard
              label="Approved"
              count={report.summary.approve}
              colorClass="text-green-600"
            />
            <SummaryCard
              label="Rejected"
              count={report.summary.rejected}
              colorClass="text-red-600"
            />
            <SummaryCard
              label="For Revision"
              count={report.summary.revision}
              colorClass="text-blue-600"
            />
          </div>

          <hr className="border-t border-gray-200" />

          {/* Manuscript Tables by Status */}
          <ManuscriptTable
            title="Approved Manuscripts"
            manuscripts={report.manuscripts.approve}
            status="approve"
          />
          <ManuscriptTable
            title="Rejected Manuscripts"
            manuscripts={report.manuscripts.rejected}
            status="rejected"
          />
          <ManuscriptTable
            title="Manuscripts for Revision"
            manuscripts={report.manuscripts.revision}
            status="revision"
          />
        </>
      )}
    </div>
  );
}
