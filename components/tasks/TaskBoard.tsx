"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { TaskCard, type TaskCardProps } from "@/components/tasks/TaskCard";
import {
  TaskModal,
  type TaskModalConsolidate,
  type TaskModalProject,
  type TaskModalRelease,
  type TaskModalTask,
} from "@/components/tasks/TaskModal";

export type TaskBoardTask = Omit<TaskCardProps, "onEdit"> & {
  projectId: string;
  description: string | null;
  dueDate: Date | null;
};

export function TaskBoard({
  tasks,
  projects,
  releases,
  consolidates,
}: {
  tasks: TaskBoardTask[];
  projects: TaskModalProject[];
  releases: TaskModalRelease[];
  consolidates: TaskModalConsolidate[];
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskModalTask | null>(null);

  function openCreate() {
    setEditingTask(null);
    setModalOpen(true);
  }

  function openEdit(task: TaskBoardTask) {
    setEditingTask({
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
    });
    setModalOpen(true);
  }

  const doneCount = tasks.filter(
    (task) => task.status === "FINISHED" || task.status === "PUBLISHED_PROD",
  ).length;
  const donePercentage =
    tasks.length === 0 ? 0 : Math.round((doneCount / tasks.length) * 100);

  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Tareas</h1>
          {tasks.length > 0 && (
            <span className="font-mono text-xs font-medium text-muted-foreground">
              {doneCount} de {tasks.length} · {donePercentage}%
            </span>
          )}
        </div>
        {tasks.length > 0 && (
          <div className="h-[3px] overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-status-finished transition-all"
              style={{ width: `${donePercentage}%` }}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <button
          type="button"
          onClick={openCreate}
          className="col-span-full flex items-center gap-3 rounded-xl border-2 border-dashed border-border bg-transparent px-5 py-4 text-left text-muted-foreground transition-colors hover:border-foreground/20 hover:bg-card hover:text-foreground"
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Plus className="size-4" />
          </span>
          <span className="text-sm font-semibold">Nueva tarea</span>
        </button>

        {tasks.map((task) => (
          <TaskCard key={task.id} {...task} onEdit={() => openEdit(task)} />
        ))}
      </div>

      {modalOpen && (
        <TaskModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          projects={projects}
          releases={releases}
          consolidates={consolidates}
          task={editingTask}
        />
      )}
    </div>
  );
}
