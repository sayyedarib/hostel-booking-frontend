import { Card } from "@/components/ui/card";

/** Placeholder grid shown while room data loads, matching the real card size. */
export function RoomGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <ul
      aria-hidden="true"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: count }, (_, index) => (
        <li key={index}>
          <Card className="h-full overflow-hidden rounded-xl">
            <div className="aspect-[4/3] w-full animate-pulse bg-gray-200" />
            <div className="space-y-3 p-4">
              <div className="h-5 w-2/3 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
              <div className="h-9 w-full animate-pulse rounded bg-gray-200" />
            </div>
          </Card>
        </li>
      ))}
    </ul>
  );
}
