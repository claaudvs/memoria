import type { Status } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<Status, string> = {
  ACTIVE: "Activa",
  BLOCK: "Block",
  FINISHED: "Finalizada",
  PUBLISHED_PROD: "Publicada prod",
};

const STATUS_STYLE: Record<Status, string> = {
  ACTIVE: "bg-status-active-bg text-status-active",
  BLOCK: "bg-status-block-bg text-status-block",
  FINISHED: "bg-status-finished-bg text-status-finished",
  PUBLISHED_PROD: "bg-status-published-bg text-status-published",
};

export function BranchStatusBadge({ status }: { status: Status }) {
  return (
    <Badge className={cn("gap-1.5 border-transparent", STATUS_STYLE[status])}>
      <span className="size-1.5 shrink-0 rounded-full bg-current" />
      {STATUS_LABEL[status]}
    </Badge>
  );
}
