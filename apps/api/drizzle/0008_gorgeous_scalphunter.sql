ALTER TABLE "tasks" ALTER COLUMN "due_date" SET DATA TYPE date;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "due_time" time;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "duration_minutes" integer;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "recurrence_rule" text;