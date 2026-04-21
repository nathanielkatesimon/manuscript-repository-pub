export interface Category {
  id: number;
  title: string;
  name: string;
}

export interface CategoryGroup {
  title: string;
  items: string[];
}

export function buildCategoryGroups(categories: Category[]): CategoryGroup[] {
  const grouped = new Map<string, string[]>();

  categories.forEach((category) => {
    const items = grouped.get(category.title) ?? [];
    items.push(category.name);
    grouped.set(category.title, items);
  });

  return Array.from(grouped.entries()).map(([title, items]) => ({ title, items }));
}

export function buildProgramToCategoryMap(categories: Category[]): Record<string, string> {
  return Object.fromEntries(categories.map((category) => [category.name, category.title]));
}
