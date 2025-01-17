import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

const SkeletonCard = () => (
    <Card className="h-full">
      <CardContent className="p-2 sm:px-6">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex justify-end mt-2">
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );

  export { SkeletonCard }