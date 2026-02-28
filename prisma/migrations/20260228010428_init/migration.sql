/*
  Warnings:

  - You are about to drop the column `model` on the `motorcycle_arrival` table. All the data in the column will be lost.
  - Added the required column `modelo` to the `motorcycle_arrival` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "motorcycle_arrival" DROP COLUMN "model",
ADD COLUMN     "modelo" TEXT NOT NULL;
