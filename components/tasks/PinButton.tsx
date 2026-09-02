"use client";

import { Pin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { toggleTaskPinned } from "@/app/actions";
import { cn } from "@/lib/utils";

export function PinButton({
  taskId,
  pinned,
}: {
  taskId: string;
  pinned: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      await toggleTaskPinned(taskId, !pinned);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={pinned ? "Quitar de fijadas" : "Fijar tarea"}
      title={pinned ? "Quitar de fijadas" : "Fijar tarea"}
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-lg bg-card shadow-soft transition-colors disabled:cursor-wait disabled:opacity-60",
        pinned
          ? "bg-status-published-bg text-status-published"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Pin className={cn("size-4", pinned && "fill-current")} />
    </button>
  );
}
