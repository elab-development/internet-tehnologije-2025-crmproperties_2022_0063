/*
  Warnings:

  - A unique constraint covering the columns `[clientId,propertyId]` on the table `ClientPropertyInterest` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ClientPropertyInterest_clientId_propertyId_key" ON "ClientPropertyInterest"("clientId", "propertyId");
