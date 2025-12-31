import { Skeleton } from "@/components/ui/skeleton";

export default function ProductionsLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <Skeleton className="h-6 w-48" />

      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-8 w-48" />
        </div>

        <div className="border border-[#F2F1ED] rounded-lg overflow-hidden bg-white shadow-sm">
          <div className="space-y-3 p-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-7 w-32" />
                <Skeleton className="h-8 w-8" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
