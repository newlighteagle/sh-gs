-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMINISTRATOR', 'USER', 'PUBLIC');

-- CreateEnum
CREATE TYPE "PermissionDomain" AS ENUM ('MENU', 'MODULE', 'DATA');

-- CreateTable
CREATE TABLE "AppUser" (
    "id" TEXT NOT NULL,
    "username" TEXT,
    "fullname" TEXT,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "group" TEXT,
    "region" TEXT,

    CONSTRAINT "AppUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPermission" (
    "id" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "domain" "PermissionDomain" NOT NULL,
    "resource" TEXT NOT NULL,
    "allow" BOOLEAN NOT NULL DEFAULT true,
    "group" TEXT,
    "region" TEXT,

    CONSTRAINT "UserPermission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AppUser_email_key" ON "AppUser"("email");

-- CreateIndex
CREATE INDEX "AppUser_email_idx" ON "AppUser"("email");

-- CreateIndex
CREATE INDEX "UserPermission_userEmail_domain_idx" ON "UserPermission"("userEmail", "domain");

-- CreateIndex
CREATE UNIQUE INDEX "UserPermission_userEmail_domain_resource_group_region_key" ON "UserPermission"("userEmail", "domain", "resource", "group", "region");

-- AddForeignKey
ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "AppUser"("email") ON DELETE CASCADE ON UPDATE CASCADE;
