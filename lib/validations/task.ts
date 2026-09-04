import { z } from "zod";

export const STATUS_VALUES = ["ACTIVE", "IN_QA", "BLOCK", "FINISHED", "PUBLISHED_PROD"] as const;
export const PRIORITY_VALUES = ["LOW", "MEDIUM", "HIGH"] as const;

// Sentinel select value meaning "create a new release/consolidate", as opposed
// to picking an existing one from the project's catalog (or leaving it unset).
export const NEW_BRANCH_VALUE = "__new__";

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
  ticketNumber: z.string().trim().max(50, "Máximo 50 caracteres.").optional().or(z.literal("")),
  url: z
    .string()
    .trim()
    .max(500, "Máximo 500 caracteres.")
    .url("URL inválida.")
    .optional()
    .or(z.literal("")),
  status: z.enum(STATUS_VALUES),
  priority: z.enum(PRIORITY_VALUES),
  dueDate: z.string().optional().or(z.literal("")),
  pinned: z.boolean(),
  releaseId: z.string().optional().or(z.literal("")),
  releaseName: z.string().trim().max(120).optional().or(z.literal("")),
  releaseBranchName: z.string().trim().max(200).optional().or(z.literal("")),
  consolidateId: z.string().optional().or(z.literal("")),
  consolidateName: z.string().trim().max(120).optional().or(z.literal("")),
  consolidateBranchName: z.string().trim().max(200).optional().or(z.literal("")),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;

export function parseTaskFormData(formData: FormData) {
  return taskFormSchema.safeParse({
    projectId: formData.get("projectId"),
    title: formData.get("title"),
    description: formData.get("description"),
    ticketNumber: formData.get("ticketNumber"),
    url: formData.get("url"),
    status: formData.get("status"),
    priority: formData.get("priority"),
    dueDate: formData.get("dueDate"),
    pinned: formData.get("pinned") === "on",
    releaseId: formData.get("releaseId"),
    // The new-release/new-consolidate fields only exist in the DOM while
    // NEW_BRANCH_VALUE is selected — formData.get() returns null otherwise,
    // which z.string().optional() rejects (it only allows undefined).
    releaseName: formData.get("releaseName") ?? "",
    releaseBranchName: formData.get("releaseBranchName") ?? "",
    consolidateId: formData.get("consolidateId"),
    consolidateName: formData.get("consolidateName") ?? "",
    consolidateBranchName: formData.get("consolidateBranchName") ?? "",
  });
}
