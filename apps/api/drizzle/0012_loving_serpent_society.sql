-- 1. Change column types to varchar(255)
ALTER TABLE "sections" ALTER COLUMN "order" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "order" SET DATA TYPE varchar(255);--> statement-breakpoint

-- 2. Convert existing numeric section orders into valid LexoRank strings
-- Groups by list_id and assigns incremental LexoRank formatted strings ordered by old numeric values
WITH ranked_sections AS (
  SELECT 
    id,
    '0|i' || lpad(to_hex(ROW_NUMBER() OVER (PARTITION BY list_id ORDER BY CAST("order" AS integer)) * 1024), 5, '0') || ':' as new_order
  FROM "sections"
)
UPDATE "sections"
SET "order" = ranked_sections.new_order
FROM ranked_sections
WHERE "sections".id = ranked_sections.id;--> statement-breakpoint

-- 3. Convert existing numeric task orders into valid LexoRank strings
-- Groups by section_id and assigns incremental LexoRank formatted strings ordered by old numeric values
WITH ranked_tasks AS (
  SELECT 
    id,
    '0|i' || lpad(to_hex(ROW_NUMBER() OVER (PARTITION BY section_id ORDER BY CAST("order" AS integer)) * 1024), 5, '0') || ':' as new_order
  FROM "tasks"
)
UPDATE "tasks"
SET "order" = ranked_tasks.new_order
FROM ranked_tasks
WHERE "tasks".id = ranked_tasks.id;--> statement-breakpoint

-- 4. Set standard LexoRank middle value as default for future rows
ALTER TABLE "sections" ALTER COLUMN "order" SET DEFAULT '0|i00000:';--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "order" SET DEFAULT '0|i00000:';