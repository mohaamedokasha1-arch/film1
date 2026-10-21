import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-xl", className)} />;
}

export function PosterSkeleton() {
  return (
    <div className="w-[150px] shrink-0 sm:w-[170px] lg:w-[185px]">
      <Skeleton className="aspect-[2/3] w-full" />
      <Skeleton className="mt-3 h-4 w-4/5" />
      <Skeleton className="mt-2 h-3 w-2/5" />
    </div>
  );
}

export function RowSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-48" />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: count }).map((_, index) => (
          <PosterSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>
          <Skeleton className="aspect-[2/3] w-full" />
          <Skeleton className="mt-3 h-4 w-4/5" />
          <Skeleton className="mt-2 h-3 w-2/5" />
        </div>
      ))}
    </div>
  );
}
