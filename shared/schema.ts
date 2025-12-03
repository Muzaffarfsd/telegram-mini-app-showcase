// Схема БД для хранения метаданных фотографий
import { pgTable, serial, varchar, text, timestamp, bigint, integer, decimal, boolean, date, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Таблица для хранения метаданных фотографий
export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  objectPath: varchar("object_path", { length: 500 }).notNull(), // Путь к фото в Object Storage
  thumbnailPath: varchar("thumbnail_path", { length: 500 }), // Опционально: путь к миниатюре
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  userId: varchar("user_id", { length: 100 }), // ID пользователя из Telegram (опционально)
});

// Zod schemas для валидации
export const insertPhotoSchema = createInsertSchema(photos).omit({
  id: true,
  uploadedAt: true,
});

export const selectPhotoSchema = createInsertSchema(photos);

// TypeScript типы
export type Photo = typeof photos.$inferSelect;
export type InsertPhoto = z.infer<typeof insertPhotoSchema>;

// Таблица пользователей
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  telegramId: bigint("telegram_id", { mode: "number" }).unique().notNull(),
  username: varchar("username", { length: 255 }),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  referralCode: varchar("referral_code", { length: 50 }).unique().notNull(),
  referredByCode: varchar("referred_by_code", { length: 50 }),
  totalReferrals: integer("total_referrals").default(0).notNull(),
  activeReferrals: integer("active_referrals").default(0).notNull(),
  totalEarnings: decimal("total_earnings", { precision: 10, scale: 2 }).default("0").notNull(),
  pendingRewards: decimal("pending_rewards", { precision: 10, scale: 2 }).default("0").notNull(),
  tier: varchar("tier", { length: 50 }).default("Bronze").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Таблица рефералов
export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerTelegramId: bigint("referrer_telegram_id", { mode: "number" }).notNull(),
  referredTelegramId: bigint("referred_telegram_id", { mode: "number" }).notNull(),
  bonusAmount: decimal("bonus_amount", { precision: 10, scale: 2 }).default("0").notNull(),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Таблица статистики геймификации
export const gamificationStats = pgTable("gamification_stats", {
  id: serial("id").primaryKey(),
  telegramId: bigint("telegram_id", { mode: "number" }).unique().notNull(),
  level: integer("level").default(1).notNull(),
  xp: integer("xp").default(0).notNull(),
  xpToNextLevel: integer("xp_to_next_level").default(100).notNull(),
  totalXp: integer("total_xp").default(0).notNull(),
  currentStreak: integer("current_streak").default(1).notNull(),
  bestStreak: integer("best_streak").default(1).notNull(),
  lastVisitDate: date("last_visit_date").defaultNow().notNull(),
  completedTasks: integer("completed_tasks").default(0).notNull(),
  achievements: jsonb("achievements").default([]).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Таблица ежедневных задач
export const dailyTasks = pgTable("daily_tasks", {
  id: serial("id").primaryKey(),
  telegramId: bigint("telegram_id", { mode: "number" }).notNull(),
  taskId: varchar("task_id", { length: 100 }).notNull(),
  taskName: varchar("task_name", { length: 255 }).notNull(),
  description: text("description"),
  xpReward: integer("xp_reward").default(0).notNull(),
  progress: integer("progress").default(0).notNull(),
  maxProgress: integer("max_progress").default(1).notNull(),
  completed: boolean("completed").default(false).notNull(),
  taskDate: date("task_date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
  createdAt: true,
});

export const insertGamificationStatsSchema = createInsertSchema(gamificationStats).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDailyTaskSchema = createInsertSchema(dailyTasks).omit({
  id: true,
  createdAt: true,
});

// Таблица прогресса выполнения заданий
export const tasksProgress = pgTable("tasks_progress", {
  id: serial("id").primaryKey(),
  telegramId: bigint("telegram_id", { mode: "number" }).notNull(),
  taskId: varchar("task_id", { length: 100 }).notNull(),
  platform: varchar("platform", { length: 50 }).notNull(),
  taskType: varchar("task_type", { length: 50 }).notNull(),
  coinsReward: integer("coins_reward").notNull(),
  completed: boolean("completed").default(false).notNull(),
  verificationStatus: varchar("verification_status", { length: 50 }).default("pending").notNull(),
  attempts: integer("attempts").default(0).notNull(),
  lastAttemptAt: timestamp("last_attempt_at"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  verificationData: jsonb("verification_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Таблица баланса монет пользователей
export const userCoinsBalance = pgTable("user_coins_balance", {
  id: serial("id").primaryKey(),
  telegramId: bigint("telegram_id", { mode: "number" }).unique().notNull(),
  totalCoins: integer("total_coins").default(0).notNull(),
  availableCoins: integer("available_coins").default(0).notNull(),
  spentCoins: integer("spent_coins").default(0).notNull(),
  tasksCompleted: integer("tasks_completed").default(0).notNull(),
  currentStreak: integer("current_streak").default(0).notNull(),
  lastActivityDate: date("last_activity_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Zod schemas
export const insertTasksProgressSchema = createInsertSchema(tasksProgress).omit({
  id: true,
  createdAt: true,
});

export const insertUserCoinsBalanceSchema = createInsertSchema(userCoinsBalance).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// TypeScript types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type GamificationStats = typeof gamificationStats.$inferSelect;
export type InsertGamificationStats = z.infer<typeof insertGamificationStatsSchema>;
export type DailyTask = typeof dailyTasks.$inferSelect;
export type InsertDailyTask = z.infer<typeof insertDailyTaskSchema>;
export type TasksProgress = typeof tasksProgress.$inferSelect;
export type InsertTasksProgress = z.infer<typeof insertTasksProgressSchema>;
export type UserCoinsBalance = typeof userCoinsBalance.$inferSelect;
export type InsertUserCoinsBalance = z.infer<typeof insertUserCoinsBalanceSchema>;

// Таблица отзывов клиентов
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  company: varchar("company", { length: 200 }),
  logoUrl: varchar("logo_url", { length: 500 }),
  rating: integer("rating").notNull().default(5),
  text: text("text").notNull(),
  location: varchar("location", { length: 100 }),
  telegramId: bigint("telegram_id", { mode: "number" }),
  isApproved: boolean("is_approved").default(false).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Zod schema для отзывов
export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  isApproved: true,
  isFeatured: true,
}).extend({
  rating: z.number().min(1).max(5),
  text: z.string().min(10).max(500),
  name: z.string().min(2).max(100),
});

// TypeScript types
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
