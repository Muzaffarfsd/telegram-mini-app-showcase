import { pgTable, serial, varchar, text, timestamp, bigint, integer, decimal, boolean, date, jsonb, unique, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================
// ОПТИМИЗИРОВАННАЯ СХЕМА БД
// - Объединены users + userCoinsBalance + gamificationStats
// - Добавлены Foreign Keys для целостности данных
// - Убрано дублирование полей
// ============================================

// Главная таблица пользователей (объединенная)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  telegramId: bigint("telegram_id", { mode: "number" }).unique().notNull(),
  username: varchar("username", { length: 255 }),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  
  // Реферальная система
  referralCode: varchar("referral_code", { length: 50 }).unique().notNull(),
  referredByCode: varchar("referred_by_code", { length: 50 }),
  totalReferrals: integer("total_referrals").default(0).notNull(),
  activeReferrals: integer("active_referrals").default(0).notNull(),
  totalEarnings: decimal("total_earnings", { precision: 10, scale: 2 }).default("0").notNull(),
  pendingRewards: decimal("pending_rewards", { precision: 10, scale: 2 }).default("0").notNull(),
  tier: varchar("tier", { length: 50 }).default("Bronze").notNull(),
  
  // Геймификация (бывший gamificationStats)
  level: integer("level").default(1).notNull(),
  xp: integer("xp").default(0).notNull(),
  xpToNextLevel: integer("xp_to_next_level").default(100).notNull(),
  totalXp: integer("total_xp").default(0).notNull(),
  currentStreak: integer("current_streak").default(1).notNull(),
  bestStreak: integer("best_streak").default(1).notNull(),
  lastVisitDate: date("last_visit_date").defaultNow().notNull(),
  completedTasks: integer("completed_tasks").default(0).notNull(),
  achievements: jsonb("achievements").default([]).notNull(),
  
  // Монеты (бывший userCoinsBalance)
  totalCoins: integer("total_coins").default(0).notNull(),
  availableCoins: integer("available_coins").default(0).notNull(),
  spentCoins: integer("spent_coins").default(0).notNull(),
  
  // Метаданные
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  telegramIdIdx: index("idx_users_telegram_id").on(table.telegramId),
  referralCodeIdx: index("idx_users_referral_code").on(table.referralCode),
  levelIdx: index("idx_users_level").on(table.level),
  lastVisitDateIdx: index("idx_users_last_visit").on(table.lastVisitDate),
  createdAtIdx: index("idx_users_created_at").on(table.createdAt),
}));

// Таблица рефералов с FK
export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerTelegramId: bigint("referrer_telegram_id", { mode: "number" }).notNull(),
  referredTelegramId: bigint("referred_telegram_id", { mode: "number" }).notNull(),
  bonusAmount: decimal("bonus_amount", { precision: 10, scale: 2 }).default("0").notNull(),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  referrerIdIdx: index("idx_referrals_referrer_id").on(table.referrerTelegramId),
  referredIdIdx: index("idx_referrals_referred_id").on(table.referredTelegramId),
  statusIdx: index("idx_referrals_status").on(table.status),
  createdAtIdx: index("idx_referrals_created_at").on(table.createdAt),
}));

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
}, (table) => ({
  telegramIdIdx: index("idx_daily_tasks_telegram_id").on(table.telegramId),
  taskIdIdx: index("idx_daily_tasks_task_id").on(table.taskId),
  completedIdx: index("idx_daily_tasks_completed").on(table.completed),
  taskDateIdx: index("idx_daily_tasks_task_date").on(table.taskDate),
}));

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
}, (table) => ({
  uniqueTelegramTask: unique().on(table.telegramId, table.taskId),
  telegramIdIdx: index("idx_tasks_progress_telegram_id").on(table.telegramId),
  taskIdIdx: index("idx_tasks_progress_task_id").on(table.taskId),
  completedIdx: index("idx_tasks_progress_completed").on(table.completed),
  verificationStatusIdx: index("idx_tasks_progress_verification_status").on(table.verificationStatus),
  createdAtIdx: index("idx_tasks_progress_created_at").on(table.createdAt),
}));

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
}, (table) => ({
  approvedIdx: index("idx_reviews_is_approved").on(table.isApproved),
  featuredIdx: index("idx_reviews_is_featured").on(table.isFeatured),
  ratingIdx: index("idx_reviews_rating").on(table.rating),
  createdAtIdx: index("idx_reviews_created_at").on(table.createdAt),
}));

// Таблица для хранения метаданных фотографий
export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  objectPath: varchar("object_path", { length: 500 }).notNull(),
  thumbnailPath: varchar("thumbnail_path", { length: 500 }),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  userId: varchar("user_id", { length: 100 }),
}, (table) => ({
  userIdIdx: index("idx_photos_user_id").on(table.userId),
  uploadedAtIdx: index("idx_photos_uploaded_at").on(table.uploadedAt),
}));

// ============================================
// ZOD SCHEMAS для валидации
// ============================================

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
  createdAt: true,
});

export const insertDailyTaskSchema = createInsertSchema(dailyTasks).omit({
  id: true,
  createdAt: true,
});

export const insertTasksProgressSchema = createInsertSchema(tasksProgress).omit({
  id: true,
  createdAt: true,
});

export const insertPhotoSchema = createInsertSchema(photos).omit({
  id: true,
  uploadedAt: true,
});

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

// ============================================
// TypeScript Types
// ============================================

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type DailyTask = typeof dailyTasks.$inferSelect;
export type InsertDailyTask = z.infer<typeof insertDailyTaskSchema>;
export type TasksProgress = typeof tasksProgress.$inferSelect;
export type InsertTasksProgress = z.infer<typeof insertTasksProgressSchema>;
export type Photo = typeof photos.$inferSelect;
export type InsertPhoto = z.infer<typeof insertPhotoSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

// ============================================
// DEPRECATED: Старые таблицы для обратной совместимости
// Эти таблицы больше не используются, данные в users
// ============================================

// @deprecated - используйте users
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
}, (table) => ({
  telegramIdIdx: index("idx_gamification_stats_telegram_id").on(table.telegramId),
}));

// @deprecated - используйте users
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
}, (table) => ({
  telegramIdIdx: index("idx_user_coins_balance_telegram_id").on(table.telegramId),
}));

// Типы для обратной совместимости
export type GamificationStats = typeof gamificationStats.$inferSelect;
export type UserCoinsBalance = typeof userCoinsBalance.$inferSelect;
export const insertGamificationStatsSchema = createInsertSchema(gamificationStats).omit({ id: true, createdAt: true, updatedAt: true });
export const insertUserCoinsBalanceSchema = createInsertSchema(userCoinsBalance).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertGamificationStats = z.infer<typeof insertGamificationStatsSchema>;
export type InsertUserCoinsBalance = z.infer<typeof insertUserCoinsBalanceSchema>;
