import { z } from "zod";

export const STATUS_VALUES = ["ACTIVE", "BLOCK", "FINISHED", "PUBLISHED_PROD"] as const;
export const PRIORITY_VALUES = ["LOW", "MEDIUM", "HIGH"] as const;

export const taskFormSchema = z.object({
  projectId: z.string().cuid({ message: "Seleccioná un proyecto." }),
  title: z
    .string()
    .trim()
    .min(1, "El título es obligatorio.")
    .max(200, "Máximo 200 caracteres."),
  description: z
    .string()
    .trim()
    .max(2000, "Máximo 2000 caracteres.")
    .optional()
    .or(z.literal("")),
  status: z.enum(STATUS_VALUES),
  priority: z.enum(PRIORITY_VALUES),
  dueDate: z.string().optional().or(z.literal("")),
  pinned: z.boolean(),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;

export function parseTaskFormData(formData: FormData) {
  return taskFormSchema.safeParse({
    projectId: formData.get("projectId"),
    title: formData.get("title"),
    description: formData.get("description"),
    status: formData.get("status"),
    priority: formData.get("priority"),
    dueDate: formData.get("dueDate"),
    pinned: formData.get("pinned") === "on",
  });
}
