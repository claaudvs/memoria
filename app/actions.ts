"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/db";
import {
  NEW_BRANCH_VALUE,
  parseTaskFormData,
  type TaskFormValues,
} from "@/lib/validations/task";
import {
  parseProjectFormData,
  type ProjectFormValues,
} from "@/lib/validations/project";
import {
  parseBranchFormData,
  type BranchFormValues,
} from "@/lib/validations/branch";
import { todoGroupFormSchema, todoItemFormSchema } from "@/lib/validations/todo";
import { noteFormSchema } from "@/lib/validations/note";

const updateTaskStatusSchema = z.object({
  taskId: z.string().cuid(),
  status: z.enum(["ACTIVE", "IN_QA", "BLOCK", "FINISHED", "PUBLISHED_PROD"]),
});

export async function updateTaskStatus(taskId: string, status: string) {
  const input = updateTaskStatusSchema.parse({ taskId, status });

  await prisma.task.update({
    where: { id: input.taskId },
    data: { status: input.status },
  });

  revalidatePath("/");
}

const toggleTaskPinnedSchema = z.object({
  taskId: z.string().cuid(),
  pinned: z.boolean(),
});

export async function toggleTaskPinned(taskId: string, pinned: boolean) {
  const input = toggleTaskPinnedSchema.parse({ taskId, pinned });

  await prisma.task.update({
    where: { id: input.taskId },
    data: { pinned: input.pinned },
  });

  revalidatePath("/");
}

export type TaskFormState = {
  success: boolean;
  fieldErrors?: Partial<Record<keyof TaskFormValues, string[]>>;
  formError?: string;
};

function toTaskData(values: TaskFormValues) {
  return {
    projectId: values.projectId,
    title: values.title,
    description: values.description ? values.description : null,
    ticketNumber: values.ticketNumber ? values.ticketNumber : null,
    url: values.url ? values.url : null,
    status: values.status,
    priority: values.priority,
    dueDate: values.dueDate ? new Date(values.dueDate) : null,
    pinned: values.pinned,
  };
}

function newBranchError(values: TaskFormValues): string | null {
  if (
    values.releaseId === NEW_BRANCH_VALUE &&
    (!values.releaseName || !values.releaseBranchName)
  ) {
    return "Completá nombre y branch para el nuevo release.";
  }
  if (
    values.consolidateId === NEW_BRANCH_VALUE &&
    (!values.consolidateName || !values.consolidateBranchName)
  ) {
    return "Completá nombre y branch para el nuevo consolidado.";
  }
  return null;
}

async function resolveReleaseId(
  tx: Prisma.TransactionClient,
  projectId: string,
  values: TaskFormValues,
): Promise<string | null> {
  if (values.releaseId === NEW_BRANCH_VALUE) {
    if (!values.releaseName || !values.releaseBranchName) return null;
    const release = await tx.release.upsert({
      where: {
        projectId_branchName: {
          projectId,
          branchName: values.releaseBranchName,
        },
      },
      update: {},
      create: {
        projectId,
        name: values.releaseName,
        branchName: values.releaseBranchName,
      },
    });
    return release.id;
  }
  return values.releaseId || null;
}

async function resolveConsolidateId(
  tx: Prisma.TransactionClient,
  projectId: string,
  values: TaskFormValues,
): Promise<string | null> {
  if (values.consolidateId === NEW_BRANCH_VALUE) {
    if (!values.consolidateName || !values.consolidateBranchName) return null;
    const consolidate = await tx.consolidate.upsert({
      where: {
        projectId_branchName: {
          projectId,
          branchName: values.consolidateBranchName,
        },
      },
      update: {},
      create: {
        projectId,
        name: values.consolidateName,
        branchName: values.consolidateBranchName,
      },
    });
    return consolidate.id;
  }
  return values.consolidateId || null;
}

