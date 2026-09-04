"use client";

import type { Status } from "@prisma/client";
import { Check, GitBranch, GitMerge, ListTodo, Pencil } from "lucide-react";
import Link from "next/link";
import { useState, type ComponentType } from "react";

import {
  BranchModal,
  type BranchKind,
  type BranchModalItem,
} from "@/components/branches/BranchModal";
import { BranchStatusBadge } from "@/components/projects/BranchStatusBadge";
import {
  ProjectModal,
  type ProjectModalProject,
} from "@/components/projects/ProjectModal";
import { PinnedPill } from "@/components/tasks/PinnedPill";
import { PRIORITY_LABEL } from "@/components/tasks/PriorityBars";
import { StatusBadge } from "@/components/tasks/StatusBadge";
import { type TaskCardProps } from "@/components/tasks/TaskCard";
import {
  TaskModal,
  type TaskModalConsolidate,
  type TaskModalProject,
  type TaskModalRelease,
  type TaskModalTask,
} from "@/components/tasks/TaskModal";
import { cn, dotColor, isTaskDone } from "@/lib/utils";

export type ProjectDetailTask = Omit<TaskCardProps, "onEdit"> & {
  projectId: string;
  description: string | null;
  ticketNumber: string | null;
  url: string | null;
  dueDate: Date | null;
};

export type ProjectDetailBranch = {
  id: string;
  name: string;
  description: string | null;
  status: Status;
  branchName: string;
};

const TABS = [
  { key: "tasks", label: "Tareas" },
  { key: "releases", label: "Releases" },
  { key: "consolidates", label: "Consolidados" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const CARD_CLASS =
  "overflow-hidden rounded-[10px] border border-border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.05),0_6px_16px_-6px_rgba(0,0,0,0.10)] transition-all duration-[180ms] ease-out hover:-translate-y-0.5 hover:border-foreground/15 hover:shadow-[0_2px_4px_rgba(0,0,0,0.06),0_14px_28px_-10px_rgba(0,0,0,0.18)]";

export function ProjectDetail({
  project,
  tasks,
  releases,
  consolidates,
  allProjects,
  allReleases,
  allConsolidates,
}: {
  project: ProjectModalProject;
  tasks: ProjectDetailTask[];
  releases: ProjectDetailBranch[];
  consolidates: ProjectDetailBranch[];
  allProjects: TaskModalProject[];
  allReleases: TaskModalRelease[];
  allConsolidates: TaskModalConsolidate[];
}) {
  const [tab, setTab] = useState<TabKey>("tasks");
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskModalTask | null>(null);
  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [branchKind, setBranchKind] = useState<BranchKind>("release");
  const [editingBranch, setEditingBranch] = useState<BranchModalItem | null>(null);

  function openEditTask(task: ProjectDetailTask) {
    setEditingTask({
      id: task.id,
      projectId: task.projectId,
      title: task.title,
      description: task.description,
      ticketNumber: task.ticketNumber,
      url: task.url,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      pinned: task.pinned,
      currentReleaseId: task.release?.id ?? null,
      currentConsolidateId: task.consolidate?.id ?? null,
    });
    setTaskModalOpen(true);
  }

  function openEditBranch(branch: ProjectDetailBranch, kind: BranchKind) {
    setBranchKind(kind);
    setEditingBranch({
      id: branch.id,
      projectId: project.id,
      name: branch.name,
      description: branch.description,
      branchName: branch.branchName,
      status: branch.status,
    });
    setBranchModalOpen(true);
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      <Link
        href="/projects"
        className="flex w-fit items-center gap-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground"
      >
        ← Proyectos
      </Link>

      <div className="flex flex-col gap-1">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-[27px] leading-tight font-bold tracking-[-0.02em]">
            {project.name}
          </h1>
          <button
            type="button"
            onClick={() => setProjectModalOpen(true)}
            aria-label="Editar proyecto"
            className="flex size-9 shrink-0 items-center justify-center rounded-[10px] border border-border bg-card text-muted-foreground shadow-soft hover:border-foreground/20 hover:text-foreground"
          >
            <Pencil className="size-4" />
          </button>
        </div>
        {project.description && (
          <p className="max-w-2xl text-[13.5px] leading-[1.5] text-muted-foreground">
            {project.description}
          </p>
        )}
      </div>

      <div className="flex w-fit items-center gap-2">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "rounded-[9px] px-4 py-[9px] text-[12.5px] transition-colors",
              tab === key
                ? "bg-primary font-semibold text-primary-foreground"
                : "border border-border bg-card font-medium text-muted-foreground hover:border-foreground/20 hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "tasks" &&
        (tasks.length === 0 ? (
          <EmptyState icon={ListTodo} label="Este proyecto todavía no tiene tareas." />
        ) : (
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            {tasks.map((task) => (
              <ProjectTaskCard key={task.id} task={task} onEdit={() => openEditTask(task)} />
            ))}
          </div>
        ))}

      {tab === "releases" &&
        (releases.length === 0 ? (
          <EmptyState icon={GitBranch} label="Este proyecto todavía no tiene releases." />
        ) : (
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            {releases.map((release) => (
              <BranchCard
                key={release.id}
                branch={release}
                projectName={project.name}
                onEdit={() => openEditBranch(release, "release")}
              />
            ))}
          </div>
        ))}

      {tab === "consolidates" &&
        (consolidates.length === 0 ? (
          <EmptyState
            icon={GitMerge}
            label="Este proyecto todavía no tiene consolidados."
          />
        ) : (
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            {consolidates.map((consolidate) => (
              <BranchCard
                key={consolidate.id}
                branch={consolidate}
                projectName={project.name}
                onEdit={() => openEditBranch(consolidate, "consolidate")}
              />
            ))}
          </div>
        ))}

      {projectModalOpen && (
        <ProjectModal
          open={projectModalOpen}
          onOpenChange={setProjectModalOpen}
          project={project}
        />
      )}

      {taskModalOpen && (
        <TaskModal
          open={taskModalOpen}
          onOpenChange={setTaskModalOpen}
          projects={allProjects}
          releases={allReleases}
          consolidates={allConsolidates}
          task={editingTask}
        />
      )}

      {branchModalOpen && (
        <BranchModal
          kind={branchKind}
          open={branchModalOpen}
          onOpenChange={setBranchModalOpen}
          projects={allProjects}
          item={editingBranch}
        />
      )}
    </div>
  );
}

function ProjectTaskCard({
  task,
  onEdit,
}: {
  task: ProjectDetailTask;
  onEdit: () => void;
}) {
  const done = isTaskDone(task.status);
  const branchLabel = [task.release?.name, task.consolidate?.name]
    .filter((value): value is string => Boolean(value))
    .join(" · ");

  return (
    <Link
      href={`/tasks/${task.number}`}
      className={cn("flex", CARD_CLASS, done && "bg-status-finished-tint")}
    >
      <div className={cn("w-1 shrink-0", dotColor(task.projectName), done && "opacity-35")} />
      <div className="flex min-w-0 flex-1 flex-col gap-2.5 px-5 py-[18px]">
        <div className="flex items-center gap-2.5">
          <span className="flex-1 truncate font-mono text-[10.5px] font-medium tracking-[0.06em] text-muted-foreground uppercase">
            {task.projectName}
          </span>
          <span className="font-mono text-[11.5px] font-medium text-muted-foreground">
            #{task.number}
          </span>
          {done ? (
            <Check className="size-3.5 shrink-0 text-status-finished" />
          ) : (
            task.pinned && <PinnedPill />
          )}
        </div>

        <h3
          className={cn(
            "text-base leading-snug font-semibold text-wrap",
            done && "text-muted-foreground line-through decoration-muted-foreground/40",
          )}
        >
          {task.title}
        </h3>

        {branchLabel && (
          <div className="font-mono text-[11.5px] leading-relaxed text-muted-foreground">
            {branchLabel}
          </div>
        )}

        <div
          className="flex items-center gap-1.5 text-[11.5px] font-medium text-muted-foreground"
          onClick={(e) => e.stopPropagation()}
        >
          <StatusBadge taskId={task.id} status={task.status} variant="plain" />
          <span>· {PRIORITY_LABEL[task.priority]}</span>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit();
            }}
            aria-label="Editar tarea"
            className="ml-auto text-muted-foreground hover:text-foreground"
          >
            <Pencil className="size-3.5" />
          </button>
        </div>
      </div>
    </Link>
  );
}

