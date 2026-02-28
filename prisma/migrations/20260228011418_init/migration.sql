/*
  Warnings:

  - Added the required column `criadoEm` to the `motorcycle_arrival` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "motorcycle_arrival" ADD COLUMN     "criadoEm" TIMESTAMP(3) NOT NULL;