export async function createTask(
  _prevState: TaskFormState,
  formData: FormData,
): Promise<TaskFormState> {
  const parsed = parseTaskFormData(formData);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return {
      success: false,
      fieldErrors,
      formError: fieldErrors.title || fieldErrors.projectId
        ? undefined
        : "Revisá los datos del formulario.",
    };
  }

  const formError = newBranchError(parsed.data);
  if (formError) {
    return { success: false, formError };
  }

  await prisma.$transaction(async (tx) => {
    const task = await tx.task.create({ data: toTaskData(parsed.data) });
    const releaseId = await resolveReleaseId(tx, parsed.data.projectId, parsed.data);
    const consolidateId = await resolveConsolidateId(
      tx,
      parsed.data.projectId,
      parsed.data,
    );

    if (releaseId) {
      await tx.taskRelease.create({ data: { taskId: task.id, releaseId } });
    }
    if (consolidateId) {
      await tx.taskConsolidate.create({
        data: { taskId: task.id, consolidateId },
      });
    }
  });

  revalidatePath("/");
  return { success: true };
}

export async function updateTask(
  taskId: string,
  currentReleaseId: string | null,
  currentConsolidateId: string | null,
  _prevState: TaskFormState,
  formData: FormData,
): Promise<TaskFormState> {
  const parsed = parseTaskFormData(formData);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return {
      success: false,
      fieldErrors,
      formError: fieldErrors.title || fieldErrors.projectId
        ? undefined
        : "Revisá los datos del formulario.",
    };
  }

  const formError = newBranchError(parsed.data);
  if (formError) {
    return { success: false, formError };
  }

  await prisma.$transaction(async (tx) => {
    await tx.task.update({ where: { id: taskId }, data: toTaskData(parsed.data) });
    const releaseId = await resolveReleaseId(tx, parsed.data.projectId, parsed.data);
    const consolidateId = await resolveConsolidateId(
      tx,
      parsed.data.projectId,
      parsed.data,
    );

    if (releaseId && releaseId !== currentReleaseId) {
      await tx.taskRelease.create({ data: { taskId, releaseId } });
    }
    if (consolidateId && consolidateId !== currentConsolidateId) {
      await tx.taskConsolidate.create({
        data: { taskId, consolidateId },
      });
    }
  });

  revalidatePath("/");
  return { success: true };
}

export async function deleteTask(taskId: string) {
  const id = z.string().cuid().parse(taskId);

  await prisma.task.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/");
}

export type ProjectFormState = {
  success: boolean;
  fieldErrors?: Partial<Record<keyof ProjectFormValues, string[]>>;
  formError?: string;
};

export async function createProject(
  _prevState: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  const parsed = parseProjectFormData(formData);
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await prisma.project.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description ? parsed.data.description : null,
    },
  });

  revalidatePath("/projects");
  return { success: true };
}

export async function updateProject(
  projectId: string,
  _prevState: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  const parsed = parseProjectFormData(formData);
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await prisma.project.update({
    where: { id: projectId },
    data: {
      name: parsed.data.name,
      description: parsed.data.description ? parsed.data.description : null,
    },
  });

  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  return { success: true };
}

export type BranchFormState = {
  success: boolean;
  fieldErrors?: Partial<Record<keyof BranchFormValues, string[]>>;
  formError?: string;
};

function toBranchData(values: BranchFormValues) {
  return {
    projectId: values.projectId,
    name: values.name,
    description: values.description ? values.description : null,
    branchName: values.branchName,
    status: values.status,
  };
}

function isDuplicateBranchError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

function revalidateBranchPaths(projectId: string) {
  revalidatePath("/releases");
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
}

export async function createRelease(
  _prevState: BranchFormState,
  formData: FormData,
): Promise<BranchFormState> {
  const parsed = parseBranchFormData(formData);
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await prisma.release.create({ data: toBranchData(parsed.data) });
  } catch (error) {
    if (isDuplicateBranchError(error)) {
      return {
        success: false,
        formError: "Ya existe un release con ese branch en este proyecto.",
      };
    }
    throw error;
  }

  revalidateBranchPaths(parsed.data.projectId);
  return { success: true };
}

export async function updateRelease(
  releaseId: string,
  _prevState: BranchFormState,
  formData: FormData,
): Promise<BranchFormState> {
  const parsed = parseBranchFormData(formData);
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await prisma.release.update({
      where: { id: releaseId },
      data: toBranchData(parsed.data),
    });
  } catch (error) {
    if (isDuplicateBranchError(error)) {
      return {
        success: false,
        formError: "Ya existe un release con ese branch en este proyecto.",
      };
    }
    throw error;
  }

  revalidateBranchPaths(parsed.data.projectId);
  return { success: true };
}

