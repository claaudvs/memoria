"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState, useTransition } from "react";

import {
  createTask,
  deleteTask,
  updateTask,
  type TaskFormState,
} from "@/app/actions";
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
  NEW_BRANCH_VALUE,
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

export type TaskModalRelease = {
  id: string;
  projectId: string;
  name: string;
  branchName: string;
};

export type TaskModalConsolidate = {
  id: string;
  projectId: string;
  name: string;
  branchName: string;
};

export type TaskModalTask = {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: TaskFormValues["status"];
  priority: TaskFormValues["priority"];
  dueDate: Date | null;
  pinned: boolean;
  currentReleaseId: string | null;
  currentConsolidateId: string | null;
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
  releases,
  consolidates,
  task,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: TaskModalProject[];
  releases: TaskModalRelease[];
  consolidates: TaskModalConsolidate[];
  task: TaskModalTask | null;
}) {
  const action = task
    ? updateTask.bind(null, task.id, task.currentReleaseId, task.currentConsolidateId)
    : createTask;
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);

  const [projectId, setProjectId] = useState(
    task?.projectId ?? projects[0]?.id ?? "",
  );
  const [releaseChoice, setReleaseChoice] = useState(
    task?.currentReleaseId ?? "",
  );
  const [consolidateChoice, setConsolidateChoice] = useState(
    task?.currentConsolidateId ?? "",
  );

  const router = useRouter();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    if (state.success) {
      onOpenChange(false);
    }
  }, [state.success, onOpenChange]);

  function handleProjectChange(nextProjectId: string) {
    setProjectId(nextProjectId);
    setReleaseChoice("");
    setConsolidateChoice("");
  }

  function handleDelete() {
    if (!task) return;
    startDeleteTransition(async () => {
      await deleteTask(task.id);
      router.refresh();
      onOpenChange(false);
    });
  }

  const projectReleases = releases.filter((r) => r.projectId === projectId);
  const projectConsolidates = consolidates.filter(
    (c) => c.projectId === projectId,
  );

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
              value={projectId}
              onChange={(e) => handleProjectChange(e.target.value)}
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

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="releaseId">Release</Label>
            <select
              id="releaseId"
              name="releaseId"
              value={releaseChoice}
              onChange={(e) => setReleaseChoice(e.target.value)}
              className={selectClassName}
            >
              <option value="">Ninguno</option>
              {projectReleases.map((release) => (
                <option key={release.id} value={release.id}>
                  {release.name}
                </option>
              ))}
              <option value={NEW_BRANCH_VALUE}>+ Crear nuevo release…</option>
            </select>
            {releaseChoice === NEW_BRANCH_VALUE && (
              <div className="flex flex-col gap-2 rounded-lg border border-dashed border-border p-2.5">
                <Input name="releaseName" placeholder="Nombre (ej. Release 1.5.0)" />
                <Input
                  name="releaseBranchName"
                  placeholder="Branch (ej. release/1.5.0)"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="consolidateId">Consolidado</Label>
            <select
              id="consolidateId"
              name="consolidateId"
              value={consolidateChoice}
              onChange={(e) => setConsolidateChoice(e.target.value)}
              className={selectClassName}
            >
              <option value="">Ninguno</option>
              {projectConsolidates.map((consolidate) => (
                <option key={consolidate.id} value={consolidate.id}>
                  {consolidate.name}
                </option>
              ))}
              <option value={NEW_BRANCH_VALUE}>+ Crear nuevo consolidado…</option>
            </select>
            {consolidateChoice === NEW_BRANCH_VALUE && (
              <div className="flex flex-col gap-2 rounded-lg border border-dashed border-border p-2.5">
                <Input
                  name="consolidateName"
                  placeholder="Nombre (ej. Consolidado Sprint 13)"
                />
                <Input
                  name="consolidateBranchName"
                  placeholder="Branch (ej. candidate/consolidate-sprint-13)"
                />
              </div>
            )}
          </div>

          {state.formError && (
            <p className="text-sm text-destructive">{state.formError}</p>
          )}

          <DialogFooter>
            <div className="flex w-full items-center justify-between gap-2">
              <div>
                {task &&
                  (confirmingDelete ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-destructive">
                        ¿Eliminar esta tarea?
                      </span>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={handleDelete}
                        disabled={isDeleting}
                      >
                        {isDeleting ? "Eliminando…" : "Confirmar"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setConfirmingDelete(false)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => setConfirmingDelete(true)}
                    >
                      <Trash2 className="size-4" />
                      Eliminar
                    </Button>
                  ))}
              </div>
              <div className="flex items-center gap-2">
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
              </div>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
