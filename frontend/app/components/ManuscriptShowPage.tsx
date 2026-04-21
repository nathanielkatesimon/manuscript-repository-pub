"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import useUserStore from "@/store/userStore";
import { apiFetch } from "@/lib/apiFetch";
import React from "react";
import StudentTopbar from "./student/StudentTopbar";

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
  adviser_id: number | null;
  pdf_url: string | null;
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
  pending:  { label: "Pending",  className: "bg-yellow-100 text-yellow-800" },
  approve:  { label: "Approved", className: "bg-green-100 text-green-800" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-800" },
  revision: { label: "Revision", className: "bg-blue-100 text-blue-800" },
};

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status.toLowerCase()] ?? {
    label: status.charAt(0).toUpperCase() + status.slice(1),
    className: "bg-gray-100 text-gray-700",
  };
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold leading-none ${style.className}`}>
      {style.label}
    </span>
  );
}

function MetaItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="shrink-0 text-white/60">{icon}</span>
      <p className="text-base text-white/90">
        <span className="font-semibold text-white">{label}:</span>{" "}
        {value}
      </p>
    </div>
  );
}

export default function ManuscriptShowPage({ id, showTitle }: { showTitle?: string, id: string }) {
  const { token, user } = useUserStore();
  const [manuscript, setManuscript] = useState<ManuscriptDetail | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) return;

    const fetchManuscript = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch(`${API_BASE_URL}/api/v1/manuscripts/${id}`, {
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
    };

    fetchManuscript();
  }, [token, id]);

  const isStudentOwner = user?.role === "student" && manuscript?.student_id === user.id;

  useEffect(() => {
    if (!token || !manuscript || !isStudentOwner) {
      setFeedbacks([]);
      return;
    }

    const fetchFeedbacks = async () => {
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
    };

    fetchFeedbacks();
  }, [token, id, manuscript, isStudentOwner]);

  const isOwner = user && manuscript && (
    (user.role === "student" && manuscript.student_id === user.id) ||
    (user.role === "adviser" && manuscript.adviser_id === user.id)
  );

  const handleDownload = () => {
    if (!manuscript?.pdf_url) return;
    // Only allow relative paths from our own API to prevent open redirect
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

  const handleDownloadButtonClick = () => {
    if (isOwner) {
      handleDownload();
    } else {
      setAgreed(false);
      setSubmitError(null);
      setShowRequestDialog(true);
    }
  };

  const handleSubmitRequest = async () => {
    if (!token || !manuscript) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/v1/students/download_requests`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ download_request: { manuscript_id: manuscript.id } }),
      });
      if (res.ok) {
        setShowRequestDialog(false);
        setShowReviewDialog(true);
      } else {
        setSubmitError("Failed to submit request. Please try again.");
      }
    } catch {
      setSubmitError("Could not connect to the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

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

  return <React.Fragment>
    <StudentTopbar title={showTitle || "Manuscript"}>
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

            {/* Title */}
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
              {manuscript.title}
            </h1>

            {/* Status */}
            <div>
              <StatusBadge status={manuscript.status} />
            </div>

            {/* Meta items */}
            <div className="flex flex-col gap-3">
              {manuscript.authors && (
                <MetaItem
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            </div>
          </div>
        </div>
      </div>
    </StudentTopbar>
    <div className="flex flex-col gap-8 px-8 py-8">      
      {/* ── Abstract ──────────────────────────────────────────────────── */}
      {manuscript.abstract && (
        <div className="px-8 py-6">
          <h2 className="mb-3 text-lg font-bold text-gray-900">Abstract</h2>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {manuscript.abstract}
          </p>
        </div>
      )}

      {isStudentOwner && (
        <div className="border-t border-gray-200 px-8 py-6">
          <h2 className="mb-4 text-lg font-bold text-gray-900">
            Adviser Feedbacks{" "}
            {feedbacks.length > 0 && (
              <span className="text-sm font-normal text-gray-400">({feedbacks.length})</span>
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
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-gray-500">
                      {fb.user_first_name && fb.user_last_name
                        ? `${fb.user_first_name} ${fb.user_last_name}`
                        : `User #${fb.user_id}`}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(fb.created_at).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <blockquote className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                    {fb.content}
                  </blockquote>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ── Non-owner warning alert ────────────────────────────────────── */}
      {!isOwner && (
        <div className="rounded-xl border border-yellow-500 bg-yellow-100 px-5 py-4 text-sm text-gray-800">
          <p>
            <span className="font-semibold">Preview only.</span>{" "}
            This abstract is provided for preview purposes only. Full manuscript access is subject to approval.
          </p>
        </div>
      )}
      
      {/* Download button */}
      {manuscript.pdf_url && (
        <div className="ms-auto">
          <button
            onClick={handleDownloadButtonClick}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 cursor-pointer transition-opacity"
          >
            {isOwner ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            )}
            Full Manuscript Download
          </button>
        </div>
      )}

      {/* ── Request access dialog ──────────────────────────────────────── */}
      {showRequestDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-2 text-lg font-bold text-gray-900">
              Request full manuscript access?
            </h2>
            <p className="mb-4 text-sm text-gray-600">
              You are requesting access to download the full manuscript. All downloads are watermarked and logged for security purposes.
            </p>

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
              />
              <span className="text-sm text-gray-700">
                I agree not to redistribute or misuse this manuscript.
              </span>
            </label>

            <div className="mt-5 flex justify-end gap-3">
              {submitError && (
                <p className="flex-1 self-center text-xs text-red-600">{submitError}</p>
              )}
              <button
                onClick={() => setShowRequestDialog(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRequest}
                disabled={!agreed || submitting}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 cursor-pointer transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting…" : "Submit request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Under review dialog ────────────────────────────────────────── */}
      {showReviewDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-2 text-lg font-bold text-gray-900">Request submitted</h2>
            <p className="text-sm text-gray-600">
              Your request is currently under review by the administrator.
            </p>
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowReviewDialog(false)}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 cursor-pointer transition-opacity"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </React.Fragment>
}
