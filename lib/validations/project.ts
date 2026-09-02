import { z } from "zod";

export const projectFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio.")
    .max(120, "Máximo 120 caracteres."),
  description: z
    .string()
    .trim()
    .max(2000, "Máximo 2000 caracteres.")
    .optional()
    .or(z.literal("")),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

export function parseProjectFormData(formData: FormData) {
  return projectFormSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  });
}
