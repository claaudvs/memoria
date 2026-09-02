import { Clock, ListTodo } from "lucide-react";
import Link from "next/link";

import { avatarStyle, cn, formatRelativeTime, initial } from "@/lib/utils";

export type ProjectCardProps = {
  id: string;
  name: string;
  description: string | null;
  updatedAt: Date;
  activeTaskCount: number;
};

export function ProjectCard({
  id,
  name,
  description,
  updatedAt,
  activeTaskCount,
}: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${id}`}
      className="flex flex-col gap-4 rounded-2xl bg-card p-4 shadow-float transition-all duration-200 hover:-translate-y-0.5 hover:shadow-float-hover"
    >
      <div
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-2xl text-lg font-bold",
          avatarStyle(name),
        )}
      >
        {initial(name)}
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="leading-snug font-semibold">{name}</h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {description || "Sin descripción."}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <ListTodo className="size-3" />
          {activeTaskCount === 0
            ? "Sin tareas activas"
            : `${activeTaskCount} tarea${activeTaskCount === 1 ? "" : "s"} activa${activeTaskCount === 1 ? "" : "s"}`}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="size-3" />
          {formatRelativeTime(updatedAt)}
        </span>
      </div>
    </Link>
  );
}
