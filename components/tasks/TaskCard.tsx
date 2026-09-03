"use client";

import type { Priority, Status } from "@prisma/client";
import { Check, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";

import { BranchChip } from "@/components/tasks/BranchChip";
import { PinButton } from "@/components/tasks/PinButton";
import { PinnedPill } from "@/components/tasks/PinnedPill";
import { PRIORITY_LABEL, PriorityBars } from "@/components/tasks/PriorityBars";
import { StatusBadge } from "@/components/tasks/StatusBadge";
import { cn, dotColor, isTaskDone } from "@/lib/utils";

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
  const router = useRouter();
  const done = isTaskDone(status);

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => router.push(`/tasks/${number}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter") router.push(`/tasks/${number}`);
      }}
      className={cn(
        "flex cursor-pointer overflow-hidden border border-border bg-card shadow-float transition-all duration-200 hover:-translate-y-0.5 hover:shadow-float-hover",
        done && "bg-status-finished-tint",
      )}
    >
      <div className={cn("w-1 shrink-0", dotColor(projectName), done && "opacity-35")} />

      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <div className="flex items-center gap-2.5">
          <span className="flex-1 truncate font-mono text-[10.5px] font-medium tracking-wide text-muted-foreground uppercase">
            {projectName}
          </span>
          <span className="font-mono text-xs font-medium text-muted-foreground">
            #{number}
          </span>
          {pinned && <PinnedPill />}
          {done ? (
            <Check className="size-3.5 shrink-0 text-status-finished" />
          ) : (
            <PriorityBars priority={priority} />
          )}
        </div>

        <h3
          className={cn(
            "text-[15px] leading-snug font-semibold text-wrap",
            done && "text-muted-foreground line-through decoration-muted-foreground/40",
          )}
        >
          {title}
        </h3>

        {(release || consolidate) && (
          <div
            className="flex flex-wrap items-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
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

        <div className="flex items-center justify-between gap-2">
          <div
            className="flex items-center gap-1.5 text-[11.5px] font-medium text-muted-foreground"
            onClick={(e) => e.stopPropagation()}
          >
            <StatusBadge taskId={id} status={status} variant="plain" />
            <span>· {PRIORITY_LABEL[priority]}</span>
          </div>
          <div
            className="flex shrink-0 items-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <PinButton taskId={id} pinned={pinned} />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              aria-label="Editar tarea"
              className="flex size-8 items-center justify-center rounded-lg bg-card text-muted-foreground shadow-soft hover:text-foreground"
            >
              <Pencil className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
