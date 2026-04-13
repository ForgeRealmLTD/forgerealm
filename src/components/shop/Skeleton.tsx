export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden animate-pulse">
      <div className="aspect-square bg-white/[0.04]" />
      <div className="p-4 space-y-3">
        <div className="h-2.5 w-16 rounded bg-white/[0.06]" />
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 rounded bg-white/[0.06]" />
          <div className="h-6 w-12 rounded-lg bg-white/[0.06]" />
        </div>
        <div className="space-y-1.5">
          <div className="h-2.5 w-full rounded bg-white/[0.04]" />
          <div className="h-2.5 w-3/4 rounded bg-white/[0.04]" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-5 grid-cols-2 lg:grid-cols-3">
      {[...Array(count)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ContentSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {[...Array(lines)].map((_, i) => (
        <div
          key={i}
          className="h-4 rounded bg-white/[0.06]"
          style={{ width: `${70 + Math.random() * 30}%` }}
        />
      ))}
    </div>
  );
}
