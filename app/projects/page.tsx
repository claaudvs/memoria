import { ProjectGrid } from "@/components/projects/ProjectGrid";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    where: { deletedAt: null },
    orderBy: { updatedAt: "desc" },
    include: {
      tasks: {
        where: { deletedAt: null },
        select: { status: true },
      },
    },
  });

  const gridProjects = projects.map((project) => ({
    id: project.id,
    name: project.name,
    description: project.description,
    activeCount: project.tasks.filter((t) => t.status === "ACTIVE" || t.status === "BLOCK")
      .length,
    qaCount: project.tasks.filter((t) => t.status === "IN_QA").length,
    finishedCount: project.tasks.filter(
      (t) => t.status === "FINISHED" || t.status === "PUBLISHED_PROD",
    ).length,
  }));

  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      <div className="flex items-baseline justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Proyectos</h1>
        {gridProjects.length > 0 && (
          <span className="font-mono text-xs font-medium text-muted-foreground">
            {gridProjects.length} proyecto{gridProjects.length === 1 ? "" : "s"}
          </span>
        )}
      </div>
      <ProjectGrid projects={gridProjects} />
    </div>
  );
}
