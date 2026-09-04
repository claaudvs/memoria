import Link from "next/link";

import { cn, dotColor } from "@/lib/utils";

export type ProjectCardProps = {
  id: string;
  name: string;
  description: string | null;
  activeCount: number;
  qaCount: number;
  finishedCount: number;
};

export function ProjectCard({
  id,
  name,
  description,
  activeCount,
  qaCount,
  finishedCount,
}: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${id}`}
      className="flex overflow-hidden rounded-[10px] border border-border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.05),0_6px_16px_-6px_rgba(0,0,0,0.10)] transition-all duration-[180ms] ease-out hover:-translate-y-0.5 hover:border-foreground/15 hover:shadow-[0_2px_4px_rgba(0,0,0,0.06),0_14px_28px_-10px_rgba(0,0,0,0.18)]"
    >
      <div className={cn("w-1 shrink-0", dotColor(name))} />
      <div className="flex min-w-0 flex-1 flex-col gap-3 px-5 py-[18px]">
        <div>
          <span className="font-mono text-[10.5px] font-medium tracking-[0.06em] text-muted-foreground uppercase">
            {name}
          </span>
          <h3 className="mt-1.5 text-base leading-snug font-semibold">{name}</h3>
        </div>
        <p className="line-clamp-2 text-[12.5px] text-muted-foreground">
          {description || "Sin descripción."}
        </p>
        <div className="flex gap-2.5 border-t border-border pt-3">
          <Breakdown value={activeCount} label="Activas" className="text-status-active" />
          <Breakdown value={qaCount} label="En QA" className="text-status-qa" />
          <Breakdown
            value={finishedCount}
            label="Finalizadas"
            className="text-status-finished"
          />
        </div>
      </div>
    </Link>
  );
}

function Breakdown({
  value,
  label,
  className,
}: {
  value: number;
  label: string;
  className: string;
}) {
  return (
    <div className="flex flex-1 flex-col gap-0.5">
      <span className={cn("font-mono text-[17px] font-semibold", className)}>{value}</span>
      <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
    </div>
  );
}
