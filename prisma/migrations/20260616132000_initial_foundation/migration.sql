-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'ASSET_MANAGER', 'TECHNICIAN', 'AUDITOR', 'VIEWER');
CREATE TYPE "AssetType" AS ENUM ('NOTEBOOK', 'DESKTOP', 'MONITOR', 'PRINTER', 'HANDHELD', 'MOBILE_PHONE', 'PERIPHERAL', 'SERVER', 'NETWORK', 'OTHER');
CREATE TYPE "AssetStatus" AS ENUM ('AVAILABLE', 'ASSIGNED', 'IN_TRANSIT', 'IN_MAINTENANCE', 'RESERVED', 'DISPOSAL_REQUESTED', 'DISPOSED', 'LOST', 'RETIRED');
CREATE TYPE "AssetOrigin" AS ENUM ('PURCHASE', 'LEASE', 'DONATION', 'ABSOLUTE_IMPORT', 'LEGACY_IMPORT', 'OTHER');
CREATE TYPE "LocationType" AS ENUM ('DISTRIBUTION_CENTER', 'HEADQUARTERS', 'STORE', 'INTERNAL_AREA', 'TECHNICAL_ASSISTANCE', 'SUPPLIER', 'DISPOSAL_AREA', 'TRANSIT');
CREATE TYPE "MovementType" AS ENUM ('HANDOVER', 'RETURN', 'TRANSFER', 'MAINTENANCE_SEND', 'MAINTENANCE_RETURN', 'DISPOSAL_SEND', 'INVENTORY_ADJUSTMENT');
CREATE TYPE "TermType" AS ENUM ('HANDOVER', 'RETURN', 'TRANSFER', 'REGULARIZATION');
CREATE TYPE "TermStatus" AS ENUM ('DRAFT', 'ISSUED', 'ACCEPTED', 'REVOKED', 'EXPIRED');
CREATE TYPE "MaintenanceStatus" AS ENUM ('OPEN', 'SENT_TO_PROVIDER', 'UNDER_DIAGNOSIS', 'WAITING_PARTS', 'REPAIRED', 'UNREPAIRABLE', 'CLOSED', 'CANCELED');
CREATE TYPE "DisposalStatus" AS ENUM ('REQUESTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'DISPOSED', 'CANCELED');
CREATE TYPE "ImportStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'COMPLETED_WITH_ERRORS', 'FAILED', 'CANCELED');

-- CreateTable
CREATE TABLE "User" (
  "id" TEXT NOT NULL, "name" TEXT NOT NULL, "email" TEXT NOT NULL, "role" "UserRole" NOT NULL DEFAULT 'VIEWER',
  "personId" TEXT, "active" BOOLEAN NOT NULL DEFAULT true, "lastLoginAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Person" (
  "id" TEXT NOT NULL, "name" TEXT NOT NULL, "document" TEXT, "email" TEXT, "employeeCode" TEXT, "department" TEXT,
  "locationId" TEXT, "personType" TEXT NOT NULL DEFAULT 'EMPLOYEE', "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Location" (
  "id" TEXT NOT NULL, "name" TEXT NOT NULL, "code" TEXT NOT NULL, "type" "LocationType" NOT NULL,
  "parentLocationId" TEXT, "address" TEXT, "isGovernanceBase" BOOLEAN NOT NULL DEFAULT false, "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Asset" (
  "id" TEXT NOT NULL, "assetTag" TEXT NOT NULL, "serialNumber" TEXT, "hostname" TEXT, "type" "AssetType" NOT NULL,
  "brand" TEXT, "model" TEXT, "specifications" JSONB, "status" "AssetStatus" NOT NULL DEFAULT 'AVAILABLE',
  "currentLocationId" TEXT NOT NULL, "currentResponsibleId" TEXT, "purchaseDate" TIMESTAMP(3), "warrantyEndDate" TIMESTAMP(3),
  "origin" "AssetOrigin" NOT NULL DEFAULT 'PURCHASE', "absoluteDeviceId" TEXT, "createdById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, "deletedAt" TIMESTAMP(3),
  CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "AssetAssignment" (
  "id" TEXT NOT NULL, "assetId" TEXT NOT NULL, "responsibleId" TEXT NOT NULL, "assignedByUserId" TEXT,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "endedAt" TIMESTAMP(3), "assignmentReason" TEXT, "responsibilityTermId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AssetAssignment_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "AssetMovement" (
  "id" TEXT NOT NULL, "assetId" TEXT NOT NULL, "type" "MovementType" NOT NULL, "fromLocationId" TEXT, "toLocationId" TEXT,
  "fromResponsibleId" TEXT, "toResponsibleId" TEXT, "requestedByUserId" TEXT, "approvedByUserId" TEXT, "executedByUserId" TEXT,
  "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "approvedAt" TIMESTAMP(3), "executedAt" TIMESTAMP(3),
  "reason" TEXT, "conditionNotes" TEXT, "accessories" JSONB, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AssetMovement_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "MaintenanceOrder" (
  "id" TEXT NOT NULL, "assetId" TEXT NOT NULL, "openedByUserId" TEXT, "providerName" TEXT,
  "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "sentAt" TIMESTAMP(3), "returnedAt" TIMESTAMP(3), "closedAt" TIMESTAMP(3),
  "problemDescription" TEXT NOT NULL, "diagnosis" TEXT, "solution" TEXT, "cost" DECIMAL(12,2), "status" "MaintenanceStatus" NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MaintenanceOrder_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "DisposalRequest" (
  "id" TEXT NOT NULL, "assetId" TEXT NOT NULL, "requestedByUserId" TEXT, "approvedByUserId" TEXT,
  "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "approvedAt" TIMESTAMP(3), "disposedAt" TIMESTAMP(3),
  "reason" TEXT NOT NULL, "evidenceUrl" TEXT, "status" "DisposalStatus" NOT NULL DEFAULT 'REQUESTED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DisposalRequest_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ResponsibilityTerm" (
  "id" TEXT NOT NULL, "termNumber" TEXT NOT NULL, "type" "TermType" NOT NULL, "responsibleId" TEXT NOT NULL, "generatedByUserId" TEXT,
  "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "acceptedAt" TIMESTAMP(3), "revokedAt" TIMESTAMP(3),
  "status" "TermStatus" NOT NULL DEFAULT 'DRAFT', "documentUrl" TEXT, "version" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ResponsibilityTerm_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ImportBatch" (
  "id" TEXT NOT NULL, "source" TEXT NOT NULL DEFAULT 'ABSOLUTE', "fileName" TEXT NOT NULL, "fileHash" TEXT NOT NULL, "uploadedByUserId" TEXT,
  "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "processedAt" TIMESTAMP(3), "status" "ImportStatus" NOT NULL DEFAULT 'PENDING',
  "totalRows" INTEGER NOT NULL DEFAULT 0, "successRows" INTEGER NOT NULL DEFAULT 0, "errorRows" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ImportBatch_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ImportRow" (
  "id" TEXT NOT NULL, "importBatchId" TEXT NOT NULL, "rowNumber" INTEGER NOT NULL, "rawData" JSONB NOT NULL, "normalizedData" JSONB,
  "status" "ImportStatus" NOT NULL DEFAULT 'PENDING', "errorMessage" TEXT, "assetId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ImportRow_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "AuditEvent" (
  "id" TEXT NOT NULL, "entityType" TEXT NOT NULL, "entityId" TEXT NOT NULL, "eventType" TEXT NOT NULL, "actorUserId" TEXT,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "ipAddress" TEXT, "userAgent" TEXT, "beforePayload" JSONB, "afterPayload" JSONB, "metadata" JSONB,
  CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "_AssetTerms" ("A" TEXT NOT NULL, "B" TEXT NOT NULL);

-- Indexes
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_personId_key" ON "User"("personId");
CREATE UNIQUE INDEX "Person_document_key" ON "Person"("document");
CREATE UNIQUE INDEX "Person_email_key" ON "Person"("email");
CREATE UNIQUE INDEX "Person_employeeCode_key" ON "Person"("employeeCode");
CREATE UNIQUE INDEX "Location_code_key" ON "Location"("code");
CREATE UNIQUE INDEX "Asset_assetTag_key" ON "Asset"("assetTag");
CREATE UNIQUE INDEX "Asset_serialNumber_key" ON "Asset"("serialNumber");
CREATE UNIQUE INDEX "Asset_hostname_key" ON "Asset"("hostname");
CREATE UNIQUE INDEX "Asset_absoluteDeviceId_key" ON "Asset"("absoluteDeviceId");
CREATE INDEX "AssetAssignment_assetId_endedAt_idx" ON "AssetAssignment"("assetId", "endedAt");
CREATE INDEX "AssetMovement_assetId_executedAt_idx" ON "AssetMovement"("assetId", "executedAt");
CREATE UNIQUE INDEX "ResponsibilityTerm_termNumber_key" ON "ResponsibilityTerm"("termNumber");
CREATE UNIQUE INDEX "ImportBatch_fileHash_key" ON "ImportBatch"("fileHash");
CREATE UNIQUE INDEX "ImportRow_importBatchId_rowNumber_key" ON "ImportRow"("importBatchId", "rowNumber");
CREATE INDEX "AuditEvent_entityType_entityId_idx" ON "AuditEvent"("entityType", "entityId");
CREATE INDEX "AuditEvent_occurredAt_idx" ON "AuditEvent"("occurredAt");
CREATE UNIQUE INDEX "_AssetTerms_AB_unique" ON "_AssetTerms"("A", "B");
CREATE INDEX "_AssetTerms_B_index" ON "_AssetTerms"("B");

-- Foreign keys
ALTER TABLE "User" ADD CONSTRAINT "User_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Person" ADD CONSTRAINT "Person_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Location" ADD CONSTRAINT "Location_parentLocationId_fkey" FOREIGN KEY ("parentLocationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_currentLocationId_fkey" FOREIGN KEY ("currentLocationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_currentResponsibleId_fkey" FOREIGN KEY ("currentResponsibleId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AssetAssignment" ADD CONSTRAINT "AssetAssignment_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AssetAssignment" ADD CONSTRAINT "AssetAssignment_responsibleId_fkey" FOREIGN KEY ("responsibleId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AssetAssignment" ADD CONSTRAINT "AssetAssignment_assignedByUserId_fkey" FOREIGN KEY ("assignedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AssetAssignment" ADD CONSTRAINT "AssetAssignment_responsibilityTermId_fkey" FOREIGN KEY ("responsibilityTermId") REFERENCES "ResponsibilityTerm"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AssetMovement" ADD CONSTRAINT "AssetMovement_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AssetMovement" ADD CONSTRAINT "AssetMovement_fromLocationId_fkey" FOREIGN KEY ("fromLocationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AssetMovement" ADD CONSTRAINT "AssetMovement_toLocationId_fkey" FOREIGN KEY ("toLocationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AssetMovement" ADD CONSTRAINT "AssetMovement_requestedByUserId_fkey" FOREIGN KEY ("requestedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AssetMovement" ADD CONSTRAINT "AssetMovement_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AssetMovement" ADD CONSTRAINT "AssetMovement_executedByUserId_fkey" FOREIGN KEY ("executedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MaintenanceOrder" ADD CONSTRAINT "MaintenanceOrder_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MaintenanceOrder" ADD CONSTRAINT "MaintenanceOrder_openedByUserId_fkey" FOREIGN KEY ("openedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DisposalRequest" ADD CONSTRAINT "DisposalRequest_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DisposalRequest" ADD CONSTRAINT "DisposalRequest_requestedByUserId_fkey" FOREIGN KEY ("requestedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DisposalRequest" ADD CONSTRAINT "DisposalRequest_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ResponsibilityTerm" ADD CONSTRAINT "ResponsibilityTerm_responsibleId_fkey" FOREIGN KEY ("responsibleId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ResponsibilityTerm" ADD CONSTRAINT "ResponsibilityTerm_generatedByUserId_fkey" FOREIGN KEY ("generatedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ImportBatch" ADD CONSTRAINT "ImportBatch_uploadedByUserId_fkey" FOREIGN KEY ("uploadedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ImportRow" ADD CONSTRAINT "ImportRow_importBatchId_fkey" FOREIGN KEY ("importBatchId") REFERENCES "ImportBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ImportRow" ADD CONSTRAINT "ImportRow_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "_AssetTerms" ADD CONSTRAINT "_AssetTerms_A_fkey" FOREIGN KEY ("A") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_AssetTerms" ADD CONSTRAINT "_AssetTerms_B_fkey" FOREIGN KEY ("B") REFERENCES "ResponsibilityTerm"("id") ON DELETE CASCADE ON UPDATE CASCADE;
