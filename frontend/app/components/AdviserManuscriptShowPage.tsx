"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import useUserStore from "@/store/userStore";
import { swal } from "@/lib/swal";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

interface ManuscriptDetail {
  id: number;
  title: string;
  abstract: string | null;
  authors: string | null;
  cover_img_url: string | null;
  pdf_url: string | null;
  completion_date: string | null;
  program_or_track: string | null;
  research_type: string | null;
  status: string;
  instructor: string | null;
  student_id: number | null;
  student_name: string | null;
}

interface Feedback {
  id: number;
  content: string;
  user_id: number;
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

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "approve", label: "Approved" },
  { value: "revision", label: "For Revision" },
  { value: "rejected", label: "Rejected" },
];

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

export default function AdviserManuscriptShowPage({ id }: { id: string }) {
  const { user, token } = useUserStore();
  const [manuscript, setManuscript] = useState<ManuscriptDetail | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);
  const [feedbackContent, setFeedbackContent] = useState("");
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  const fetchManuscript = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/manuscripts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data.errors ?? ["Failed to load manuscript."]).join(", "));
        return;
      }
      const data = await res.json();
      setManuscript(data.data);
      setSelectedStatus(data.data.status);
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }, [token, id]);

  const fetchFeedbacks = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/manuscripts/${id}/feedbacks`, {
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

  async function handleStatusUpdate() {
    if (!token || !selectedStatus) return;
    setStatusLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/manuscripts/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ manuscript: { status: selectedStatus } }),
      });
      const data = await res.json();
      if (res.ok) {
        setManuscript(data.data);
        await swal.success("Status Updated", "The manuscript status has been updated successfully.");
      } else {
        await swal.error("Update Failed", (data.errors ?? ["Something went wrong."]).join("\n"));
      }
    } catch {
      await swal.connectionError();
    } finally {
      setStatusLoading(false);
    }
  }

  async function handleFeedbackSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!feedbackContent.trim()) {
      await swal.error("Missing Content", "Please enter your feedback before submitting.");
      return;
    }
    if (!token) return;
    setFeedbackLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/manuscripts/${id}/feedbacks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ feedback: { content: feedbackContent } }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedbackContent("");
        await fetchFeedbacks();
        await swal.success("Feedback Submitted", "Your feedback has been added to the manuscript.");
      } else {
        await swal.error("Submit Failed", (data.errors ?? ["Something went wrong."]).join("\n"));
      }
    } catch {
      await swal.connectionError();
    } finally {
      setFeedbackLoading(false);
    }
  }

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

  return (
    <div className="flex flex-col gap-8 px-8 py-8">
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
                  href={`/adviser/students/${manuscript.student_id}`}
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
          {manuscript.pdf_url && (
            <div className="flex mt-4">
              <a
                href={`${API_BASE_URL}${manuscript.pdf_url}`}
                download
                target="_blank"
                className="rounded-md bg-primary ms-auto px-6 py-2.5 text-sm font-bold text-white hover:opacity-90 transition-all"
              >
                Download Manuscript
              </a>
            </div>
          )}
        </div>
      )}
      
      {/* ── Set Status ────────────────────────────────────────────────── */}
      <div className="border-t-1 bg-white border-gray-200 px-8 py-6">
        <h2 className="mb-4 text-lg font-bold text-gray-900">Set Status</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-md border border-gray-200 bg-gray-50 py-2.5 px-3 text-sm text-gray-900 focus:border-primary-tint focus:bg-white focus:outline-none transition-colors"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleStatusUpdate}
            disabled={statusLoading || selectedStatus === manuscript.status}
            className="rounded-md bg-primary px-6 py-2.5 text-sm font-bold text-white hover:opacity-90 hover:cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {statusLoading ? "Updating…" : "Update Status"}
          </button>
        </div>
        {selectedStatus === manuscript.status && (
          <p className="mt-2 text-xs text-gray-400">
            The manuscript already has this status.
          </p>
        )}
      </div>
      
      {/* ── Feedback List ─────────────────────────────────────────────── */}
      <div className="border-t-1  px-8 py-6">
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
                    {user && fb.user_id === user.id ? "You" : `User #${fb.user_id}`}
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

      {/* ── Add Feedback ──────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 px-8 py-6">
        <h2 className="mb-4 text-lg font-bold text-gray-900">Add Feedback</h2>
        <form onSubmit={handleFeedbackSubmit} className="flex flex-col gap-3">
          <textarea
            value={feedbackContent}
            onChange={(e) => setFeedbackContent(e.target.value)}
            placeholder="Write your feedback here…"
            rows={4}
            className="w-full rounded-md border border-gray-200 bg-gray-50 py-2.5 px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-tint focus:bg-white focus:outline-none transition-colors resize-none"
          />
          <div className="flex">
            <button
              type="submit"
              disabled={feedbackLoading}
              className="rounded-md bg-primary px-6 py-2.5 text-sm font-bold text-white hover:opacity-90 hover:cursor-pointer disabled:opacity-40 active:scale-[0.98] transition-all"
            >
              {feedbackLoading ? "Submitting…" : "Submit Feedback"}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