export async function createConsolidate(
  _prevState: BranchFormState,
  formData: FormData,
): Promise<BranchFormState> {
  const parsed = parseBranchFormData(formData);
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await prisma.consolidate.create({ data: toBranchData(parsed.data) });
  } catch (error) {
    if (isDuplicateBranchError(error)) {
      return {
        success: false,
        formError: "Ya existe un consolidado con ese branch en este proyecto.",
      };
    }
    throw error;
  }

  revalidateBranchPaths(parsed.data.projectId);
  return { success: true };
}

export async function updateConsolidate(
  consolidateId: string,
  _prevState: BranchFormState,
  formData: FormData,
): Promise<BranchFormState> {
  const parsed = parseBranchFormData(formData);
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await prisma.consolidate.update({
      where: { id: consolidateId },
      data: toBranchData(parsed.data),
    });
  } catch (error) {
    if (isDuplicateBranchError(error)) {
      return {
        success: false,
        formError: "Ya existe un consolidado con ese branch en este proyecto.",
      };
    }
    throw error;
  }

  revalidateBranchPaths(parsed.data.projectId);
  return { success: true };
}

export async function deleteRelease(releaseId: string) {
  const id = z.string().cuid().parse(releaseId);

  const release = await prisma.release.update({
    where: { id },
    data: { deletedAt: new Date() },
    select: { projectId: true },
  });

  revalidateBranchPaths(release.projectId);
}

export async function deleteConsolidate(consolidateId: string) {
  const id = z.string().cuid().parse(consolidateId);

  const consolidate = await prisma.consolidate.update({
    where: { id },
    data: { deletedAt: new Date() },
    select: { projectId: true },
  });

  revalidateBranchPaths(consolidate.projectId);
}

function revalidateTaskDetailPath(taskNumber: number) {
  revalidatePath(`/tasks/${taskNumber}`);
}

export async function createTodoGroup(taskNumber: number, formData: FormData) {
  const input = todoGroupFormSchema.parse({
    taskId: formData.get("taskId"),
    title: formData.get("title"),
  });

  await prisma.todo.create({ data: { taskId: input.taskId, title: input.title } });

  revalidateTaskDetailPath(taskNumber);
}

export async function deleteTodoGroup(todoId: string, taskNumber: number) {
  const id = z.string().cuid().parse(todoId);

  await prisma.todo.update({ where: { id }, data: { deletedAt: new Date() } });

  revalidateTaskDetailPath(taskNumber);
}

export async function createTodoItem(taskNumber: number, formData: FormData) {
  const input = todoItemFormSchema.parse({
    todoId: formData.get("todoId"),
    title: formData.get("title"),
  });

  const lastItem = await prisma.todoItem.findFirst({
    where: { todoId: input.todoId, deletedAt: null },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  await prisma.todoItem.create({
    data: {
      todoId: input.todoId,
      title: input.title,
      order: (lastItem?.order ?? -1) + 1,
    },
  });

  revalidateTaskDetailPath(taskNumber);
}

export async function toggleTodoItem(
  itemId: string,
  completed: boolean,
  taskNumber: number,
) {
  const id = z.string().cuid().parse(itemId);

  await prisma.todoItem.update({ where: { id }, data: { completed } });

  revalidateTaskDetailPath(taskNumber);
}

export async function deleteTodoItem(itemId: string, taskNumber: number) {
  const id = z.string().cuid().parse(itemId);

  await prisma.todoItem.update({ where: { id }, data: { deletedAt: new Date() } });

  revalidateTaskDetailPath(taskNumber);
}

export async function createNote(taskNumber: number, formData: FormData) {
  const input = noteFormSchema.parse({
    taskId: formData.get("taskId"),
    comment: formData.get("comment"),
  });

  await prisma.note.create({
    data: { taskId: input.taskId, comment: input.comment },
  });

  revalidateTaskDetailPath(taskNumber);
}

export async function deleteNote(noteId: string, taskNumber: number) {
  const id = z.string().cuid().parse(noteId);

  await prisma.note.update({ where: { id }, data: { deletedAt: new Date() } });

  revalidateTaskDetailPath(taskNumber);
}
