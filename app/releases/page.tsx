import { BranchBoard } from "@/components/branches/BranchBoard";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ReleasesPage() {
  const [releases, consolidates, projects] = await Promise.all([
    prisma.release.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
      include: { project: { select: { name: true } } },
    }),
    prisma.consolidate.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
      include: { project: { select: { name: true } } },
    }),
    prisma.project.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const releaseItems = releases.map((release) => ({
    id: release.id,
    projectId: release.projectId,
    projectName: release.project.name,
    name: release.name,
    description: release.description,
    branchName: release.branchName,
    status: release.status,
  }));

  const consolidateItems = consolidates.map((consolidate) => ({
    id: consolidate.id,
    projectId: consolidate.projectId,
    projectName: consolidate.project.name,
    name: consolidate.name,
    description: consolidate.description,
    branchName: consolidate.branchName,
    status: consolidate.status,
  }));

  return (
    <BranchBoard
      releases={releaseItems}
      consolidates={consolidateItems}
      projects={projects}
    />
  );
}
