-- AlterTable
ALTER TABLE "Car" ADD COLUMN "analysisSuggestions" TEXT;
ALTER TABLE "Car" ADD COLUMN "healthScore" INTEGER;
ALTER TABLE "Car" ADD COLUMN "lastAnalyzedAt" DATETIME;
ALTER TABLE "Car" ADD COLUMN "suggestedPriceMax" REAL;
ALTER TABLE "Car" ADD COLUMN "suggestedPriceMin" REAL;
