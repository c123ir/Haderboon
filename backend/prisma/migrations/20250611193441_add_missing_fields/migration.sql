-- AlterTable
ALTER TABLE "ai_api_keys" ADD COLUMN     "expiresAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ai_models" ADD COLUMN     "capabilities" TEXT[] DEFAULT ARRAY[]::TEXT[];
