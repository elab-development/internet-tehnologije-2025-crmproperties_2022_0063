-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "description" TEXT,
ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "type" TEXT;

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "city" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "Deal" ADD COLUMN     "closeDate" TIMESTAMP(3),
ADD COLUMN     "expectedValue" DOUBLE PRECISION,
ADD COLUMN     "stage" TEXT;

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "address" TEXT,
ADD COLUMN     "bedrooms" INTEGER,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "price" DOUBLE PRECISION,
ADD COLUMN     "type" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phone" TEXT,
ADD COLUMN     "role" TEXT;
