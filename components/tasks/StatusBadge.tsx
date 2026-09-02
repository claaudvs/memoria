"use client";

import type { Status } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { updateTaskStatus } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_ORDER: Status[] = ["ACTIVE", "BLOCK", "FINISHED", "PUBLISHED_PROD"];

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

export function StatusBadge({
  taskId,
  status,
}: {
  taskId: string;
  status: Status;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const next =
      STATUS_ORDER[(STATUS_ORDER.indexOf(status) + 1) % STATUS_ORDER.length];
    startTransition(async () => {
      await updateTaskStatus(taskId, next);
      router.refresh();
    });
  }

  return (
    <Badge
      render={
        <button
          type="button"
          onClick={handleClick}
          disabled={isPending}
          title="Click para cambiar de estado"
        />
      }
      className={cn(
        "cursor-pointer border-transparent disabled:cursor-wait disabled:opacity-60",
        STATUS_STYLE[status],
      )}
    >
      {STATUS_LABEL[status]}
    </Badge>
  );
}
