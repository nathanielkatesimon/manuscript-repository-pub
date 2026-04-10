import Link from "next/link";

// ─── Data ─────────────────────────────────────────────────────────────────────

export interface CategoryGroup {
  title: string;
  items: string[];
}

export const CATEGORIES_LEFT: CategoryGroup[] = [
  {
    title: "Bachelor Degrees",
    items: [
      "BS Computer Science",
      "BS Information Technology",
      "BS Education",
      "BS Business Administration",
      "BS Nursing",
      "BS Electronics and Communications Engineering",
      "BS Civil Engineering",
    ],
  },
  {
    title: "Diploma Programs",
    items: [
      "Diploma in Information and Communications Technology",
      "Diploma in Business Administration",
      "Diploma in Hospitality and Tourism",
    ],
  },
];

export const CATEGORIES_RIGHT: CategoryGroup[] = [
  {
    title: "Senior High School — Academic Track",
    items: [
      "STEM (Science, Technology, Engineering, and Mathematics)",
      "ABM (Accountancy, Business and Management)",
      "HUMSS (Humanities and Social Sciences)",
      "GAS (General Academic Strand)",
    ],
  },
  {
    title: "Senior High School — TVL Track",
    items: [
      "TVL — Information and Communications Technology (ICT)",
      "TVL — Home Economics (HE)",
      "TVL — Industrial Arts (IA)",
      "TVL — Agri-Fishery Arts (AFA)",
    ],
  },
];

// Build a lookup map: program value → parent category title
export const PROGRAM_TO_CATEGORY: Record<string, string> = Object.fromEntries(
  [...CATEGORIES_LEFT, ...CATEGORIES_RIGHT].flatMap(({ title, items }) =>
    items.map((item) => [item, title])
  )
);

// ─── Sub-component ────────────────────────────────────────────────────────────

function CategoryGroupSection({ title, items }: CategoryGroup) {
  return (
    <div>
      <h2 className="text-base font-extrabold text-gray-900 mb-4">{title}</h2>
      <ul>
        {items.map((item) => (
          <li key={item} className="border-b border-gray-200 last:border-b-0">
            <Link
              href={`/student/categories/${encodeURIComponent(item)}`}
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CategoriesPage() {
  return (
    <main className="min-h-screen bg-white px-10 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <p className="mt-1 text-sm text-gray-500">
          Browse manuscripts by program or track.
        </p>
      </div>
      <div className="mx-auto grid grid-cols-1 sm:grid-cols-2 gap-x-16 gap-y-12">
        <div className="flex flex-col gap-12">
          {CATEGORIES_LEFT.map((cat) => (
            <CategoryGroupSection key={cat.title} title={cat.title} items={cat.items} />
          ))}
        </div>
        <div className="flex flex-col gap-12">
          {CATEGORIES_RIGHT.map((cat) => (
            <CategoryGroupSection key={cat.title} title={cat.title} items={cat.items} />
          ))}
        </div>
      </div>
    </main>
  );
}