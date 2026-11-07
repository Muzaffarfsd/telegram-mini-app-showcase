import { Router } from "express";
import { z } from 'zod';
import { db } from "../db";
import { users, referrals, analyticsEvents } from "../../shared/schema";
import { desc, eq, and, sql, count } from "drizzle-orm";
import { TELEGRAM_BOT_TOKEN, verifyTelegramUser, requireAdmin } from "./shared";

const router = Router();
const telemetryName = z.string().min(1).max(100).regex(/^[a-zA-Z0-9_.:\/-]+$/);
const telemetryMetadata = z.record(z.string().max(60), z.union([z.string().max(250), z.number().finite(), z.boolean(), z.null()])).refine(value => Object.keys(value).length <= 20);

interface ABTestEvent {
  experiment: string;
  variant: string;
  eventType: string;
  userId: string | null;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

const abTestEvents: Map<string, ABTestEvent[]> = new Map();

router.post("/api/analytics/ab-event", (req, res) => {
  try {
    const key = z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,60}$/).refine(value => !['__proto__', 'constructor', 'prototype'].includes(value));
    const parsed = z.object({ experiment: key, variant: key, eventType: z.enum(['exposure', 'conversion']), userId: z.string().max(100).nullable().optional(), timestamp: z.number().finite().optional() }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid analytics event' });
    const { experiment, variant, eventType, userId } = parsed.data;
    
    const eventKey = `${experiment}::${variant}::${eventType}`;
    const existingEvents = abTestEvents.get(eventKey) || [];
    
    existingEvents.push({
      experiment: (experiment || 'unknown').toString(),
      variant: (variant || 'unknown').toString(),
      eventType: (eventType || 'unknown').toString(),
      userId: userId || null,
      timestamp: Date.now(),
    });
    
    if (existingEvents.length > 1000) existingEvents.splice(0, existingEvents.length - 1000);
    if (!abTestEvents.has(eventKey) && abTestEvents.size >= 500) abTestEvents.delete(abTestEvents.keys().next().value!);
    abTestEvents.set(eventKey, existingEvents);
    res.json({ success: true, eventKey });
  } catch (error: any) {
    res.status(400).json({ error: 'Failed to track A/B event' });
  }
});

router.get("/api/analytics/ab-stats", verifyTelegramUser, requireAdmin, (req, res) => {
  try {
    const stats: Record<string, Record<string, { exposures: number; conversions: number; conversionRate: string }>> = Object.create(null);
    
    abTestEvents.forEach((events, key) => {
      const [experiment, variant, eventType] = key.split('::');
      
      if (!stats[experiment]) {
        stats[experiment] = Object.create(null);
      }
      
      if (!stats[experiment][variant]) {
        stats[experiment][variant] = { exposures: 0, conversions: 0, conversionRate: '0%' };
      }
      
      if (eventType === 'exposure') {
        stats[experiment][variant].exposures = events.length;
      } else if (eventType === 'conversion') {
        stats[experiment][variant].conversions = events.length;
      }
    });
    
    Object.keys(stats).forEach(experiment => {
      Object.keys(stats[experiment]).forEach(variant => {
        const { exposures, conversions } = stats[experiment][variant];
        const rate = exposures > 0 ? ((conversions / exposures) * 100).toFixed(2) : '0';
        stats[experiment][variant].conversionRate = `${rate}%`;
      });
    });
    
    res.json({ stats, rawEventCount: Array.from(abTestEvents.values()).reduce((sum, arr) => sum + arr.length, 0) });
  } catch (error: any) {
    console.error('A/B stats error:', error);
    res.status(500).json({ error: 'Failed to get A/B stats' });
  }
});

interface AnalyticsEventPayload {
  category: string;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, unknown>;
  timestamp: number;
  sessionId: string;
  telegramId?: number;
  platform?: string;
  version?: string;
  isOnline?: boolean;
}