function BranchCard({
  branch,
  projectName,
  onEdit,
}: {
  branch: ProjectDetailBranch;
  projectName: string;
  onEdit: () => void;
}) {
  return (
    <button type="button" onClick={onEdit} className={cn("flex text-left", CARD_CLASS)}>
      <div className={cn("w-1 shrink-0", dotColor(projectName))} />
      <div className="flex min-w-0 flex-1 flex-col gap-3 px-5 py-[18px]">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[15.5px] leading-snug font-semibold text-wrap">
            {branch.name}
          </h3>
          <BranchStatusBadge status={branch.status} />
        </div>
        {branch.description && (
          <p className="line-clamp-2 text-[12.5px] text-muted-foreground">
            {branch.description}
          </p>
        )}
        <BranchNameChip branchName={branch.branchName} />
      </div>
    </button>
  );
}

function BranchNameChip({ branchName }: { branchName: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    await navigator.clipboard.writeText(branchName);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <span
      role="button"
      tabIndex={0}
      onClick={handleCopy}
      title={copied ? "¡Copiado!" : "Click para copiar"}
      className="w-fit max-w-full truncate rounded-[5px] bg-foreground/[0.035] px-[9px] py-[5px] font-mono text-[11px] leading-relaxed text-muted-foreground"
    >
      {copied ? "¡Copiado!" : branchName}
    </span>
  );
}

function EmptyState({
  icon: Icon,
  label,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-[10px] border-2 border-dashed border-border p-12 text-center text-muted-foreground">
      <Icon className="size-6" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
