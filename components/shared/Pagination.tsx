import Link from "next/link";

export function Pagination({ page, totalPages, basePath }: { page: number; totalPages: number; basePath: string }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <Link className="rounded-lg border px-4 py-2 aria-disabled:pointer-events-none aria-disabled:opacity-50" href={`${basePath}?page=${Math.max(page - 1, 1)}`} aria-disabled={page <= 1}>
        Previous
      </Link>
      <span className="text-sm text-store-muted">
        Page {page} of {totalPages}
      </span>
      <Link className="rounded-lg border px-4 py-2 aria-disabled:pointer-events-none aria-disabled:opacity-50" href={`${basePath}?page=${Math.min(page + 1, totalPages)}`} aria-disabled={page >= totalPages}>
        Next
      </Link>
    </div>
  );
}
