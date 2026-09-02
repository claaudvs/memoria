"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { ProjectCard, type ProjectCardProps } from "@/components/projects/ProjectCard";
import { ProjectModal } from "@/components/projects/ProjectModal";

export function ProjectGrid({ projects }: { projects: ProjectCardProps[] }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-transparent text-muted-foreground transition-colors hover:border-foreground/20 hover:bg-card hover:text-foreground"
      >
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Plus className="size-5" />
        </span>
        <span className="text-sm font-medium">Nuevo proyecto</span>
      </button>

      {projects.map((project) => (
        <ProjectCard key={project.id} {...project} />
      ))}

      {modalOpen && (
        <ProjectModal open={modalOpen} onOpenChange={setModalOpen} />
      )}
    </div>
  );
}
