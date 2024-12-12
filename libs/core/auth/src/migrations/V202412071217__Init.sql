DO $$
BEGIN
    CREATE TYPE "AuthRole" AS enum(
        'Admin',
        'User'
);
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END
$$;

CREATE TABLE IF NOT EXISTS "AuthUser"(
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "externalUserId" uuid NOT NULL,
    "userRole" "AuthRole" NOT NULL,
    "timezone" double precision,
    "createdAt" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PK_AUTH_USER" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "UQ_AUTH_USER" ON "AuthUser"("externalUserId");

CREATE INDEX IF NOT EXISTS "IDX_AUTH_USER__USER_ROLE" ON "AuthUser"("userRole");

