"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { TaskCard, type TaskCardProps } from "@/components/tasks/TaskCard";
import {
  TaskModal,
  type TaskModalProject,
  type TaskModalTask,
} from "@/components/tasks/TaskModal";

export type TaskBoardTask = Omit<TaskCardProps, "onEdit"> & {
  projectId: string;
  description: string | null;
  dueDate: Date | null;
  pinned: boolean;
};

export function TaskBoard({
  tasks,
  projects,
}: {
  tasks: TaskBoardTask[];
  projects: TaskModalProject[];
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
    });
    setModalOpen(true);
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Tareas activas</h1>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Nueva tarea
        </Button>
      </div>

      {tasks.length === 0 ? (
        <div className="rounded-2xl bg-card p-6 shadow-soft">
          <p className="text-muted-foreground">No hay tareas activas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} {...task} onEdit={() => openEdit(task)} />
          ))}
        </div>
      )}

      {modalOpen && (
        <TaskModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          projects={projects}
          task={editingTask}
        />
      )}
    </div>
  );
}
