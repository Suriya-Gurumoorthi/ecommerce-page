export const PRODUCT_CATEGORIES = ["Experts", "Indicators", "Courses", "MT4", "MT5"] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export function categoryToSlug(category: string) {
  return category.toLowerCase().replace(/\s+/g, "-");
}

export function slugToCategory(slug: string) {
  return PRODUCT_CATEGORIES.find((category) => categoryToSlug(category) === slug.toLowerCase());
}
