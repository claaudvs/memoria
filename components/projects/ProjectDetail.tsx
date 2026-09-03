"use client";

import type { Status } from "@prisma/client";
import { GitBranch, GitMerge, ListTodo, Pencil } from "lucide-react";
import Link from "next/link";
import { useState, type ComponentType } from "react";

import { BranchStatusBadge } from "@/components/projects/BranchStatusBadge";
import {
  ProjectModal,
  type ProjectModalProject,
} from "@/components/projects/ProjectModal";
import { BranchChip } from "@/components/tasks/BranchChip";
import { TaskCard, type TaskCardProps } from "@/components/tasks/TaskCard";
import {
  TaskModal,
  type TaskModalConsolidate,
  type TaskModalProject,
  type TaskModalRelease,
  type TaskModalTask,
} from "@/components/tasks/TaskModal";
import { cn } from "@/lib/utils";

export type ProjectDetailTask = Omit<TaskCardProps, "onEdit"> & {
  projectId: string;
  description: string | null;
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

  function openEditTask(task: ProjectDetailTask) {
    setEditingTask({
      id: task.id,
      projectId: task.projectId,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      pinned: task.pinned,
      currentReleaseId: task.release?.id ?? null,
      currentConsolidateId: task.consolidate?.id ?? null,
    });
    setTaskModalOpen(true);
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      <Link
        href="/projects"
        className="w-fit text-sm text-muted-foreground hover:text-foreground"
      >
        ← Proyectos
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          {project.description && (
            <p className="max-w-2xl text-muted-foreground">
              {project.description}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setProjectModalOpen(true)}
          aria-label="Editar proyecto"
          className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-card text-muted-foreground shadow-soft hover:text-foreground"
        >
          <Pencil className="size-4" />
        </button>
      </div>

      <div className="flex w-fit items-center gap-1 rounded-full bg-secondary p-1">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              tab === key
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
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
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {tasks.map((task) => (
              <TaskCard key={task.id} {...task} onEdit={() => openEditTask(task)} />
            ))}
          </div>
        ))}

      {tab === "releases" &&
        (releases.length === 0 ? (
          <EmptyState icon={GitBranch} label="Este proyecto todavía no tiene releases." />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {releases.map((release) => (
              <BranchCard key={release.id} branch={release} />
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {consolidates.map((consolidate) => (
              <BranchCard key={consolidate.id} branch={consolidate} />
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
    </div>
  );
}

function BranchCard({ branch }: { branch: ProjectDetailBranch }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-card p-4 shadow-soft">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold leading-snug">{branch.name}</h3>
        <BranchStatusBadge status={branch.status} />
      </div>
      {branch.description && (
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {branch.description}
        </p>
      )}
      <div>
        <BranchChip label={branch.branchName} branchName={branch.branchName} />
      </div>
    </div>
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
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border p-12 text-center text-muted-foreground">
      <Icon className="size-6" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
