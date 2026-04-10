"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import useUserStore from "@/store/userStore";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

interface Student {
  id: number;
  auth_id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  email: string;
  program_or_track: string;
  year_level: string;
  avatar_url: string | null;
  created_at: string;
}

interface Manuscript {
  id: number;
  title: string;
  status: string;
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

export default function AdviserStudentShowPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { token } = useUserStore();
  const [student, setStudent] = useState<Student | null>(null);
  const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [studentRes, manuscriptsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/v1/students/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/v1/manuscripts?q[student_id_eq]=${id}&per_page=100`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!studentRes.ok) {
        const data = await studentRes.json().catch(() => ({}));
        setError((data.errors ?? ["Failed to load student."]).join(", "));
        return;
      }

      const [studentData, manuscriptsData] = await Promise.all([
        studentRes.json(),
        manuscriptsRes.ok ? manuscriptsRes.json() : { data: [] },
      ]);

      setStudent(studentData.data);
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

  if (error || !student) {
    return (
      <div className="flex items-center justify-center py-32 text-red-500 text-sm">
        {error ?? "Student not found."}
      </div>
    );
  }

  const avatarSrc = student.avatar_url ? `${API_BASE_URL}${student.avatar_url}` : null;
  const fullName = [student.first_name, student.middle_name, student.last_name]
    .filter(Boolean)
    .join(" ");
  const joinedDate = new Date(student.created_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col gap-6 px-8 py-8">
      {/* Back link */}
      <div>
        <button
          onClick={() => router.back()}
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
          Back
        </button>
      </div>

      {/* Profile card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Avatar */}
          <div className="relative shrink-0 rounded-full overflow-hidden bg-gray-100" style={{ width: 96, height: 96 }}>
            {avatarSrc ? (
              <Image src={avatarSrc} alt={fullName} fill className="object-cover" unoptimized />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-gray-900">{fullName}</h1>
            <p className="text-sm text-gray-500">{student.auth_id}</p>
            <span className="mt-1 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 w-fit">
              Student
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Email</p>
            <p className="mt-1 text-sm text-gray-900">{student.email}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Program / Track</p>
            <p className="mt-1 text-sm text-gray-900">{student.program_or_track}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Year Level</p>
            <p className="mt-1 text-sm text-gray-900">{student.year_level}</p>
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
          Manuscripts{" "}
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
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Program / Track</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Year</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {manuscripts.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link href={`/adviser/manuscripts/${m.id}`} className="font-medium text-primary hover:underline">
                        {m.title}
                      </Link>
                    </td>
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
