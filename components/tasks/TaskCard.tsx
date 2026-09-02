import type { Priority, Status } from "@prisma/client";
import { Pencil } from "lucide-react";

import { BranchChip } from "@/components/tasks/BranchChip";
import { PriorityChip } from "@/components/tasks/PriorityChip";
import { StatusBadge } from "@/components/tasks/StatusBadge";

export type TaskCardProps = {
  id: string;
  number: number;
  title: string;
  projectName: string;
  status: Status;
  priority: Priority;
  release: { name: string; branchName: string } | null;
  consolidate: { name: string; branchName: string } | null;
  onEdit: () => void;
};

export function TaskCard({
  id,
  number,
  title,
  projectName,
  status,
  priority,
  release,
  consolidate,
  onEdit,
}: TaskCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-card p-4 shadow-soft">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">
            #{number} · {projectName}
          </span>
          <h3 className="text-base leading-snug font-semibold">{title}</h3>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onEdit}
            aria-label="Editar tarea"
            className="flex size-8 items-center justify-center rounded-lg bg-card text-muted-foreground shadow-soft hover:text-foreground"
          >
            <Pencil className="size-4" />
          </button>
          <StatusBadge taskId={id} status={status} />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <PriorityChip priority={priority} />
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
    </div>
  );
}
