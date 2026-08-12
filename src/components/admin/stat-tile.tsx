import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatTileProps {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
  isLoading?: boolean;
}

/**
 * A single headline number. A stat tile rather than a one-bar chart: there is
 * no comparison to make, so the number is the visualisation.
 */
export function StatTile({
  label,
  value,
  icon: Icon,
  hint,
  isLoading,
}: StatTileProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-8 w-24 animate-pulse rounded bg-gray-200" />
        ) : (
          <p className="text-2xl font-bold tabular-nums">{value}</p>
        )}
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}
