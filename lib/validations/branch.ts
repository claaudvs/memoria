import { z } from "zod";

import { STATUS_VALUES } from "@/lib/validations/task";

export const branchFormSchema = z.object({
  projectId: z.string().cuid({ message: "Seleccioná un proyecto." }),
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
  branchName: z
    .string()
    .trim()
    .min(1, "El branch es obligatorio.")
    .max(200, "Máximo 200 caracteres."),
  status: z.enum(STATUS_VALUES),
});

export type BranchFormValues = z.infer<typeof branchFormSchema>;

export function parseBranchFormData(formData: FormData) {
  return branchFormSchema.safeParse({
    projectId: formData.get("projectId"),
    name: formData.get("name"),
    description: formData.get("description"),
    branchName: formData.get("branchName"),
    status: formData.get("status"),
  });
}
