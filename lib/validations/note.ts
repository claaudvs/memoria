import { z } from "zod";

export const noteFormSchema = z.object({
  taskId: z.string().cuid(),
  comment: z
    .string()
    .trim()
    .min(1, "El comentario no puede estar vacío.")
    .max(2000, "Máximo 2000 caracteres."),
});
