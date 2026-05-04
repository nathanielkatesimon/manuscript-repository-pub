"use client";

import { useEffect, useState } from "react";
import useUserStore from "@/store/userStore";
import { apiFetch } from "@/lib/apiFetch";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StorageSummary {
  total_size_bytes: number;
  total_size_mb: number;
  total_size_gb: number;
  total_files: number;
  average_size_bytes: number;
  average_size_mb: number;
}

interface FileTypeBreakdown {
  count: number;
  size_bytes: number;
  size_mb: number;
}

interface StorageBreakdown {
  pdfs: FileTypeBreakdown;
  images: FileTypeBreakdown;
  others: FileTypeBreakdown;
}

interface LargestFile {
  filename: string;
  size_bytes: number;
  size_mb: number;
  content_type: string;
  created_at: string;
}

interface SystemInfo {
  service_name: string;
  manuscripts_count: number;
  storage_per_manuscript_mb: number;
}

interface StorageData {
  storage: StorageSummary;
  breakdown: StorageBreakdown;
  largest_file: LargestFile | null;
  system: SystemInfo;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatSize(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`;
  if (mb >= 1) return `${mb.toFixed(2)} MB`;
  return `${(mb * 1024).toFixed(1)} KB`;
}

function formatBytes(bytes: number): string {
  return bytes.toLocaleString() + " bytes";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400 mb-3">
      {children}
    </p>
  );
}

function Divider() {
  return <hr className="border-t border-gray-300 my-8" />;
}

function StatCard({
  value,
  label,
  description,
  accentColor,
  icon,
}: {
  value: string;
  label: string;
  description: string;
  accentColor: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className="bg-gray-50 rounded-lg pl-4 pr-5 py-4 flex flex-col gap-1.5 border-l-[3px]"
      style={{ borderColor: accentColor }}
    >
      <div className="flex items-center justify-between">
        <span className="text-2xl font-medium leading-none" style={{ color: accentColor }}>
          {value}
        </span>
        <span className="text-gray-300">{icon}</span>
      </div>
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <span className="text-xs text-gray-400">{description}</span>
    </div>
  );
}

function BreakdownBar({
  label,
  count,
  sizeMb,
  totalMb,
  color,
}: {
  label: string;
  count: number;
  sizeMb: number;
  totalMb: number;
  color: string;
}) {
  const pct = totalMb === 0 ? 0 : Math.round((sizeMb / totalMb) * 100);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
            style={{ background: color }}
          />
          <span className="font-medium text-gray-700">{label}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>{count} file{count !== 1 ? "s" : ""}</span>
          <span className="font-medium text-gray-700">{formatSize(sizeMb)}</span>
          <span className="w-8 text-right">{pct}%</span>
        </div>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-800">{value}</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminStoragePage() {
  const { token } = useUserStore();
  const [data, setData] = useState<StorageData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    apiFetch(`${API_BASE_URL}/api/v1/admins/storage`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const json = await res.json();
        if (res.ok) {
          setData(json.data);
        } else {
          setError("Failed to load storage report.");
        }
      })
      .catch(() => setError("Could not connect to the server."))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="px-8 py-8">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-semibold text-gray-900">Storage Usage</h1>
        <p className="mt-1 text-sm text-gray-400">
          Monitor total disk usage across all uploaded files and manuscripts.
        </p>
      </div>

      {loading && <p className="mt-8 text-sm text-gray-400">Loading…</p>}
      {!loading && error && <p className="mt-8 text-sm text-red-500">{error}</p>}

      {!loading && data && (
        <>
          <Divider />

          {/* Primary stat */}
          <SectionLabel>Total storage consumed</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatCard
              value={formatSize(data.storage.total_size_mb)}
              label="Total Storage Used"
              description="Across all uploaded files"
              accentColor="#378ADD"
              icon={
                <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="3" width="12" height="10" rx="1.5" />
                  <path d="M5 6h6M5 9h4" strokeLinecap="round" />
                </svg>
              }
            />
            <StatCard
              value={String(data.storage.total_files)}
              label="Total Files"
              description="All blobs stored in Active Storage"
              accentColor="#7F77DD"
              icon={
                <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 2h5.5L12 4.5V14H4V2z" />
                  <path d="M9.5 2v3H12" />
                </svg>
              }
            />
            <StatCard
              value={formatSize(data.storage.average_size_mb)}
              label="Average File Size"
              description="Mean size per stored blob"
              accentColor="#1D9E75"
              icon={
                <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M2 8h12M8 2v12" strokeLinecap="round" />
                </svg>
              }
            />
          </div>

          <Divider />

          {/* Breakdown */}
          <div className="flex items-end justify-between mb-3">
            <div>
              <SectionLabel>Storage by file type</SectionLabel>
              <p className="text-xs text-gray-400 -mt-2">
                Breakdown of storage usage by file category.
              </p>
            </div>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 rounded-full px-3 py-1">
              {data.storage.total_files} file{data.storage.total_files !== 1 ? "s" : ""} total
            </span>
          </div>

          <div className="bg-gray-50 rounded-lg px-5 py-5 border border-gray-200 flex flex-col gap-4">
            <BreakdownBar
              label="PDF Documents"
              count={data.breakdown.pdfs.count}
              sizeMb={data.breakdown.pdfs.size_mb}
              totalMb={data.storage.total_size_mb}
              color="#E24B4A"
            />
            <BreakdownBar
              label="Cover Images"
              count={data.breakdown.images.count}
              sizeMb={data.breakdown.images.size_mb}
              totalMb={data.storage.total_size_mb}
              color="#378ADD"
            />
            <BreakdownBar
              label="Other Files"
              count={data.breakdown.others.count}
              sizeMb={data.breakdown.others.size_mb}
              totalMb={data.storage.total_size_mb}
              color="#9CA3AF"
            />
          </div>

          <Divider />

          {/* Largest file */}
          {data.largest_file ? (
            <>
              <SectionLabel>Largest file</SectionLabel>
              <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden px-2">
                <InfoRow label="Filename" value={data.largest_file.filename} />
                <InfoRow label="File size" value={`${formatSize(data.largest_file.size_mb)} (${formatBytes(data.largest_file.size_bytes)})`} />
                <InfoRow label="Content type" value={data.largest_file.content_type} />
                <InfoRow label="Uploaded on" value={new Date(data.largest_file.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} />
              </div>
              <Divider />
            </>
          ) : null}

          {/* System information */}
          <SectionLabel>System information</SectionLabel>
          <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden px-2">
            <InfoRow label="Storage service" value={data.system.service_name} />
            <InfoRow label="Total manuscripts" value={String(data.system.manuscripts_count)} />
            <InfoRow
              label="Avg. storage per manuscript"
              value={formatSize(data.system.storage_per_manuscript_mb)}
            />
            <InfoRow
              label="Total storage (bytes)"
              value={formatBytes(data.storage.total_size_bytes)}
            />
          </div>

          <Divider />

          {/* Info tip */}
          <div className="rounded-r-lg border-l-[3px] border-blue-400 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            Storage figures are calculated from Active Storage blobs and update automatically when
            files are uploaded or deleted. PDF documents and generated cover images are both counted
            in the total.
          </div>
        </>
      )}
    </div>
  );
}
