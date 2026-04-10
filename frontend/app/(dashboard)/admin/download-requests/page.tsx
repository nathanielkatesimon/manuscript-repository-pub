"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import useUserStore from "@/store/userStore";
import { swal } from "@/lib/swal";
import TextAreaField from "@/app/components/TextAreaField";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

interface DownloadRequest {
  id: number;
  student_id: number;
  student_name: string | null;
  manuscript_id: number;
  manuscript_title: string | null;
  status: "pending" | "approved" | "rejected";
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_BADGE: Record<DownloadRequest["status"], string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export default function DownloadRequestsPage() {
  const { token } = useUserStore();
  const [requests, setRequests] = useState<DownloadRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionReasonError, setRejectionReasonError] = useState<string | null>(null);
  const [rejectSubmitting, setRejectSubmitting] = useState(false);

  const fetchRequests = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admins/download_requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setRequests(data.data ?? []);
      } else {
        setError("Failed to load download requests.");
      }
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  async function handleApprove(id: number) {
    setActionId(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admins/download_requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ download_request: { status: "approved" } }),
      });
      if (res.ok) {
        await fetchRequests();
      } else {
        const data = await res.json();
        await swal.error("Error", (data.errors ?? []).join("\n"));
      }
    } catch {
      await swal.connectionError();
    } finally {
      setActionId(null);
    }
  }

  async function handleReject(id: number) {
    setRejectTargetId(id);
    setRejectionReason("");
    setRejectionReasonError(null);
    setRejectModalOpen(true);
  }

  async function submitReject() {
    if (!rejectTargetId) return;
    if (!rejectionReason.trim()) {
      setRejectionReasonError("Rejection reason is required.");
      return;
    }

    const id = rejectTargetId;
    setRejectSubmitting(true);
    setActionId(id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admins/download_requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ download_request: { status: "rejected", rejection_reason: rejectionReason } }),
      });
      if (res.ok) {
        setRejectModalOpen(false);
        await fetchRequests();
      } else {
        const data = await res.json();
        await swal.error("Error", (data.errors ?? []).join("\n"));
      }
    } catch {
      await swal.connectionError();
    } finally {
      setRejectSubmitting(false);
      setActionId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6 px-8 py-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Download Requests</h1>
        <p className="mt-1 text-sm text-gray-500">Review and moderate manuscript download requests.</p>
      </div>

      {rejectModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => !rejectSubmitting && setRejectModalOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && !rejectSubmitting && setRejectModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="reject-modal-title"
          tabIndex={-1}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="reject-modal-title" className="text-lg font-semibold text-gray-900">Reject Request</h2>
            <TextAreaField
              label="Rejection Reason"
              required
              placeholder="Enter reason for rejection…"
              rows={4}
              value={rejectionReason}
              onChange={(e) => {
                setRejectionReason(e.target.value);
                if (rejectionReasonError) setRejectionReasonError(null);
              }}
            />
            {rejectionReasonError && (
              <p className="text-xs text-red-500">{rejectionReasonError}</p>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectModalOpen(false)}
                disabled={rejectSubmitting}
                className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40 hover:cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={submitReject}
                disabled={rejectSubmitting}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-40 hover:cursor-pointer"
              >
                {rejectSubmitting ? "Rejecting…" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && <p className="text-sm text-gray-400">Loading…</p>}
      {!loading && error && <p className="text-sm text-red-500">{error}</p>}
      {!loading && !error && requests.length === 0 && (
        <p className="text-sm text-gray-400 py-20 text-center">No download requests found.</p>
      )}

      {!loading && !error && requests.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">ID</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Student</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Manuscript</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Rejection Reason</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Date</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">{req.id}</td>
                  <td className="px-4 py-3 text-gray-700">
                    <Link
                      href={`/admin/students/${req.student_id}`}
                      className="text-primary hover:underline"
                    >
                      {req.student_name ?? `Student #${req.student_id}`}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    <Link
                      href={`/admin/manuscripts/${req.manuscript_id}`}
                      className="text-primary hover:underline"
                    >
                      {req.manuscript_title ?? req.manuscript_id}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[req.status]}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{req.rejection_reason ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(req.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    {req.status === "pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(req.id)}
                          disabled={actionId === req.id}
                          className="rounded-md bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-40 hover:cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(req.id)}
                          disabled={actionId === req.id}
                          className="rounded-md bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-40 hover:cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    )}
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
