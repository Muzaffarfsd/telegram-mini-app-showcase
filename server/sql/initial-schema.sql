CREATE TABLE "analytics_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_type" varchar(50) NOT NULL,
	"event_name" varchar(255) NOT NULL,
	"telegram_id" bigint,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"telegram_id" bigint NOT NULL,
	"task_id" varchar(100) NOT NULL,
	"task_name" varchar(255) NOT NULL,
	"description" text,
	"xp_reward" integer DEFAULT 0 NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"max_progress" integer DEFAULT 1 NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"task_date" date DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "daily_tasks_telegram_id_task_id_task_date_unique" UNIQUE("telegram_id","task_id","task_date")
);
--> statement-breakpoint
CREATE TABLE "gamification_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"telegram_id" bigint NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"xp" integer DEFAULT 0 NOT NULL,
	"xp_to_next_level" integer DEFAULT 100 NOT NULL,
	"total_xp" integer DEFAULT 0 NOT NULL,
	"current_streak" integer DEFAULT 1 NOT NULL,
	"best_streak" integer DEFAULT 1 NOT NULL,
	"last_visit_date" date DEFAULT now() NOT NULL,
	"completed_tasks" integer DEFAULT 0 NOT NULL,
	"achievements" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "gamification_stats_telegram_id_unique" UNIQUE("telegram_id")
);
--> statement-breakpoint
CREATE TABLE "photos" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"object_path" varchar(500) NOT NULL,
	"thumbnail_path" varchar(500),
	"uploaded_at" timestamp DEFAULT now() NOT NULL,
	"user_id" varchar(100)
);
--> statement-breakpoint
CREATE TABLE "referrals" (
	"id" serial PRIMARY KEY NOT NULL,
	"referrer_telegram_id" bigint NOT NULL,
	"referred_telegram_id" bigint NOT NULL,
	"bonus_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"company" varchar(200),
	"logo_url" varchar(500),
	"rating" integer DEFAULT 5 NOT NULL,
	"text" text NOT NULL,
	"location" varchar(100),
	"telegram_id" bigint,
	"is_approved" boolean DEFAULT false NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "story_reactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"story_id" integer NOT NULL,
	"telegram_id" bigint NOT NULL,
	"reaction_type" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "story_reactions_story_id_telegram_id_reaction_type_unique" UNIQUE("story_id","telegram_id","reaction_type")
);
--> statement-breakpoint
CREATE TABLE "tasks_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"telegram_id" bigint NOT NULL,
	"task_id" varchar(100) NOT NULL,
	"platform" varchar(50) NOT NULL,
	"task_type" varchar(50) NOT NULL,
	"coins_reward" integer NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"verification_status" varchar(50) DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_attempt_at" timestamp,
	"started_at" timestamp,
	"completed_at" timestamp,
	"verification_data" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tasks_progress_telegram_id_task_id_unique" UNIQUE("telegram_id","task_id")
);
--> statement-breakpoint
CREATE TABLE "user_coins_balance" (
	"id" serial PRIMARY KEY NOT NULL,
	"telegram_id" bigint NOT NULL,
	"total_coins" integer DEFAULT 0 NOT NULL,
	"available_coins" integer DEFAULT 0 NOT NULL,
	"spent_coins" integer DEFAULT 0 NOT NULL,
	"tasks_completed" integer DEFAULT 0 NOT NULL,
	"current_streak" integer DEFAULT 0 NOT NULL,
	"last_activity_date" date,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_coins_balance_telegram_id_unique" UNIQUE("telegram_id")
);
--> statement-breakpoint
CREATE TABLE "user_stories" (
	"id" serial PRIMARY KEY NOT NULL,
	"telegram_id" bigint NOT NULL,
	"title" varchar(100) NOT NULL,
	"description" text,
	"media_type" varchar(20) DEFAULT 'image' NOT NULL,
	"media_url" varchar(500) NOT NULL,
	"thumbnail_url" varchar(500),
	"category" varchar(50) DEFAULT 'my-business',
	"hashtags" text[] DEFAULT '{}',
	"linked_demo_id" varchar(100),
	"location" varchar(100),
	"view_count" integer DEFAULT 0 NOT NULL,
	"likes_count" integer DEFAULT 0 NOT NULL,
	"fire_count" integer DEFAULT 0 NOT NULL,
	"clap_count" integer DEFAULT 0 NOT NULL,
	"heart_eyes_count" integer DEFAULT 0 NOT NULL,
	"rocket_count" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_approved" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"telegram_id" bigint NOT NULL,
	"username" varchar(255),
	"first_name" varchar(255),
	"last_name" varchar(255),
	"referral_code" varchar(50) NOT NULL,
	"referred_by_code" varchar(50),
	"total_referrals" integer DEFAULT 0 NOT NULL,
	"active_referrals" integer DEFAULT 0 NOT NULL,
	"total_earnings" numeric(10, 2) DEFAULT '0' NOT NULL,
	"pending_rewards" numeric(10, 2) DEFAULT '0' NOT NULL,
	"tier" varchar(50) DEFAULT 'Bronze' NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"xp" integer DEFAULT 0 NOT NULL,
	"xp_to_next_level" integer DEFAULT 100 NOT NULL,
	"total_xp" integer DEFAULT 0 NOT NULL,
	"current_streak" integer DEFAULT 1 NOT NULL,
	"best_streak" integer DEFAULT 1 NOT NULL,
	"last_visit_date" date DEFAULT now() NOT NULL,
	"completed_tasks" integer DEFAULT 0 NOT NULL,
	"achievements" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"total_coins" integer DEFAULT 0 NOT NULL,
	"available_coins" integer DEFAULT 0 NOT NULL,
	"spent_coins" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_telegram_id_unique" UNIQUE("telegram_id"),
	CONSTRAINT "users_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
ALTER TABLE "daily_tasks" ADD CONSTRAINT "daily_tasks_telegram_id_users_telegram_id_fk" FOREIGN KEY ("telegram_id") REFERENCES "public"."users"("telegram_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrer_telegram_id_users_telegram_id_fk" FOREIGN KEY ("referrer_telegram_id") REFERENCES "public"."users"("telegram_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referred_telegram_id_users_telegram_id_fk" FOREIGN KEY ("referred_telegram_id") REFERENCES "public"."users"("telegram_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "story_reactions" ADD CONSTRAINT "story_reactions_story_id_user_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."user_stories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks_progress" ADD CONSTRAINT "tasks_progress_telegram_id_users_telegram_id_fk" FOREIGN KEY ("telegram_id") REFERENCES "public"."users"("telegram_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_stories" ADD CONSTRAINT "user_stories_telegram_id_users_telegram_id_fk" FOREIGN KEY ("telegram_id") REFERENCES "public"."users"("telegram_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_analytics_events_type" ON "analytics_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "idx_analytics_events_name" ON "analytics_events" USING btree ("event_name");--> statement-breakpoint
CREATE INDEX "idx_analytics_events_telegram_id" ON "analytics_events" USING btree ("telegram_id");--> statement-breakpoint
CREATE INDEX "idx_analytics_events_created_at" ON "analytics_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_daily_tasks_telegram_id" ON "daily_tasks" USING btree ("telegram_id");--> statement-breakpoint
CREATE INDEX "idx_daily_tasks_task_id" ON "daily_tasks" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "idx_daily_tasks_completed" ON "daily_tasks" USING btree ("completed");--> statement-breakpoint
CREATE INDEX "idx_daily_tasks_task_date" ON "daily_tasks" USING btree ("task_date");--> statement-breakpoint
CREATE INDEX "idx_gamification_stats_telegram_id" ON "gamification_stats" USING btree ("telegram_id");--> statement-breakpoint
CREATE INDEX "idx_photos_user_id" ON "photos" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_photos_uploaded_at" ON "photos" USING btree ("uploaded_at");--> statement-breakpoint
CREATE INDEX "idx_referrals_referrer_id" ON "referrals" USING btree ("referrer_telegram_id");--> statement-breakpoint
CREATE INDEX "idx_referrals_referred_id" ON "referrals" USING btree ("referred_telegram_id");--> statement-breakpoint
CREATE INDEX "idx_referrals_status" ON "referrals" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_referrals_created_at" ON "referrals" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_reviews_is_approved" ON "reviews" USING btree ("is_approved");--> statement-breakpoint
CREATE INDEX "idx_reviews_is_featured" ON "reviews" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "idx_reviews_rating" ON "reviews" USING btree ("rating");--> statement-breakpoint
CREATE INDEX "idx_reviews_created_at" ON "reviews" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_story_reactions_story_id" ON "story_reactions" USING btree ("story_id");--> statement-breakpoint
CREATE INDEX "idx_story_reactions_telegram_id" ON "story_reactions" USING btree ("telegram_id");--> statement-breakpoint
CREATE INDEX "idx_tasks_progress_telegram_id" ON "tasks_progress" USING btree ("telegram_id");--> statement-breakpoint
CREATE INDEX "idx_tasks_progress_task_id" ON "tasks_progress" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "idx_tasks_progress_completed" ON "tasks_progress" USING btree ("completed");--> statement-breakpoint
CREATE INDEX "idx_tasks_progress_verification_status" ON "tasks_progress" USING btree ("verification_status");--> statement-breakpoint
CREATE INDEX "idx_tasks_progress_created_at" ON "tasks_progress" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_user_coins_balance_telegram_id" ON "user_coins_balance" USING btree ("telegram_id");--> statement-breakpoint
CREATE INDEX "idx_user_stories_telegram_id" ON "user_stories" USING btree ("telegram_id");--> statement-breakpoint
CREATE INDEX "idx_user_stories_is_active" ON "user_stories" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_user_stories_is_approved" ON "user_stories" USING btree ("is_approved");--> statement-breakpoint
CREATE INDEX "idx_user_stories_category" ON "user_stories" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_user_stories_created_at" ON "user_stories" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_user_stories_linked_demo" ON "user_stories" USING btree ("linked_demo_id");--> statement-breakpoint
CREATE INDEX "idx_users_telegram_id" ON "users" USING btree ("telegram_id");--> statement-breakpoint
CREATE INDEX "idx_users_referral_code" ON "users" USING btree ("referral_code");--> statement-breakpoint
CREATE INDEX "idx_users_level" ON "users" USING btree ("level");--> statement-breakpoint
CREATE INDEX "idx_users_last_visit" ON "users" USING btree ("last_visit_date");--> statement-breakpoint
CREATE INDEX "idx_users_created_at" ON "users" USING btree ("created_at");