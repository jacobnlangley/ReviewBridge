-- Enable RLS on tables exposed via the public schema.
ALTER TABLE IF EXISTS "public"."_prisma_migrations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."Business" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."Location" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."Feedback" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."NotificationEvent" ENABLE ROW LEVEL SECURITY;
