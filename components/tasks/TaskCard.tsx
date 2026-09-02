import type { Priority, Status } from "@prisma/client";
import { Pencil } from "lucide-react";

import { BranchChip } from "@/components/tasks/BranchChip";
import { PinButton } from "@/components/tasks/PinButton";
import { PriorityChip } from "@/components/tasks/PriorityChip";
import { StatusBadge } from "@/components/tasks/StatusBadge";
import { cn, dotColor } from "@/lib/utils";

export type TaskCardProps = {
  id: string;
  number: number;
  title: string;
  projectName: string;
  status: Status;
  priority: Priority;
  pinned: boolean;
  release: { id: string; name: string; branchName: string } | null;
  consolidate: { id: string; name: string; branchName: string } | null;
  onEdit: () => void;
};

export function TaskCard({
  id,
  number,
  title,
  projectName,
  status,
  priority,
  pinned,
  release,
  consolidate,
  onEdit,
}: TaskCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl bg-card p-4 shadow-float transition-all duration-200 hover:-translate-y-0.5 hover:shadow-float-hover",
        status === "FINISHED" && "bg-status-finished-tint",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
          #{number}
        </span>
        <PinButton taskId={id} pinned={pinned} />
      </div>

      <h3 className="text-[15px] leading-snug font-semibold">{title}</h3>

      <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <span className={`size-1.5 rounded-full ${dotColor(projectName)}`} />
        {projectName}
      </span>

      <div className="flex flex-wrap items-center gap-1.5">
        <StatusBadge taskId={id} status={status} />
        <PriorityChip priority={priority} />
      </div>

      {(release || consolidate) && (
        <div className="flex flex-wrap items-center gap-1.5">
          {release && (
            <BranchChip label={release.name} branchName={release.branchName} />
          )}
          {consolidate && (
            <BranchChip
              label={consolidate.name}
              branchName={consolidate.branchName}
            />
          )}
        </div>
      )}

      <div className="flex items-center justify-end border-t border-border pt-3">
        <button
          type="button"
          onClick={onEdit}
          aria-label="Editar tarea"
          className="flex size-8 items-center justify-center rounded-lg bg-card text-muted-foreground shadow-soft hover:text-foreground"
        >
          <Pencil className="size-4" />
        </button>
      </div>
    </div>
  );
}
