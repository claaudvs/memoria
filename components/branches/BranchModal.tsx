"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState, useTransition } from "react";

import {
  createConsolidate,
  createRelease,
  deleteConsolidate,
  deleteRelease,
  updateConsolidate,
  updateRelease,
  type BranchFormState,
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
import { STATUS_VALUES } from "@/lib/validations/task";

const STATUS_LABEL: Record<(typeof STATUS_VALUES)[number], string> = {
  ACTIVE: "Activa",
  IN_QA: "En QA",
  BLOCK: "Block",
  FINISHED: "Finalizada",
  PUBLISHED_PROD: "Publicada prod",
};

const selectClassName =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export type BranchKind = "release" | "consolidate";

export type BranchModalProject = { id: string; name: string };

export type BranchModalItem = {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  branchName: string;
  status: (typeof STATUS_VALUES)[number];
};

const INITIAL_STATE: BranchFormState = { success: false };

const KIND_LABEL: Record<BranchKind, string> = {
  release: "release",
  consolidate: "consolidado",
};

const BRANCH_PLACEHOLDER: Record<BranchKind, string> = {
  release: "release/1.5.0",
  consolidate: "candidate/consolidate-sprint-13",
};

export function BranchModal({
  kind,
  open,
  onOpenChange,
  projects,
  item,
}: {
  kind: BranchKind;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: BranchModalProject[];
  item: BranchModalItem | null;
}) {
  const createAction = kind === "release" ? createRelease : createConsolidate;
  const updateAction = kind === "release" ? updateRelease : updateConsolidate;
  const action = item ? updateAction.bind(null, item.id) : createAction;
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);

  const router = useRouter();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    if (state.success) {
      onOpenChange(false);
    }
  }, [state.success, onOpenChange]);

  const kindLabel = KIND_LABEL[kind];

  function handleDelete() {
    if (!item) return;
    const deleteAction = kind === "release" ? deleteRelease : deleteConsolidate;
    startDeleteTransition(async () => {
      await deleteAction(item.id);
      router.refresh();
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {item ? `Editar ${kindLabel}` : `Nuevo ${kindLabel}`}
          </DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              name="name"
              defaultValue={item?.name}
              required
              autoFocus
            />
            {state.fieldErrors?.name && (
              <p className="text-xs text-destructive">
                {state.fieldErrors.name[0]}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="projectId">Proyecto</Label>
            <select
              id="projectId"
              name="projectId"
              defaultValue={item?.projectId ?? projects[0]?.id}
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
            <Label htmlFor="branchName">Branch</Label>
            <Input
              id="branchName"
              name="branchName"
              defaultValue={item?.branchName}
              placeholder={BRANCH_PLACEHOLDER[kind]}
              required
            />
            {state.fieldErrors?.branchName && (
              <p className="text-xs text-destructive">
                {state.fieldErrors.branchName[0]}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={item?.description ?? ""}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="status">Estado</Label>
            <select
              id="status"
              name="status"
              defaultValue={item?.status ?? "ACTIVE"}
              className={selectClassName}
            >
              {STATUS_VALUES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABEL[status]}
                </option>
              ))}
            </select>
          </div>

          {state.formError && (
            <p className="text-sm text-destructive">{state.formError}</p>
          )}

          <DialogFooter>
            <div className="flex w-full items-center justify-between gap-2">
              <div>
                {item &&
                  (confirmingDelete ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-destructive">
                        ¿Eliminar este {kindLabel}?
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
                  {isPending
                    ? "Guardando…"
                    : item
                      ? "Guardar cambios"
                      : `Crear ${kindLabel}`}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