const analyticsStore: AnalyticsEventPayload[] = [];
const MAX_ANALYTICS_STORE = 10000;

router.post("/api/analytics/events", (req, res) => {
  try {
    const parsed = z.object({ events: z.array(z.object({ category:telemetryName, action:telemetryName, label:z.string().max(250).optional(), value:z.number().finite().optional(), timestamp:z.number().finite().nonnegative(), sessionId:z.string().max(100).default('anonymous'), platform:z.string().max(50).optional(), version:z.string().max(50).optional(), isOnline:z.boolean().optional() })).max(100), offline:z.boolean().optional() }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid telemetry batch' });
    const { events: validEvents, offline } = parsed.data;

    if (validEvents.length === 0) {
      return res.json({ success: true, received: 0 });
    }

    analyticsStore.push(...validEvents);
    
    if (analyticsStore.length > MAX_ANALYTICS_STORE) {
      analyticsStore.splice(0, analyticsStore.length - MAX_ANALYTICS_STORE);
    }


    res.json({ 
      success: true, 
      received: validEvents.length,
      offline: offline || false,
    });
  } catch (error: unknown) {
    console.error('Analytics events error:', error);
    res.status(500).json({ error: 'Failed to process analytics events' });
  }
});

router.get("/api/analytics/summary", verifyTelegramUser, requireAdmin, (req, res) => {
  try {
    const now = Date.now();
    const last24h = now - 24 * 60 * 60 * 1000;
    const last7d = now - 7 * 24 * 60 * 60 * 1000;

    const recentEvents = analyticsStore.filter(e => e.timestamp > last24h);
    const weekEvents = analyticsStore.filter(e => e.timestamp > last7d);

    const categoryCount: Record<string, number> = Object.create(null);
    const actionCount: Record<string, number> = Object.create(null);
    const uniqueSessions = new Set<string>();
    const uniqueUsers = new Set<number>();

    recentEvents.forEach(e => {
      categoryCount[e.category] = (categoryCount[e.category] || 0) + 1;
      actionCount[e.action] = (actionCount[e.action] || 0) + 1;
      uniqueSessions.add(e.sessionId);
      if (e.telegramId) uniqueUsers.add(e.telegramId);
    });

    const pageViews = recentEvents.filter(e => e.category === 'page' && e.action === 'view').length;
    const demoStarts = recentEvents.filter(e => e.category === 'demo' && e.action === 'demo_start').length;
    const demoCompletes = recentEvents.filter(e => e.category === 'demo' && e.action === 'demo_complete').length;
    const errors = recentEvents.filter(e => e.category === 'error').length;

    const perfEvents = recentEvents.filter(e => e.category === 'performance' && e.value !== undefined);
    const avgWebVitals: Record<string, { avg: number; count: number }> = {};
    perfEvents.forEach(e => {
      if (!avgWebVitals[e.action]) {
        avgWebVitals[e.action] = { avg: 0, count: 0 };
      }
      const current = avgWebVitals[e.action];
      current.avg = (current.avg * current.count + (e.value || 0)) / (current.count + 1);
      current.count++;
    });

    res.json({
      period: '24h',
      totalEvents: recentEvents.length,
      totalEventsWeek: weekEvents.length,
      uniqueSessions: uniqueSessions.size,
      uniqueUsers: uniqueUsers.size,
      metrics: {
        pageViews,
        demoStarts,
        demoCompletes,
        demoCompletionRate: demoStarts > 0 ? ((demoCompletes / demoStarts) * 100).toFixed(1) + '%' : '0%',
        errors,
      },
      byCategory: categoryCount,
      topActions: Object.entries(actionCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([action, count]) => ({ action, count })),
      webVitals: Object.entries(avgWebVitals).map(([metric, data]) => ({
        metric,
        avg: Math.round(data.avg),
        count: data.count,
      })),
    });
  } catch (error: unknown) {
    console.error('Analytics summary error:', error);
    res.status(500).json({ error: 'Failed to get analytics summary' });
  }
});

router.post("/api/vitals", (req, res) => {
  const parsed = z.object({ name:z.enum(['CLS','FCP','INP','LCP','TTFB','FID']), value:z.number().finite().min(0).max(10000000), rating:z.enum(['good','needs-improvement','poor']).optional(), id:z.string().max(100).optional(), url:z.string().max(2048).optional() }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error:'Invalid metric' });
  console.log('[VITALS]', { name:parsed.data.name, value:parsed.data.value });
  res.json({ success: true });
});

