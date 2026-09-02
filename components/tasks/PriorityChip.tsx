import type { Priority } from "@prisma/client";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";

const PRIORITY_LABEL: Record<Priority, string> = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
};

const PRIORITY_ICON_COLOR: Record<Priority, string> = {
  LOW: "text-priority-low",
  MEDIUM: "text-priority-medium",
  HIGH: "text-priority-high",
};

export function PriorityChip({ priority }: { priority: Priority }) {
  return (
    <span className="inline-flex h-5 shrink-0 items-center gap-1 rounded-full bg-muted px-2.5 text-xs font-medium text-muted-foreground">
      <ArrowUpRight className={cn("size-3", PRIORITY_ICON_COLOR[priority])} />
      {PRIORITY_LABEL[priority]}
    </span>
  );
}
