import type { Priority } from "@prisma/client";

import { cn } from "@/lib/utils";

export const PRIORITY_LABEL: Record<Priority, string> = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
};

const PRIORITY_BAR_COUNT: Record<Priority, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
};

const PRIORITY_BAR_COLOR: Record<Priority, string> = {
  LOW: "bg-priority-low",
  MEDIUM: "bg-priority-medium",
  HIGH: "bg-priority-high",
};

export function PriorityBars({ priority }: { priority: Priority }) {
  const filled = PRIORITY_BAR_COUNT[priority];

  return (
    <span
      className="flex shrink-0 items-end gap-0.5"
      title={`Prioridad ${PRIORITY_LABEL[priority].toLowerCase()}`}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={cn(
            "h-2.5 w-[3px] rounded-sm",
            i < filled ? PRIORITY_BAR_COLOR[priority] : "bg-muted-foreground/15",
          )}
        />
      ))}
    </span>
  );
}
