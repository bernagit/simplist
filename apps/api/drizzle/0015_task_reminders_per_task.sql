ALTER TABLE "tasks" ADD COLUMN "reminder_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "reminder_lead_minutes" integer;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "reminder_time" time;--> statement-breakpoint
CREATE INDEX "tasks_reminder_due_date_idx" ON "tasks" USING btree ("due_date") WHERE "tasks"."completed" = false and "tasks"."reminder_enabled" = true;