"use client";

import type { Priority, Status } from "@prisma/client";
import { Check, Pencil } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { updateTaskStatus } from "@/app/actions";
import { BranchChip } from "@/components/tasks/BranchChip";
import { CommentSection, type NoteData } from "@/components/tasks/CommentSection";
import { PinnedPill } from "@/components/tasks/PinnedPill";
import { PRIORITY_LABEL, PriorityBars } from "@/components/tasks/PriorityBars";
import { StatusBadge } from "@/components/tasks/StatusBadge";
import {
  TaskModal,
  type TaskModalConsolidate,
  type TaskModalProject,
  type TaskModalRelease,
  type TaskModalTask,
} from "@/components/tasks/TaskModal";
import { TodoGroups, type TodoGroupData } from "@/components/tasks/TodoGroups";
import { Button } from "@/components/ui/button";
import { cn, dotColor, formatRelativeTime, isTaskDone } from "@/lib/utils";

export type TaskDetailTask = {
  id: string;
  number: number;
  title: string;
  description: string | null;
  status: Status;
  priority: Priority;
  dueDate: Date | null;
  pinned: boolean;
  createdAt: Date;
  projectId: string;
  projectName: string;
  release: { id: string; name: string; branchName: string } | null;
  consolidate: { id: string; name: string; branchName: string } | null;
};

