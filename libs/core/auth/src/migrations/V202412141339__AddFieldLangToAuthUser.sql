DO $$
BEGIN
    ALTER TABLE "AuthUser"
        ADD "lang" varchar(2);
EXCEPTION
    WHEN duplicate_column THEN
        NULL;
END
$$;