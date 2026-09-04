-- AlterEnum
ALTER TYPE "status" ADD VALUE 'IN_QA';

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "ticket_number" TEXT,
ADD COLUMN     "url" TEXT;
