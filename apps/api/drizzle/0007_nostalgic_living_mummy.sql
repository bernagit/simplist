CREATE TABLE "user_preferences" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"theme_color" varchar(32) DEFAULT 'pink' NOT NULL,
	"color_scheme" varchar(16) DEFAULT 'auto' NOT NULL,
	"default_view" varchar(255) DEFAULT 'home' NOT NULL,
	"start_of_week" varchar(16) DEFAULT 'monday' NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;