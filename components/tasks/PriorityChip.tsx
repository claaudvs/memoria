import type { Priority } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const PRIORITY_LABEL: Record<Priority, string> = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
};

const PRIORITY_STYLE: Record<Priority, string> = {
  LOW: "bg-priority-low-bg text-priority-low",
  MEDIUM: "bg-priority-medium-bg text-priority-medium",
  HIGH: "bg-priority-high-bg text-priority-high",
};

export function PriorityChip({ priority }: { priority: Priority }) {
  return (
    <Badge variant="outline" className={cn("border-transparent", PRIORITY_STYLE[priority])}>
      {PRIORITY_LABEL[priority]}
    </Badge>
  );
}