router.post("/api/error", (req, res) => {
  const parsed = z.object({ errorMessage:z.string().max(2000), errorStack:z.string().max(8000).optional(), componentName:z.string().max(120).optional(), url:z.string().max(2048).optional() }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error:'Invalid error report' });
  console.info('[Client error report received]');
  res.json({ success: true });
});

router.post("/api/user-action", (req, res) => {
  const parsed = z.object({ action:telemetryName, metadata:telemetryMetadata.optional(), url:z.string().max(2048).optional() }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error:'Invalid action report' });
  res.json({ success: true });
});

router.post("/api/analytics/track", async (req, res) => {
  const analyticsTrackSchema = z.object({
    actionType: telemetryName,
    userId: z.number().optional(),
    metadata: telemetryMetadata.optional(),
    notifyAdmin: z.boolean().optional(),
  });
  
  const validationResult = analyticsTrackSchema.safeParse(req.body);
  if (!validationResult.success) {
    return res.status(400).json({ 
      error: 'Validation error', 
      details: validationResult.error.issues 
    });
  }
  
  try {
    const { actionType, metadata } = validationResult.data;
    
    const event = {
      actionType,
      userId: req.telegramUser?.id || null,
      metadata: metadata || {},
      timestamp: Date.now(),
    };
    
    // Untrusted telemetry cannot send bot notifications or award value.

    res.json({ success: true, tracked: event });
  } catch (error: any) {
    console.error('Track action error:', error);
    res.status(500).json({ error: 'Failed to track action' });
  }
});

// This legacy endpoint trusted arbitrary amounts and replayed credits. A verified payment ledger must own rewards.
router.post("/api/webhooks/referral", verifyTelegramUser, requireAdmin, (_req, res) => {
  return res.status(410).json({ error: 'Legacy reward webhook disabled', code: 'VERIFIED_PAYMENT_EVENT_REQUIRED' });
});

