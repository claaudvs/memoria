import { z } from "zod";

export const todoGroupFormSchema = z.object({
  taskId: z.string().cuid(),
  title: z
    .string()
    .trim()
    .min(1, "El título es obligatorio.")
    .max(120, "Máximo 120 caracteres."),
});

export const todoItemFormSchema = z.object({
  todoId: z.string().cuid(),
  title: z
    .string()
    .trim()
    .min(1, "El título es obligatorio.")
    .max(200, "Máximo 200 caracteres."),
});
