-- DropForeignKey
ALTER TABLE "collaboration_requests" DROP CONSTRAINT "collaboration_requests_documentId_fkey";

-- DropForeignKey
ALTER TABLE "collaborators" DROP CONSTRAINT "collaborators_documentId_fkey";

-- AddForeignKey
ALTER TABLE "collaborators" ADD CONSTRAINT "collaborators_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collaboration_requests" ADD CONSTRAINT "collaboration_requests_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
