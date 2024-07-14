-- CreateEnum
CREATE TYPE "user_status" AS ENUM ('active', 'inactive');

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(99) NOT NULL,
    "email" VARCHAR(99) NOT NULL,
    "status" "user_status" NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);
