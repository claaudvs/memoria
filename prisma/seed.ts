import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const project = await prisma.project.create({
    data: {
      name: "ProcessBack Web",
      description: "Backoffice web app para procesos internos.",
    },
  });

  const release = await prisma.release.create({
    data: {
      projectId: project.id,
      name: "Release 1.4.0",
      branchName: "release/1.4.0",
      status: "ACTIVE",
    },
  });

  const consolidate = await prisma.consolidate.create({
    data: {
      projectId: project.id,
      name: "Consolidado Sprint 12",
      branchName: "consolidate/sprint-12",
      status: "ACTIVE",
    },
  });

  // Con release y consolidate asignados.
  await prisma.task.create({
    data: {
      projectId: project.id,
      title: "Arreglar validación de formulario de pago",
      description: "El campo de CVV acepta letras, debería aceptar solo números.",
      status: "ACTIVE",
      priority: "HIGH",
      taskReleases: { create: { releaseId: release.id } },
      taskConsolidates: { create: { consolidateId: consolidate.id } },
    },
  });

  // Solo con consolidate asignado.
  await prisma.task.create({
    data: {
      projectId: project.id,
      title: "Optimizar query de listado de clientes",
      description: "El listado tarda más de 5s con más de 10k registros.",
      status: "BLOCK",
      priority: "MEDIUM",
      taskConsolidates: { create: { consolidateId: consolidate.id } },
    },
  });

  // Sin release ni consolidate asignado.
  await prisma.task.create({
    data: {
      projectId: project.id,
      title: "Actualizar dependencia de Next.js",
      description: "Migrar a la última versión estable del framework.",
      status: "ACTIVE",
      priority: "LOW",
    },
  });

  console.log("Seed OK:", project.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
