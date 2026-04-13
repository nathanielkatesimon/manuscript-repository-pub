"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import useUserStore from "@/store/userStore";
import { swal } from "@/lib/swal";
import InputField from "@/app/components/InputField";
import SelectField from "@/app/components/SelectField";
import PasswordField from "@/app/components/PasswordField";
import { DEPARTMENTS } from "@/lib/departments";
import { apiFetch } from "@/lib/apiFetch";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";
const DEPT_OPTIONS = DEPARTMENTS.map((d) => ({ value: d, label: d }));

interface Adviser {
  id: number;
  auth_id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  email: string;
  department: string;
  created_at: string;
}

const EMPTY_FORM = {
  auth_id: "",
  first_name: "",
  middle_name: "",
  last_name: "",
  email: "",
  password: "",
  password_confirmation: "",
  department: "",
};

export default function AdvisersPage() {
  const { token } = useUserStore();
  const [advisers, setAdvisers] = useState<Adviser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Adviser | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  const fetchAdvisers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/v1/advisers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setAdvisers(data.data ?? []);
      else setError("Failed to load advisers.");
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAdvisers();
  }, [fetchAdvisers]);

  function openCreate() {
    setEditTarget(null);
    setForm({ ...EMPTY_FORM });
    setModalOpen(true);
  }

  function openEdit(adviser: Adviser) {
    setEditTarget(adviser);
    setForm({
      auth_id: adviser.auth_id,
      first_name: adviser.first_name,
      middle_name: adviser.middle_name ?? "",
      last_name: adviser.last_name,
      email: adviser.email,
      password: "",
      password_confirmation: "",
      department: adviser.department,
    });
    setModalOpen(true);
  }

  async function handleDelete(adviser: Adviser) {
    const result = await swal.fire({
      title: "Delete Adviser?",
      text: `This will permanently delete ${adviser.first_name} ${adviser.last_name}.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    });
    if (!result.isConfirmed) return;

    try {
      const res = await apiFetch(`${API_BASE_URL}/api/v1/admins/advisers/${adviser.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchAdvisers();
      } else {
        const data = await res.json();
        await swal.error("Error", (data.errors ?? []).join("\n"));
      }
    } catch {
      await swal.connectionError();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const url = editTarget
      ? `${API_BASE_URL}/api/v1/admins/advisers/${editTarget.id}`
      : `${API_BASE_URL}/api/v1/admins/advisers`;
    const method = editTarget ? "PATCH" : "POST";

    const body: Record<string, string> = {
      first_name: form.first_name,
      middle_name: form.middle_name,
      last_name: form.last_name,
      email: form.email,
      department: form.department,
    };
    if (!editTarget) body.auth_id = form.auth_id;
    if (form.password) {
      body.password = form.password;
      body.password_confirmation = form.password_confirmation;
    }

    try {
      const res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ adviser: body }),
      });
      const data = await res.json();
      if (res.ok) {
        setModalOpen(false);
        await fetchAdvisers();
        await swal.success(
          editTarget ? "Adviser Updated" : "Adviser Created",
          editTarget ? "The adviser account has been updated." : "The adviser account has been created."
        );
      } else {
        await swal.error("Error", (data.errors ?? []).join("\n"));
      }
    } catch {
      await swal.connectionError();
    } finally {
      setSaving(false);
    }
  }

  function f(key: keyof typeof EMPTY_FORM) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
  }

  const filteredAdvisers = advisers.filter((a) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    const fullName = [a.first_name, a.middle_name, a.last_name].filter(Boolean).join(" ").toLowerCase();
    return fullName.includes(q) || a.auth_id.toLowerCase().includes(q);
  });

  return (
    <div className="flex flex-col gap-6 px-8 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advisers</h1>
          <p className="mt-1 text-sm text-gray-500">Manage adviser accounts.</p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-md bg-primary px-5 py-2 text-sm font-bold text-white hover:opacity-90 hover:cursor-pointer"
        >
          + Add Adviser
        </button>
      </div>

      {/* Search bar */}
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
            placeholder="Search by name or Auth ID…"
            className="w-full rounded-md border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-tint focus:bg-white focus:outline-none transition-colors"
          />
        </div>
        {!loading && (
          <p className="text-sm text-gray-400">
            {filteredAdvisers.length} {filteredAdvisers.length === 1 ? "result" : "results"}
          </p>
        )}
      </div>

      {loading && <p className="text-sm text-gray-400">Loading…</p>}
      {!loading && error && <p className="text-sm text-red-500">{error}</p>}
      {!loading && !error && filteredAdvisers.length === 0 && (
        <p className="text-sm text-gray-400 py-20 text-center">No advisers found.</p>
      )}

      {!loading && !error && filteredAdvisers.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Auth ID</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Name</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Email</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Department</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAdvisers.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">{a.auth_id}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {[a.first_name, a.middle_name, a.last_name].filter(Boolean).join(" ")}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{a.email}</td>
                  <td className="px-4 py-3 text-gray-700">{a.department}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/advisers/${a.id}`}
                        className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => openEdit(a)}
                        className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 hover:cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(a)}
                        className="rounded-md bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700 hover:cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl">
            <h2 className="mb-6 text-lg font-bold text-gray-900">
              {editTarget ? "Edit Adviser" : "Add Adviser"}
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {!editTarget && (
                <InputField label="Auth ID" required value={form.auth_id} onChange={f("auth_id")} placeholder="XX-XXXX-XXX" />
              )}
              <div className="grid grid-cols-2 gap-4">
                <InputField label="First Name" required value={form.first_name} onChange={f("first_name")} />
                <InputField label="Middle Name" value={form.middle_name} onChange={f("middle_name")} />
              </div>
              <InputField label="Last Name" required value={form.last_name} onChange={f("last_name")} />
              <InputField label="Email" required type="email" value={form.email} onChange={f("email")} />
              <SelectField label="Department" required options={DEPT_OPTIONS} value={form.department} onChange={f("department")} placeholder="Select" />
              <PasswordField label={editTarget ? "New Password (leave blank to keep)" : "Password"} value={form.password} onChange={f("password")} />
              <PasswordField label="Confirm Password" value={form.password_confirmation} onChange={f("password_confirmation")} />
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-md border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-md bg-primary px-6 py-2 text-sm font-bold text-white hover:opacity-90 hover:cursor-pointer disabled:opacity-40"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
