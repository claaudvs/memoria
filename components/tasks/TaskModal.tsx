"use client";

import { useActionState, useEffect } from "react";

import { createTask, updateTask, type TaskFormState } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  PRIORITY_VALUES,
  STATUS_VALUES,
  type TaskFormValues,
} from "@/lib/validations/task";

const STATUS_LABEL: Record<(typeof STATUS_VALUES)[number], string> = {
  ACTIVE: "Activa",
  BLOCK: "Block",
  FINISHED: "Finalizada",
  PUBLISHED_PROD: "Publicada prod",
};

const PRIORITY_LABEL: Record<(typeof PRIORITY_VALUES)[number], string> = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
};

const selectClassName =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export type TaskModalProject = { id: string; name: string };

export type TaskModalTask = {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: TaskFormValues["status"];
  priority: TaskFormValues["priority"];
  dueDate: Date | null;
  pinned: boolean;
};

const INITIAL_STATE: TaskFormState = { success: false };

function toDateInputValue(date: Date) {
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function TaskModal({
  open,
  onOpenChange,
  projects,
  task,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: TaskModalProject[];
  task: TaskModalTask | null;
}) {
  const action = task ? updateTask.bind(null, task.id) : createTask;
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);

  useEffect(() => {
    if (state.success) {
      onOpenChange(false);
    }
  }, [state.success, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{task ? "Editar tarea" : "Nueva tarea"}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              name="title"
              defaultValue={task?.title}
              required
            />
            {state.fieldErrors?.title && (
              <p className="text-xs text-destructive">
                {state.fieldErrors.title[0]}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="projectId">Proyecto</Label>
            <select
              id="projectId"
              name="projectId"
              defaultValue={task?.projectId ?? projects[0]?.id}
              className={selectClassName}
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            {state.fieldErrors?.projectId && (
              <p className="text-xs text-destructive">
                {state.fieldErrors.projectId[0]}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={task?.description ?? ""}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="status">Estado</Label>
              <select
                id="status"
                name="status"
                defaultValue={task?.status ?? "ACTIVE"}
                className={selectClassName}
              >
                {STATUS_VALUES.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABEL[status]}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="priority">Prioridad</Label>
              <select
                id="priority"
                name="priority"
                defaultValue={task?.priority ?? "MEDIUM"}
                className={selectClassName}
              >
                {PRIORITY_VALUES.map((priority) => (
                  <option key={priority} value={priority}>
                    {PRIORITY_LABEL[priority]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dueDate">Vencimiento</Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                defaultValue={
                  task?.dueDate ? toDateInputValue(task.dueDate) : ""
                }
              />
            </div>
            <label
              htmlFor="pinned"
              className="flex h-8 items-center gap-2 self-end text-sm font-medium"
            >
              <input
                id="pinned"
                name="pinned"
                type="checkbox"
                defaultChecked={task?.pinned}
                className="size-4 rounded border-input accent-primary"
              />
              Fijada
            </label>
          </div>

          {state.formError && (
            <p className="text-sm text-destructive">{state.formError}</p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando…" : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
