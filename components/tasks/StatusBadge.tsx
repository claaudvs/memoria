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

const STATUS_DOT_COLOR: Record<Status, string> = {
  ACTIVE: "bg-status-active",
  BLOCK: "bg-status-block",
  FINISHED: "bg-status-finished",
  PUBLISHED_PROD: "bg-status-published",
};

export function StatusBadge({
  taskId,
  status,
  variant = "pill",
}: {
  taskId: string;
  status: Status;
  variant?: "pill" | "plain";
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

  if (variant === "plain") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        title="Click para cambiar de estado"
        className="flex cursor-pointer items-center gap-1.5 disabled:cursor-wait disabled:opacity-60"
      >
        <span className={cn("size-1.5 shrink-0 rounded-full", STATUS_DOT_COLOR[status])} />
        {STATUS_LABEL[status]}
      </button>
    );
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
        "cursor-pointer gap-1.5 border-transparent disabled:cursor-wait disabled:opacity-60",
        STATUS_STYLE[status],
      )}
    >
      <span className="size-1.5 shrink-0 rounded-full bg-current" />
      {STATUS_LABEL[status]}
    </Badge>
  );
}
