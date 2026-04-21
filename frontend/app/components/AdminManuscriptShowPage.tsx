"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import useUserStore from "@/store/userStore";
import { apiFetch } from "@/lib/apiFetch";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

interface ManuscriptDetail {
  id: number;
  title: string;
  abstract: string | null;
  authors: string | null;
  cover_img_url: string | null;
  completion_date: string | null;
  program_or_track: string | null;
  research_type: string | null;
  status: string;
  instructor: string | null;
  student_id: number | null;
  student_name: string | null;
  adviser_id: number | null;
  pdf_url: string | null;
  audit_logs?: AuditLog[];
  created_at: string;
  updated_at: string;
}

interface AuditLog {
  id: number;
  editor_id: number;
  editor_name: string | null;
  editor_role: string | null;
  field_changes: Record<string, [unknown, unknown]>;
  created_at: string;
}

interface Feedback {
  id: number;
  content: string;
  user_id: number;
  user_first_name: string | null;
  user_last_name: string | null;
  manuscript_id: number;
  created_at: string;
  updated_at: string;
}

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
  approve: { label: "Approved", className: "bg-green-100 text-green-800" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-800" },
  revision: { label: "For Revision", className: "bg-blue-100 text-blue-800" },
};

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status.toLowerCase()] ?? {
    label: status.charAt(0).toUpperCase() + status.slice(1),
    className: "bg-gray-100 text-gray-700",
  };
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold leading-none ${style.className}`}
    >
      {style.label}
    </span>
  );
}

function MetaItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="shrink-0 text-white/60">{icon}</span>
      <p className="text-base text-white/90">
        <span className="font-semibold text-white">{label}:</span> {value}
      </p>
    </div>
  );
}

function MetaItemLink({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="shrink-0 text-white/60">{icon}</span>
      <p className="text-base text-white/90">
        <span className="font-semibold text-white">{label}:</span>{" "}
        <Link href={href} className="underline underline-offset-2 hover:text-white transition-colors">
          {value}
        </Link>
      </p>
    </div>
  );
}

export default function AdminManuscriptShowPage({ id }: { id: string }) {
  const { token } = useUserStore();
  const [manuscript, setManuscript] = useState<ManuscriptDetail | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchManuscript = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/v1/admins/manuscripts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data.errors ?? ["Failed to load manuscript."]).join(", "));
        return;
      }
      const data = await res.json();
      setManuscript(data.data);
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }, [token, id]);

  const fetchFeedbacks = useCallback(async () => {
    if (!token) return;
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/v1/manuscripts/${id}/feedbacks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setFeedbacks(data.data ?? []);
    } catch {
      // silently fail for feedbacks
    }
  }, [token, id]);

  useEffect(() => {
    fetchManuscript();
  }, [fetchManuscript]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-gray-400 text-sm">
        Loading…
      </div>
    );
  }

  if (error || !manuscript) {
    return (
      <div className="flex items-center justify-center py-32 text-red-500 text-sm">
        {error ?? "Manuscript not found."}
      </div>
    );
  }

  const coverSrc = manuscript.cover_img_url
    ? `${API_BASE_URL}${manuscript.cover_img_url}`
    : null;

  const completedYear = manuscript.completion_date
    ? new Date(manuscript.completion_date).getFullYear().toString()
    : null;

  const handleDownload = () => {
    if (!manuscript.pdf_url) return;
    if (!manuscript.pdf_url.startsWith("/")) return;
    const url = `${API_BASE_URL}${manuscript.pdf_url}`;
    const safeFilename = manuscript.title.replace(/[^a-zA-Z0-9\s\-_.]/g, "").trim() || "manuscript";
    const a = document.createElement("a");
    a.href = url;
    a.download = `${safeFilename}.pdf`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex flex-col gap-8 px-8 py-8">
      {/* Back link */}
      <div>
        <Link
          href="/admin/manuscripts"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Manuscripts
        </Link>
      </div>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-primary overflow-hidden">
        <div className="flex flex-col md:flex-row gap-8 p-8 md:p-10">
          {/* Cover image */}
          <div
            className="relative shrink-0 rounded-xl overflow-hidden mx-auto md:mx-0"
            style={{ width: 240, height: 330 }}
          >
            {coverSrc ? (
              <Image
                src={coverSrc}
                alt={manuscript.title}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-white/10 text-white/30">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="64"
                  height="64"
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
          </div>

          {/* Details */}
          <div className="flex flex-col justify-end gap-5 py-2">
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
              {manuscript.title}
            </h1>

            <div>
              <StatusBadge status={manuscript.status} />
            </div>

            <div className="flex flex-col gap-3">
              {manuscript.authors && (
                <MetaItem
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  }
                  label="Authors"
                  value={manuscript.authors}
                />
              )}
              {manuscript.instructor && (
                <MetaItem
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                      <path d="M6 12v5c3 3 9 3 12 0v-5" />
                    </svg>
                  }
                  label="Research Instructor"
                  value={manuscript.instructor}
                />
              )}
              {completedYear && (
                <MetaItem
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  }
                  label="Completed"
                  value={completedYear}
                />
              )}
              {manuscript.program_or_track && (
                <MetaItem
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                      <path d="M6 12v5c3 3 9 3 12 0v-5" />
                    </svg>
                  }
                  label="Program / Track"
                  value={manuscript.program_or_track}
                />
              )}
              {manuscript.student_id && manuscript.student_name && (
                <MetaItemLink
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  }
                  label="Uploader"
                  value={manuscript.student_name}
                  href={`/admin/students/${manuscript.student_id}`}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Abstract ──────────────────────────────────────────────────── */}
      {manuscript.abstract && (
        <div className="px-8 py-6">
          <h2 className="mb-3 text-lg font-bold text-gray-900">Abstract</h2>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {manuscript.abstract}
          </p>
        </div>
      )}

      {/* ── Download PDF ──────────────────────────────────────────────── */}
      {manuscript.pdf_url && (
        <div className="ms-auto px-8">
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 cursor-pointer transition-opacity"
          >
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
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download PDF
          </button>
        </div>
      )}

      {/* ── Feedback List ─────────────────────────────────────────────── */}
      <div className="border-t border-gray-200 px-8 py-6">
        <h2 className="mb-4 text-lg font-bold text-gray-900">
          Feedbacks{" "}
          {feedbacks.length > 0 && (
            <span className="text-sm font-normal text-gray-400">
              ({feedbacks.length})
            </span>
          )}
        </h2>

        {feedbacks.length === 0 ? (
          <p className="text-sm text-gray-400">No feedbacks yet.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {feedbacks.map((fb) => (
              <li
                key={fb.id}
                className="rounded-xl border border-gray-100 bg-gray-50 px-5 py-4"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                   <span className="text-xs font-semibold text-gray-500">
                     {fb.user_first_name && fb.user_last_name ? (
                       <Link
                         href={`/admin/advisers/${fb.user_id}`}
                         className="hover:underline hover:text-gray-700"
                       >
                         {fb.user_first_name} {fb.user_last_name}
                       </Link>
                     ) : (
                       `User #${fb.user_id}`
                     )}
                   </span>
                  <span className="text-xs text-gray-400">
                    {new Date(fb.created_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {fb.content}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Audit Logs ─────────────────────────────────────────────────── */}
      <div className="border-t border-gray-200 px-8 py-6">
        <h2 className="mb-4 text-lg font-bold text-gray-900">
          Audit Logs{" "}
          {manuscript.audit_logs && manuscript.audit_logs.length > 0 && (
            <span className="text-sm font-normal text-gray-400">
              ({manuscript.audit_logs.length})
            </span>
          )}
        </h2>

        {!manuscript.audit_logs || manuscript.audit_logs.length === 0 ? (
          <p className="text-sm text-gray-400">No audit logs yet.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {manuscript.audit_logs.map((log) => (
              <li
                key={log.id}
                className="rounded-xl border border-gray-100 bg-gray-50 px-5 py-4"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-gray-500">
                    {log.editor_name ?? `User #${log.editor_id}`} ({log.editor_role ?? "unknown"})
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(log.created_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <ul className="list-disc pl-5 text-sm text-gray-700">
                  {Object.entries(log.field_changes).map(([field, values]) => (
                    <li key={`${log.id}-${field}`}>
                      <span className="font-medium">{field}</span>: {String(values[0] ?? "nil")} →{" "}
                      {String(values[1] ?? "nil")}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
