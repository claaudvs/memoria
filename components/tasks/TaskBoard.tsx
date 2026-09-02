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

  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      <h1 className="text-3xl font-bold tracking-tight">Tareas activas</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <button
          type="button"
          onClick={openCreate}
          className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-transparent text-muted-foreground transition-colors hover:border-foreground/20 hover:bg-card hover:text-foreground"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Plus className="size-5" />
          </span>
          <span className="text-sm font-medium">Nueva tarea</span>
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
