-- CreateIndex
CREATE INDEX "documents_authorId_idx" ON "documents"("authorId");

-- CreateIndex
CREATE INDEX "collaborators_userId_idx" ON "collaborators"("userId");

-- CreateIndex
CREATE INDEX "collaboration_requests_userId_idx" ON "collaboration_requests"("userId");

-- CreateIndex
CREATE INDEX "collaboration_requests_documentId_idx" ON "collaboration_requests"("documentId");
