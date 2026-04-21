"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import useUserStore from "@/store/userStore";
import { apiFetch } from "@/lib/apiFetch";
import { buildCategoryGroups, type CategoryGroup, type Category } from "@/lib/categories";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

function CategoryGroupSection({ title, items }: CategoryGroup) {
  return (
    <div>
      <h2 className="text-base font-extrabold text-gray-900 mb-4">{title}</h2>
      <ul>
        {items.map((item) => (
          <li key={item} className="border-b border-gray-200 last:border-b-0">
            <Link
              href={`/admin/categories/${encodeURIComponent(item)}`}
              className="block py-3 text-sm text-gray-700 hover:text-black hover:underline underline-offset-2 transition-colors"
            >
              {item}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function CategoriesPage() {
  const { token } = useUserStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`${API_BASE_URL}/api/v1/categories`, {
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

  const categoryGroups = useMemo(() => buildCategoryGroups(categories), [categories]);
  const midpoint = Math.ceil(categoryGroups.length / 2);
  const left = categoryGroups.slice(0, midpoint);
  const right = categoryGroups.slice(midpoint);

  return (
    <main className="min-h-screen bg-white px-10 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <p className="mt-1 text-sm text-gray-500">
          Browse manuscripts by program or track.
        </p>
      </div>

      {loading && <p className="text-sm text-gray-400">Loading…</p>}
      {!loading && error && <p className="text-sm text-red-500">{error}</p>}
      {!loading && !error && categoryGroups.length === 0 && (
        <p className="text-sm text-gray-400">No categories found.</p>
      )}

      {!loading && !error && categoryGroups.length > 0 && (
        <div className="mx-auto grid grid-cols-1 sm:grid-cols-2 gap-x-16 gap-y-12">
          <div className="flex flex-col gap-12">
            {left.map((group) => (
              <CategoryGroupSection key={group.title} title={group.title} items={group.items} />
            ))}
          </div>
          <div className="flex flex-col gap-12">
            {right.map((group) => (
              <CategoryGroupSection key={group.title} title={group.title} items={group.items} />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
