import { type User, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";

// Storage interface for CRUD operations
// Using unified users table with gamification and coins data

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByTelegramId(telegramId: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByReferralCode(referralCode: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(telegramId: number, data: Partial<InsertUser>): Promise<User | undefined>;
  
  // Gamification helpers (now part of users table)
  updateUserCoins(telegramId: number, coins: { total?: number; available?: number; spent?: number }): Promise<void>;
  updateUserXP(telegramId: number, xp: { current?: number; total?: number; level?: number }): Promise<void>;
  updateUserStreak(telegramId: number, streak: { current?: number; best?: number }): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;

  constructor() {
    this.users = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByTelegramId(telegramId: number): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.telegramId === telegramId,
    );
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByReferralCode(referralCode: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.referralCode === referralCode,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.users.size + 1;
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    const user: User = {
      id,
      telegramId: insertUser.telegramId,
      username: insertUser.username || null,
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      referralCode: insertUser.referralCode,
      referredByCode: insertUser.referredByCode || null,
      totalReferrals: insertUser.totalReferrals || 0,
      activeReferrals: insertUser.activeReferrals || 0,
      totalEarnings: insertUser.totalEarnings || "0",
      pendingRewards: insertUser.pendingRewards || "0",
      tier: insertUser.tier || "Bronze",
      level: insertUser.level || 1,
      xp: insertUser.xp || 0,
      xpToNextLevel: insertUser.xpToNextLevel || 100,
      totalXp: insertUser.totalXp || 0,
      currentStreak: insertUser.currentStreak || 1,
      bestStreak: insertUser.bestStreak || 1,
      lastVisitDate: today,
      completedTasks: insertUser.completedTasks || 0,
      achievements: insertUser.achievements || [],
      totalCoins: insertUser.totalCoins || 0,
      availableCoins: insertUser.availableCoins || 0,
      spentCoins: insertUser.spentCoins || 0,
      createdAt: now,
      updatedAt: now,
    };
    
    this.users.set(String(id), user);
    return user;
  }

  async updateUser(telegramId: number, data: Partial<InsertUser>): Promise<User | undefined> {
    const user = await this.getUserByTelegramId(telegramId);
    if (!user) return undefined;

    const updatedUser: User = {
      ...user,
      ...data,
      updatedAt: new Date(),
    };
    
    this.users.set(String(user.id), updatedUser);
    return updatedUser;
  }

  async updateUserCoins(telegramId: number, coins: { total?: number; available?: number; spent?: number }): Promise<void> {
    const user = await this.getUserByTelegramId(telegramId);
    if (!user) return;

    const updatedUser: User = {
      ...user,
      totalCoins: coins.total ?? user.totalCoins,
      availableCoins: coins.available ?? user.availableCoins,
      spentCoins: coins.spent ?? user.spentCoins,
      updatedAt: new Date(),
    };
    
    this.users.set(String(user.id), updatedUser);
  }

  async updateUserXP(telegramId: number, xp: { current?: number; total?: number; level?: number }): Promise<void> {
    const user = await this.getUserByTelegramId(telegramId);
    if (!user) return;

    const updatedUser: User = {
      ...user,
      xp: xp.current ?? user.xp,
      totalXp: xp.total ?? user.totalXp,
      level: xp.level ?? user.level,
      updatedAt: new Date(),
    };
    
    this.users.set(String(user.id), updatedUser);
  }

  async updateUserStreak(telegramId: number, streak: { current?: number; best?: number }): Promise<void> {
    const user = await this.getUserByTelegramId(telegramId);
    if (!user) return;

    const updatedUser: User = {
      ...user,
      currentStreak: streak.current ?? user.currentStreak,
      bestStreak: streak.best ?? user.bestStreak,
      updatedAt: new Date(),
    };
    
    this.users.set(String(user.id), updatedUser);
  }
}

export const storage = new MemStorage();
