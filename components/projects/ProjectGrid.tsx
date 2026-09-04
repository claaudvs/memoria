"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { ProjectCard, type ProjectCardProps } from "@/components/projects/ProjectCard";
import { ProjectModal } from "@/components/projects/ProjectModal";

export function ProjectGrid({ projects }: { projects: ProjectCardProps[] }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="col-span-full flex items-center gap-3 rounded-[10px] border border-dashed border-foreground/[0.18] bg-card/50 px-5 py-4 text-left text-muted-foreground transition-colors duration-[180ms] ease-out hover:border-foreground/30 hover:bg-card hover:text-foreground"
      >
        <span className="flex size-[26px] shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Plus className="size-4" />
        </span>
        <span className="text-sm font-semibold">Nuevo proyecto</span>
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
