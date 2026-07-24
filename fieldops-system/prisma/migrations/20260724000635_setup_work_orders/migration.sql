/*
  Warnings:

  - Added the required column `updatedAt` to the `flx_users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "flx_users" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "webhooks" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhooks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "flx_checklist_items_workOrderId_idx" ON "flx_checklist_items"("workOrderId");

-- CreateIndex
CREATE INDEX "flx_users_teamId_idx" ON "flx_users"("teamId");

-- CreateIndex
CREATE INDEX "flx_work_order_events_workOrderId_idx" ON "flx_work_order_events"("workOrderId");

-- CreateIndex
CREATE INDEX "flx_work_order_events_actorId_idx" ON "flx_work_order_events"("actorId");

-- CreateIndex
CREATE INDEX "flx_work_orders_status_idx" ON "flx_work_orders"("status");

-- CreateIndex
CREATE INDEX "flx_work_orders_assigneeId_idx" ON "flx_work_orders"("assigneeId");

-- CreateIndex
CREATE INDEX "flx_work_orders_teamId_idx" ON "flx_work_orders"("teamId");
