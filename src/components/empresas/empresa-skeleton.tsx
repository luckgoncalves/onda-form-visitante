import { Skeleton } from '@/components/ui/skeleton';

export default function EmpresaSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row gap-4 p-5 sm:p-6">
        <Skeleton className="h-16 w-16 rounded-full shrink-0" />

        <div className="flex-1 space-y-3 min-w-0">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-5 w-56 rounded-full" />
          <div className="space-y-2 pt-1">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-3/4" />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 mx-5 sm:mx-6" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 p-5 sm:p-6">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-3.5 w-32" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-3.5 w-28" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-3.5 w-44" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-3.5 w-40" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-9 w-9 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function EmpresasGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <EmpresaSkeleton key={index} />
      ))}
    </div>
  );
}
