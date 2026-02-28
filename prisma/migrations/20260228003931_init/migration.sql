-- CreateTable
CREATE TABLE "MotocycleArriaval" (
    "id" TEXT NOT NULL,
    "chassi" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "dataChegada" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MotocycleArriaval_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MotocycleArriaval_chassi_key" ON "MotocycleArriaval"("chassi");
