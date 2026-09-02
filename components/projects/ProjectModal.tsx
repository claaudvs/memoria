"use client";

import { useActionState, useEffect } from "react";

import {
  createProject,
  updateProject,
  type ProjectFormState,
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

const INITIAL_STATE: ProjectFormState = { success: false };

export type ProjectModalProject = {
  id: string;
  name: string;
  description: string | null;
};

export function ProjectModal({
  open,
  onOpenChange,
  project,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: ProjectModalProject | null;
}) {
  const action = project
    ? updateProject.bind(null, project.id)
    : createProject;
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
          <DialogTitle>
            {project ? "Editar proyecto" : "Nuevo proyecto"}
          </DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              name="name"
              defaultValue={project?.name}
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
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={project?.description ?? ""}
            />
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
              {isPending
                ? "Guardando…"
                : project
                  ? "Guardar cambios"
                  : "Crear proyecto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
