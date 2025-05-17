CREATE TABLE IF NOT EXISTS "AppDemo"(
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    "name" varchar(128) NOT NULL,
    "createdAt" timestamp DEFAULT "now"() NOT NULL,
    "updatedAt" timestamp DEFAULT "now"() NOT NULL,
    CONSTRAINT "PK_APP_DEMO" PRIMARY KEY (id)
);

CREATE UNIQUE INDEX IF NOT EXISTS "UQ_APP_DEMO" ON "AppDemo"("name");