import { TaskBoard } from "@/components/tasks/TaskBoard";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [tasks, projects] = await Promise.all([
    prisma.task.findMany({
      where: { deletedAt: null, status: { in: ["ACTIVE", "BLOCK"] } },
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
      include: {
        project: true,
        taskReleases: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { release: true },
        },
        taskConsolidates: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { consolidate: true },
        },
      },
    }),
    prisma.project.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const boardTasks = tasks.map((task) => ({
    id: task.id,
    number: task.number,
    title: task.title,
    projectId: task.projectId,
    projectName: task.project.name,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate,
    pinned: task.pinned,
    release: task.taskReleases[0]?.release ?? null,
    consolidate: task.taskConsolidates[0]?.consolidate ?? null,
  }));

  return <TaskBoard tasks={boardTasks} projects={projects} />;
}
