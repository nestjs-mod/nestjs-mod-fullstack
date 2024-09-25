DO $$
BEGIN
    CREATE TYPE "WebhookRole" AS enum(
        'Admin',
        'User'
);
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END
$$;

DO $$
BEGIN
    CREATE TYPE "WebhookStatus" AS enum(
        'Pending',
        'Process',
        'Success',
        'Error',
        'Timeout'
);
EXCEPTION
    WHEN duplicate_object THEN
        NULL;
END
$$;

CREATE TABLE IF NOT EXISTS "WebhookUser"(
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "externalTenantId" uuid NOT NULL,
    "externalUserId" uuid NOT NULL,
    "userRole" "WebhookRole" NOT NULL,
    "createdAt" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PK_WEBHOOK_USER" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "UQ_WEBHOOK_USER" ON "WebhookUser"("externalTenantId", "externalUserId");

CREATE INDEX IF NOT EXISTS "IDX_WEBHOOK_USER__EXTERNAL_TENANT_ID" ON "WebhookUser"("externalTenantId");

CREATE INDEX IF NOT EXISTS "IDX_WEBHOOK_USER__USER_ROLE" ON "WebhookUser"("externalTenantId", "userRole");

CREATE TABLE IF NOT EXISTS "Webhook"(
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "eventName" varchar(512) NOT NULL,
    "endpoint" varchar(512) NOT NULL,
    "enabled" boolean NOT NULL,
    "headers" jsonb,
    "requestTimeout" int,
    "externalTenantId" uuid NOT NULL,
    "createdBy" uuid NOT NULL CONSTRAINT "FK_WEBHOOK__CREATED_BY" REFERENCES "WebhookUser",
    "updatedBy" uuid NOT NULL CONSTRAINT "FK_WEBHOOK__UPDATED_BY" REFERENCES "WebhookUser",
    "createdAt" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PK_WEBHOOK" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_WEBHOOK__EXTERNAL_TENANT_ID" ON "Webhook"("externalTenantId");

CREATE INDEX IF NOT EXISTS "IDX_WEBHOOK__ENABLED" ON "Webhook"("externalTenantId", "enabled");

CREATE INDEX IF NOT EXISTS "IDX_WEBHOOK__EVENT_NAME" ON "Webhook"("externalTenantId", "eventName");

CREATE TABLE IF NOT EXISTS "WebhookLog"(
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "request" jsonb NOT NULL,
    "responseStatus" varchar(20) NOT NULL,
    "response" jsonb,
    "webhookStatus" "WebhookStatus" NOT NULL,
    "webhookId" uuid NOT NULL CONSTRAINT "FK_WEBHOOK__WEBHOOK_ID" REFERENCES "Webhook",
    "externalTenantId" uuid NOT NULL,
    "createdAt" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PK_WEBHOOK_LOG" PRIMARY KEY ("id")
);

CREATE INDEX "IDX_WEBHOOK_LOG__EXTERNAL_TENANT_ID" ON "WebhookLog"("externalTenantId");

CREATE INDEX "IDX_WEBHOOK_LOG__WEBHOOK_ID" ON "WebhookLog"("externalTenantId", "webhookId");

CREATE INDEX "IDX_WEBHOOK_LOG__WEBHOOK_STATUS" ON "WebhookLog"("externalTenantId", "webhookStatus");

