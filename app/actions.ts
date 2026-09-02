"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { parseTaskFormData, type TaskFormValues } from "@/lib/validations/task";
import {
  parseProjectFormData,
  type ProjectFormValues,
} from "@/lib/validations/project";

const updateTaskStatusSchema = z.object({
  taskId: z.string().cuid(),
  status: z.enum(["ACTIVE", "BLOCK", "FINISHED", "PUBLISHED_PROD"]),
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
    status: values.status,
    priority: values.priority,
    dueDate: values.dueDate ? new Date(values.dueDate) : null,
    pinned: values.pinned,
  };
}

export async function createTask(
  _prevState: TaskFormState,
  formData: FormData,
): Promise<TaskFormState> {
  const parsed = parseTaskFormData(formData);
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await prisma.task.create({ data: toTaskData(parsed.data) });

  revalidatePath("/");
  return { success: true };
}

export async function updateTask(
  taskId: string,
  _prevState: TaskFormState,
  formData: FormData,
): Promise<TaskFormState> {
  const parsed = parseTaskFormData(formData);
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await prisma.task.update({
    where: { id: taskId },
    data: toTaskData(parsed.data),
  });

  revalidatePath("/");
  return { success: true };
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