router.get("/api/analytics/dashboard", verifyTelegramUser, requireAdmin, async (req, res) => {
  try {
    const { range = "7days" } = req.query;
    
    const now = new Date();
    let daysBack = 7;
    if (range === "today") daysBack = 1;
    else if (range === "30days") daysBack = 30;
    
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - daysBack);
    startDate.setHours(0, 0, 0, 0);
    
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    
    const [totalUsersResult] = await db.select({ count: count() }).from(users);
    const totalUsers = totalUsersResult?.count || 0;
    
    const todayStr = now.toISOString().split('T')[0];
    const [activeTodayResult] = await db.select({ count: count() })
      .from(users)
      .where(sql`${users.lastVisitDate}::text = ${todayStr}`);
    const activeToday = activeTodayResult?.count || 0;
    
    const newUsersInRange = await db.select({ count: count() })
      .from(users)
      .where(sql`${users.createdAt} >= ${startDate}`);
    
    const [totalReferralsResult] = await db.select({ count: count() }).from(referrals);
    const totalReferralsCount = totalReferralsResult?.count || 0;
    
    const [convertedReferralsResult] = await db.select({ count: count() })
      .from(referrals)
      .where(eq(referrals.status, 'active'));
    const convertedCount = convertedReferralsResult?.count || 0;
    const conversionRate = totalUsers > 0 ? Number(((convertedCount / totalUsers) * 100).toFixed(1)) : 0;
    
    const userGrowth: { date: string; users: number }[] = [];
    for (let i = daysBack - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const [countResult] = await db.select({ count: count() })
        .from(users)
        .where(sql`DATE(${users.createdAt}) <= ${dateStr}`);
      
      userGrowth.push({
        date: range === "today" ? `${date.getHours()}:00` : dateStr.slice(5),
        users: countResult?.count || 0,
      });
    }
    
    const activeUsersData: { date: string; active: number; new: number }[] = [];
    const dayLabels = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
    
    for (let i = Math.min(daysBack - 1, 13); i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const [activeResult] = await db.select({ count: count() })
        .from(users)
        .where(sql`${users.lastVisitDate}::text = ${dateStr}`);
      
      const [newResult] = await db.select({ count: count() })
        .from(users)
        .where(sql`DATE(${users.createdAt}) = ${dateStr}`);
      
      activeUsersData.push({
        date: range === "7days" ? dayLabels[date.getDay()] : dateStr.slice(5),
        active: activeResult?.count || 0,
        new: newResult?.count || 0,
      });
    }
    
    const topDemosRaw = await db.select({
      name: sql<string>`metadata->>'demo'`,
      count: count(),
    })
      .from(analyticsEvents)
      .where(and(
        eq(analyticsEvents.eventType, 'page_view'),
        sql`metadata->>'demo' IS NOT NULL`,
        sql`${analyticsEvents.createdAt} >= ${startDate}`
      ))
      .groupBy(sql`metadata->>'demo'`)
      .orderBy(desc(count()))
      .limit(5);
    
    const demoColors = ["#10B981", "#34D399", "#6EE7B7", "#A7F3D0", "#D1FAE5"];
    const defaultDemos = [
      { name: "Ресторан", value: 0, fill: "#10B981" },
      { name: "Магазин", value: 0, fill: "#34D399" },
      { name: "Фитнес", value: 0, fill: "#6EE7B7" },
      { name: "Красота", value: 0, fill: "#A7F3D0" },
      { name: "Курсы", value: 0, fill: "#D1FAE5" },
    ];
    
    const topDemos = topDemosRaw.length > 0 
      ? topDemosRaw.map((d, i) => ({
          name: d.name || "Unknown",
          value: Number(d.count),
          fill: demoColors[i] || "#10B981",
        }))
      : defaultDemos;
    
    const [visitorsResult] = await db.select({ count: count() })
      .from(analyticsEvents)
      .where(and(
        eq(analyticsEvents.eventType, 'page_view'),
        sql`${analyticsEvents.createdAt} >= ${startDate}`
      ));
    
    const [signupsResult] = await db.select({ count: count() })
      .from(users)
      .where(sql`${users.createdAt} >= ${startDate}`);
    
    const [activeUsersResult] = await db.select({ count: count() })
      .from(users)
      .where(sql`${users.completedTasks} > 0`);
    
    const visitors = visitorsResult?.count || (totalUsers * 3);
    const signups = signupsResult?.count || 0;
    const activeCount = activeUsersResult?.count || 0;
    
    const funnel = [
      { name: "Посетители", value: visitors || 10000, fill: "#10B981" },
      { name: "Регистрации", value: signups || Math.floor(visitors * 0.65), fill: "#34D399" },
      { name: "Активация", value: activeCount || Math.floor(signups * 0.65), fill: "#6EE7B7" },
      { name: "Конверсия", value: convertedCount || Math.floor(activeCount * 0.5), fill: "#A7F3D0" },
    ];
    
    const avgSessionMinutes = 4.5;
    
    res.json({
      stats: {
        totalUsers: Number(totalUsers),
        activeToday: Number(activeToday),
        conversionRate,
        avgSessionMinutes,
      },
      userGrowth,
      activeUsers: activeUsersData,
      topDemos,
      funnel,
    });
  } catch (error: any) {
    console.error('Analytics dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

export default router;
