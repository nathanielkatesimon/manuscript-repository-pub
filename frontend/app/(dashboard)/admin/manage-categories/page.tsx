"use client";

import { useCallback, useEffect, useState } from "react";
import useUserStore from "@/store/userStore";
import { apiFetch } from "@/lib/apiFetch";
import { swal } from "@/lib/swal";
import type { Category } from "@/lib/categories";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

const EMPTY_FORM = {
  title: "",
  name: "",
};

export default function ManageCategoriesPage() {
  const { token } = useUserStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const fetchCategories = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/v1/admins/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setCategories(data.data ?? []);
      else setError("Failed to load categories.");
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  function openCreate() {
    setEditTarget(null);
    setForm({ ...EMPTY_FORM });
  }

  function openEdit(category: Category) {
    setEditTarget(category);
    setForm({ title: category.title, name: category.name });
  }

  async function handleDelete(category: Category) {
    const result = await swal.fire({
      title: "Delete Category?",
      text: `This will delete "${category.name}".`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    });
    if (!result.isConfirmed) return;

    try {
      const res = await apiFetch(`${API_BASE_URL}/api/v1/admins/categories/${category.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchCategories();
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
      ? `${API_BASE_URL}/api/v1/admins/categories/${editTarget.id}`
      : `${API_BASE_URL}/api/v1/admins/categories`;
    const method = editTarget ? "PATCH" : "POST";

    try {
      const res = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ category: form }),
      });
      const data = await res.json();
      if (res.ok) {
        openCreate();
        await fetchCategories();
      } else {
        await swal.error("Error", (data.errors ?? []).join("\n"));
      }
    } catch {
      await swal.connectionError();
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-white px-10 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Manage Categories</h1>
        <p className="mt-1 text-sm text-gray-500">
          Create, edit, and delete manuscript categories.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mb-8 rounded-xl border border-gray-200 bg-white p-4">
        <h2 className="mb-4 text-base font-semibold text-gray-900">{editTarget ? "Edit Category" : "Add Category"}</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <input
            required
            type="text"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Group title (e.g. Bachelor Degrees)"
            className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:border-primary-tint focus:bg-white focus:outline-none"
          />
          <input
            required
            type="text"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Program/track name"
            className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:border-primary-tint focus:bg-white focus:outline-none"
          />
        </div>
        <div className="mt-4 flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-40"
          >
            {saving ? "Saving..." : editTarget ? "Update Category" : "Add Category"}
          </button>
          {editTarget && (
            <button
              type="button"
              onClick={openCreate}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {loading && <p className="text-sm text-gray-400">Loading…</p>}
      {!loading && error && <p className="text-sm text-red-500">{error}</p>}

      {!loading && !error && categories.length > 0 && (
        <div className="mb-8 overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Group</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Category</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">{category.title}</td>
                  <td className="px-4 py-3 text-gray-700">{category.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(category)}
                        className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(category)}
                        className="rounded-md bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
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
    </main>
  );
}
