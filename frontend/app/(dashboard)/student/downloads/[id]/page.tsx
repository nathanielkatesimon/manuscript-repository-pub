"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import useUserStore from "@/store/userStore";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

interface DownloadRequestDetail {
  id: number;
  manuscript_id: number;
  manuscript_title: string | null;
  manuscript_cover_img_url: string | null;
  manuscript_pdf_url: string | null;
  status: "pending" | "approved" | "rejected";
  rejection_reason: string | null;
  created_at: string;
}

export default function DownloadRequestShowPage({ params }: { params: Promise<{ id: string }> }) {
  const { token } = useUserStore();
  const [request, setRequest] = useState<DownloadRequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvedId, setResolvedId] = useState<string | null>(null);

  useEffect(() => {
    params.then(({ id }) => setResolvedId(id));
  }, [params]);

  useEffect(() => {
    if (!token || !resolvedId) return;

    const fetchRequest = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/students/download_requests/${resolvedId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError((data.errors ?? ["Failed to load request."]).join(", "));
          return;
        }
        const data = await res.json();
        setRequest(data.data);
      } catch {
        setError("Could not connect to the server.");
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [token, resolvedId]);

  const handleDownload = () => {
    if (!request?.manuscript_pdf_url) return;
    if (!request.manuscript_pdf_url.startsWith("/")) return;
    const url = `${API_BASE_URL}${request.manuscript_pdf_url}`;
    const safeFilename = (request.manuscript_title ?? "manuscript").replace(/[^a-zA-Z0-9\s\-_.]/g, "").trim() || "manuscript";
    const a = document.createElement("a");
    a.href = url;
    a.download = `${safeFilename}.pdf`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-gray-400 text-sm">
        Loading…
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="flex items-center justify-center py-32 text-red-500 text-sm">
        {error ?? "Request not found."}
      </div>
    );
  }

  const coverSrc = request.manuscript_cover_img_url
    ? `${API_BASE_URL}${request.manuscript_cover_img_url}`
    : null;

  const isPending = request.status === "pending";
  const isApproved = request.status === "approved";
  const isRejected = request.status === "rejected";

  return (
    <div className="flex flex-col gap-8 px-8 py-8 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Download Request</h1>
        <p className="mt-1 text-sm text-gray-500">Review the status of your manuscript download request.</p>
      </div>

      {/* Manuscript card */}
      <div className="flex items-start gap-5 rounded-2xl border border-gray-200 bg-white p-5">
        <div
          className="relative shrink-0 overflow-hidden rounded-lg bg-gray-100"
          style={{ width: 80, height: 110 }}
        >
          {coverSrc ? (
            <Image
              src={coverSrc}
              alt={request.manuscript_title ?? "Manuscript"}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <p className="font-semibold text-gray-900 text-base leading-snug">
            {request.manuscript_title ?? "Untitled"}
          </p>
          <p className="text-xs text-gray-400">
            Requested on {new Date(request.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
      </div>

      {/* Status section */}
      {isPending && (
        <div className="rounded-xl border border-yellow-300 bg-yellow-50 px-5 py-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block h-2 w-2 rounded-full bg-yellow-400" />
            <p className="font-semibold text-yellow-800 text-sm">Pending Review</p>
          </div>
          <p className="text-sm text-yellow-700">
            Your request is currently under review by the administrator. You will be notified once a decision has been made.
          </p>
        </div>
      )}

      {isApproved && (
        <div className="rounded-xl border border-green-300 bg-green-50 px-5 py-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
            <p className="font-semibold text-green-800 text-sm">Access Approved</p>
          </div>
          <p className="text-sm text-green-700 mb-4">
            Your request has been approved. You can now download the full manuscript.
          </p>
          {request.manuscript_pdf_url && (
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 cursor-pointer transition-opacity"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Full Manuscript Download
            </button>
          )}
        </div>
      )}

      {isRejected && (
        <div className="rounded-xl border border-red-300 bg-red-50 px-5 py-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
            <p className="font-semibold text-red-800 text-sm">Request Rejected</p>
          </div>
          <p className="text-sm text-red-700">
            Your download request was not approved.
          </p>
          {request.rejection_reason && (
            <div className="mt-3 rounded-lg bg-red-100 px-4 py-3">
              <p className="text-xs font-semibold text-red-700 mb-1">Reason</p>
              <p className="text-sm text-red-800">{request.rejection_reason}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
