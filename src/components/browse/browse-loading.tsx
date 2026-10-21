import { Skeleton, GridSkeleton } from "@/components/ui/skeleton";

export function BrowseLoading() {
  return (
    <div>
      <div className="border-b border-line/60 bg-gradient-to-b from-night-900/60 to-transparent">
        <div className="container-page space-y-3 py-12">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-full max-w-xl" />
        </div>
      </div>
      <div className="container-page space-y-6 py-9">
        <Skeleton className="h-28 w-full" />
        <GridSkeleton />
      </div>
    </div>
  );
}
