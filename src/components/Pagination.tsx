import Link from "next/link";

export function Pagination({
  page,
  limit,
  total,
  basePath,
  searchParams,
}: {
  page: number;
  limit: number;
  total: number;
  basePath: string;
  searchParams: Record<string, string | undefined>;
}) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (totalPages <= 1) return null;

  const hrefFor = (targetPage: number) => {
    const params = new URLSearchParams(Object.entries(searchParams).filter(([, v]) => v) as [string, string][]);
    params.set("page", String(targetPage));
    return `${basePath}?${params.toString()}`;
  };

  return (
    <div className="flex items-center justify-between font-body text-sm text-muted">
      <span>
        Page {page} of {totalPages} · {total} total
      </span>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link href={hrefFor(page - 1)} className="rounded-lg border border-border px-3 py-1.5 hover:bg-surface-muted">
            Previous
          </Link>
        ) : null}
        {page < totalPages ? (
          <Link href={hrefFor(page + 1)} className="rounded-lg border border-border px-3 py-1.5 hover:bg-surface-muted">
            Next
          </Link>
        ) : null}
      </div>
    </div>
  );
}
