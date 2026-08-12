export function CategoryBadge({ category }: { category: string }) {
  return <span className="inline-flex rounded-full border border-store-border px-3 py-1 text-xs uppercase tracking-wide text-store-gold">{category}</span>;
}
