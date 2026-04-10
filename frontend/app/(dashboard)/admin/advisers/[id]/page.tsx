"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import useUserStore from "@/store/userStore";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

interface Adviser {
  id: number;
  auth_id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  email: string;
  department: string;
  avatar_url: string | null;
  created_at: string;
}

interface Manuscript {
  id: number;
  title: string;
  status: string;
  student_name: string | null;
  program_or_track: string | null;
  completion_date: string | null;
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
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${style.className}`}>
      {style.label}
    </span>
  );
}

export default function AdminAdviserShowPage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useUserStore();
  const [adviser, setAdviser] = useState<Adviser | null>(null);
  const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [adviserRes, manuscriptsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/v1/advisers/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/v1/admins/manuscripts?q[adviser_id_eq]=${id}&per_page=100`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!adviserRes.ok) {
        const data = await adviserRes.json().catch(() => ({}));
        setError((data.errors ?? ["Failed to load adviser."]).join(", "));
        return;
      }

      const [adviserData, manuscriptsData] = await Promise.all([
        adviserRes.json(),
        manuscriptsRes.ok ? manuscriptsRes.json() : { data: [] },
      ]);

      setAdviser(adviserData.data);
      setManuscripts(manuscriptsData.data ?? []);
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }, [token, id]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-gray-400 text-sm">
        Loading…
      </div>
    );
  }

  if (error || !adviser) {
    return (
      <div className="flex items-center justify-center py-32 text-red-500 text-sm">
        {error ?? "Adviser not found."}
      </div>
    );
  }

  const avatarSrc = adviser.avatar_url ? `${API_BASE_URL}${adviser.avatar_url}` : '/avatar_placeholder.png';
  const fullName = [adviser.first_name, adviser.middle_name, adviser.last_name]
    .filter(Boolean)
    .join(" ");
  const joinedDate = new Date(adviser.created_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col gap-6 px-8 py-8">
      {/* Back link */}
      <div>
        <Link
          href="/admin/advisers"
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
          Back to Advisers
        </Link>
      </div>

      {/* Profile card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Avatar */}
          <div className="relative shrink-0 rounded-full overflow-hidden bg-gray-100" style={{ width: 96, height: 96 }}>
              <Image src={avatarSrc} alt={fullName} fill className="object-cover" unoptimized />
          </div>

          {/* Info */}
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-gray-900">{fullName}</h1>
            <p className="text-sm text-gray-500">{adviser.auth_id}</p>
            <span className="mt-1 inline-block rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 w-fit">
              Adviser
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Email</p>
            <p className="mt-1 text-sm text-gray-900">{adviser.email}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Department</p>
            <p className="mt-1 text-sm text-gray-900">{adviser.department}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Date Joined</p>
            <p className="mt-1 text-sm text-gray-900">{joinedDate}</p>
          </div>
        </div>
      </div>

      {/* Manuscripts */}
      <div className="rounded-2xl border border-gray-200 bg-white p-8">
        <h2 className="mb-4 text-base font-bold text-gray-900">
          Manuscripts Advised{" "}
          <span className="text-sm font-normal text-gray-400">({manuscripts.length})</span>
        </h2>
        {manuscripts.length === 0 ? (
          <p className="text-sm text-gray-400">No manuscripts found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Title</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Uploader</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Program / Track</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Year</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {manuscripts.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link href={`/admin/manuscripts/${m.id}`} className="font-medium text-primary hover:underline">
                        {m.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{m.student_name ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-700 max-w-xs truncate">{m.program_or_track ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {m.completion_date ? new Date(m.completion_date).getFullYear() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={m.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
