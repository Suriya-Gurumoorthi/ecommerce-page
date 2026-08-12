import Link from "next/link";

export function EmptyState({ title, description, href, action }: { title: string; description: string; href?: string; action?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-store-border p-10 text-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-store-muted">{description}</p>
      {href && action ? (
        <Link className="mt-5 inline-flex rounded-full bg-store-gold px-5 py-2 text-sm font-bold text-store-bg" href={href}>
          {action}
        </Link>
      ) : null}
    </div>
  );
}
