DO $$
BEGIN
    ALTER TABLE "Webhook"
        ADD "workUntilDate" timestamp(6);
EXCEPTION
    WHEN duplicate_column THEN
        NULL;
END
$$;

