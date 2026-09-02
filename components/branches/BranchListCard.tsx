import { Pencil } from "lucide-react";

import { BranchStatusBadge } from "@/components/projects/BranchStatusBadge";
import { BranchChip } from "@/components/tasks/BranchChip";
import type { BranchKind, BranchModalItem } from "@/components/branches/BranchModal";
import { avatarStyle, cn, dotColor, initial } from "@/lib/utils";

export type BranchListItem = BranchModalItem & { projectName: string };

export function BranchListCard({
  item,
  kind,
  onEdit,
}: {
  item: BranchListItem;
  kind: BranchKind;
  onEdit: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-card p-4 shadow-float transition-all duration-200 hover:-translate-y-0.5 hover:shadow-float-hover">
      <div className="flex items-start justify-between gap-2">
        <div
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-2xl text-lg font-bold",
            avatarStyle(item.name),
          )}
        >
          {initial(item.name)}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Editar ${kind === "release" ? "release" : "consolidado"}`}
            className="flex size-8 items-center justify-center rounded-lg bg-card text-muted-foreground shadow-soft hover:text-foreground"
          >
            <Pencil className="size-4" />
          </button>
          <BranchStatusBadge status={item.status} />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="leading-snug font-semibold">{item.name}</h3>
        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <span className={cn("size-1.5 rounded-full", dotColor(item.projectName))} />
          {item.projectName}
        </span>
      </div>

      {item.description && (
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {item.description}
        </p>
      )}

      <div>
        <BranchChip label={item.branchName} branchName={item.branchName} />
      </div>
    </div>
  );
}
