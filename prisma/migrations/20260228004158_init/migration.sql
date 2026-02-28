/*
  Warnings:

  - You are about to drop the `MotocycleArriaval` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "MotocycleArriaval";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "motorcycle_arrival" (
    "id" TEXT NOT NULL,
    "chassi" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "dataChegada" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "motorcycle_arrival_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_id_key" ON "user"("id");

-- CreateIndex
CREATE UNIQUE INDEX "motorcycle_arrival_chassi_key" ON "motorcycle_arrival"("chassi");
