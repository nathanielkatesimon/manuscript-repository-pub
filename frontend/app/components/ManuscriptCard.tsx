import Image from "next/image";
import Link from "next/link";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

export interface Manuscript {
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
}

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  pending:  { label: "Pending",  className: "bg-yellow-100 text-yellow-800" },
  approve: { label: "Approved", className: "bg-green-100 text-green-800" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-800" },
  revision: { label: "Revision", className: "bg-blue-100 text-blue-800" },
};

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status.toLowerCase()] ?? {
    label: status.charAt(0).toUpperCase() + status.slice(1),
    className: "bg-gray-100 text-gray-700",
  };
  return (
    <span
      className={`absolute top-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-semibold leading-none ${style.className}`}
    >
      {style.label}
    </span>
  );
}

export default function ManuscriptCard({
  manuscript,
  showStatus = false,
  href,
}: {
  manuscript: Manuscript;
  showStatus?: boolean;
  href?: string;
}) {
  const coverSrc = manuscript.cover_img_url
    ? `${API_BASE_URL}${manuscript.cover_img_url}`
    : null;

  const card = (
    <div className="flex flex-col gap-2">
      {/* Cover image — fixed 169×232, centred in card */}
      <div
        className="relative overflow-hidden rounded-lg bg-gray-100 border border-gray-200 mx-auto"
        style={{ width: 169, height: 232 }}
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
          <div className="flex h-full w-full items-center justify-center text-gray-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
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

        {showStatus && <StatusBadge status={manuscript.status} />}
      </div>

      {/* Metadata */}
      <div className="w-full" style={{ maxWidth: 169, margin: "0 auto" }}>
        <p className="truncate text-sm font-semibold text-gray-900 leading-snug">
          {manuscript.title}
        </p>
        {manuscript.authors && (
          <p className="truncate text-xs text-gray-500">{manuscript.authors}</p>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block hover:opacity-90 transition-opacity">
        {card}
      </Link>
    );
  }

  return card;
}