const DATE_FORMATTER = new Intl.DateTimeFormat("es", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function TaskDetailView({
  task,
  todos,
  notes,
  allProjects,
  allReleases,
  allConsolidates,
}: {
  task: TaskDetailTask;
  todos: TodoGroupData[];
  notes: NoteData[];
  allProjects: TaskModalProject[];
  allReleases: TaskModalRelease[];
  allConsolidates: TaskModalConsolidate[];
}) {
  const router = useRouter();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const done = isTaskDone(task.status);
  const rail = dotColor(task.projectName);

  const editingTask: TaskModalTask = {
    id: task.id,
    projectId: task.projectId,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate,
    pinned: task.pinned,
    currentReleaseId: task.release?.id ?? null,
    currentConsolidateId: task.consolidate?.id ?? null,
  };

  const totalItems = todos.reduce((sum, todo) => sum + todo.items.length, 0);
  const doneItems = todos.reduce(
    (sum, todo) => sum + todo.items.filter((item) => item.completed).length,
    0,
  );

  const activity = [
    ...notes.map((note) => ({
      key: note.id,
      label: "Comentario agregado",
      at: note.createdAt,
    })),
    { key: "created", label: "Creada", at: task.createdAt },
  ].sort((a, b) => b.at.getTime() - a.at.getTime());

  function handleToggleDone() {
    startTransition(async () => {
      await updateTaskStatus(task.id, done ? "ACTIVE" : "FINISHED");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      <div className="sticky top-4 z-10 flex flex-wrap items-center justify-between gap-3 bg-card/90 px-5 py-3 shadow-soft backdrop-blur">
        <div className="flex min-w-0 items-center gap-2 text-sm font-medium text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Tareas
          </Link>
          <span className="text-muted-foreground/40">/</span>
          <Link
            href={`/projects/${task.projectId}`}
            className="flex items-center gap-1.5 font-mono text-[11px] font-medium tracking-wide uppercase hover:text-foreground"
          >
            <span className={cn("size-1.5 rounded-full", rail)} />
            {task.projectName}
          </Link>
          <span className="text-muted-foreground/40">/</span>
          <span className="font-mono text-xs font-medium text-foreground/70">
            #{task.number}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {task.pinned && <PinnedPill />}
          <Button variant="outline" size="sm" onClick={() => setEditModalOpen(true)}>
            <Pencil className="size-3.5" />
            Editar
          </Button>
          <Button size="sm" onClick={handleToggleDone} disabled={isPending}>
            {done ? "Reabrir tarea" : "Marcar finalizada"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex min-w-0 flex-col gap-6">
          <div className="flex overflow-hidden border border-border bg-card shadow-soft">
            <div className={cn("w-1 shrink-0", rail, done && "opacity-35")} />
            <div className="flex flex-1 flex-col gap-4 p-6">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-medium text-muted-foreground">
                  #{task.number}
                </span>
                <StatusBadge taskId={task.id} status={task.status} />
                {done ? (
                  <Check className="size-3.5 shrink-0 text-status-finished" />
                ) : (
                  <PriorityBars priority={task.priority} />
                )}
                <span className="text-[11.5px] font-medium text-muted-foreground">
                  {PRIORITY_LABEL[task.priority]}
                </span>
              </div>

              <h2
                className={cn(
                  "text-2xl leading-snug font-bold tracking-tight text-wrap",
                  done && "text-muted-foreground line-through decoration-muted-foreground/40",
                )}
              >
                {task.title}
              </h2>

              <div className="flex flex-col gap-2 border-t border-border pt-4">
                <span className="font-mono text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                  Descripción
                </span>
                {task.description ? (
                  <p className="text-sm whitespace-pre-wrap text-foreground/80">
                    {task.description}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Sin descripción.{" "}
                    <button
                      type="button"
                      onClick={() => setEditModalOpen(true)}
                      className="text-foreground/70 underline decoration-muted-foreground/40 underline-offset-3 hover:text-foreground"
                    >
                      Agregar una
                    </button>
                  </p>
                )}
              </div>
            </div>
          </div>

          <section className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                Checklists
              </span>
              {totalItems > 0 && (
                <span className="font-mono text-xs text-muted-foreground">
                  {doneItems}/{totalItems} completado
                </span>
              )}
            </div>
            <TodoGroups taskId={task.id} taskNumber={task.number} todos={todos} />
          </section>

          <section className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                Comentarios
              </span>
              {notes.length > 0 && (
                <span className="font-mono text-xs text-muted-foreground">
                  {notes.length}
                </span>
              )}
            </div>
            <CommentSection taskId={task.id} taskNumber={task.number} notes={notes} />
          </section>
        </div>

        <aside className="flex h-fit flex-col gap-4 lg:sticky lg:top-24">
          <div className="flex overflow-hidden border border-border bg-card shadow-soft">
            <div className={cn("w-1 shrink-0", rail)} />
            <div className="flex min-w-0 flex-1 flex-col gap-3.5 p-5">
              <span className="font-mono text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                Propiedades
              </span>

              <MetaRow label="Proyecto">
                <Link
                  href={`/projects/${task.projectId}`}
                  className="flex min-w-0 items-center gap-1.5 text-sm font-semibold hover:underline"
                >
                  <span className={cn("size-1.5 shrink-0 rounded-full", rail)} />
                  <span className="truncate">{task.projectName}</span>
                </Link>
              </MetaRow>

              <MetaRow label="Estado">
                <StatusBadge taskId={task.id} status={task.status} />
              </MetaRow>

              <MetaRow label="Prioridad">
                <span className="flex items-center gap-1.5">
                  <PriorityBars priority={task.priority} />
                  <span className="text-sm font-medium">
                    {PRIORITY_LABEL[task.priority]}
                  </span>
                </span>
              </MetaRow>

              <MetaRow label="Vencimiento">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(true)}
                  className="border-b border-dashed border-muted-foreground/30 text-sm font-medium text-foreground/80 hover:text-foreground"
                >
                  {task.dueDate ? DATE_FORMATTER.format(task.dueDate) : "Sin fecha"}
                </button>
              </MetaRow>

              <div className="flex min-w-0 flex-col gap-1.5 border-t border-border pt-3.5">
                <span className="font-mono text-[11px] text-muted-foreground">
                  Release
                </span>
                {task.release ? (
                  <BranchChip
                    label={task.release.name}
                    branchName={task.release.branchName}
                  />
                ) : (
                  <span className="text-sm text-muted-foreground">Ninguno</span>
                )}
              </div>

              <MetaRow label="Consolidado">
                {task.consolidate ? (
                  <BranchChip
                    label={task.consolidate.name}
                    branchName={task.consolidate.branchName}
                  />
                ) : (
                  <span className="text-sm text-muted-foreground">Ninguno</span>
                )}
              </MetaRow>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 px-1">
            <span className="font-mono text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
              Actividad
            </span>
            {activity.map((entry) => (
              <div key={entry.key} className="flex items-baseline gap-2.5">
                <span className="mt-1 size-1 shrink-0 rounded-full bg-muted-foreground/40" />
                <span className="text-[11.5px] text-muted-foreground">
                  {entry.label} · {formatRelativeTime(entry.at)}
                </span>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {editModalOpen && (
        <TaskModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          projects={allProjects}
          releases={allReleases}
          consolidates={allConsolidates}
          task={editingTask}
        />
      )}
    </div>
  );
}

function MetaRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
        {label}
      </span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
