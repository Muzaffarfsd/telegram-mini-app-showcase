import { Router } from "express";
import { z } from 'zod';
import { db } from "../db";
import { userStories, storyReactions } from "../../shared/schema";
import { desc, eq, and, sql, count } from "drizzle-orm";
import { ObjectStorageService } from "../objectStorage";
import { parsePaginationParams, createPaginatedResponse, withTimeout, isDbTimeoutError, validationError, dbTimeoutError, internalError } from "../apiUtils";
import { optionalTelegramAuthMiddleware } from "../telegramAuth";
import { verifyTelegramUser, sanitizeHtmlString } from "./shared";

const router = Router();

router.get("/api/user-stories", async (req, res) => {
  try {
    const { limit, offset } = parsePaginationParams(req);
    
    const [totalResult, storiesList] = await Promise.all([
      withTimeout(db.select({ count: count() }).from(userStories).where(and(eq(userStories.isActive, true), eq(userStories.isApproved, true)))),
      withTimeout(
        db.select()
          .from(userStories)
          .where(and(eq(userStories.isActive, true), eq(userStories.isApproved, true)))
          .orderBy(desc(userStories.createdAt))
          .limit(limit)
          .offset(offset)
      ),
    ]);
    
    const total = totalResult[0]?.count ?? 0;
    res.json(createPaginatedResponse(storiesList, total, { limit, offset }));
  } catch (error) {
    console.error('Error fetching user stories:', error);
    if (isDbTimeoutError(error)) {
      return dbTimeoutError(res, 'Failed to fetch stories: database timeout');
    }
    return internalError(res, 'Failed to fetch stories');
  }
});

router.get("/api/user-stories/my", verifyTelegramUser, async (req: any, res) => {
  try {
    const telegramId = req.telegramUser.id;
    
    const myStories = await db.select()
      .from(userStories)
      .where(eq(userStories.telegramId, telegramId))
      .orderBy(desc(userStories.createdAt));
    
    res.json({ stories: myStories });
  } catch (error) {
    console.error('Error fetching my stories:', error);
    return internalError(res, 'Failed to fetch your stories');
  }
});

router.post("/api/user-stories/upload-url", verifyTelegramUser, async (req: any, res) => {
  try {
    const objectStorageService = new ObjectStorageService();
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    res.json({ uploadURL });
  } catch (error) {
    console.error('Error getting story upload URL:', error);
    res.status(500).json({ error: 'Failed to get upload URL' });
  }
});

const createUserStorySchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional().nullable(),
  mediaType: z.enum(['image', 'video']),
  mediaUrl: z.string().url().or(z.string().startsWith('https://storage.googleapis.com/')),
  thumbnailUrl: z.string().url().optional().nullable(),
  category: z.enum(['my-business', 'idea', 'review', 'before-after', 'looking-for', 'lifehack', 'achievement', 'question']).default('my-business'),
  hashtags: z.array(z.string().max(30)).max(10).optional().default([]),
  linkedDemoId: z.string().max(100).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
});

router.post("/api/user-stories", verifyTelegramUser, async (req: any, res) => {
  try {
    const telegramId = req.telegramUser.id;
    
    const validationResult = createUserStorySchema.safeParse(req.body);
    if (!validationResult.success) {
      return validationError(res, 'Validation failed', { errors: validationResult.error.errors });
    }
    
    const { title, description, mediaType, mediaUrl, thumbnailUrl, category, hashtags, linkedDemoId, location } = validationResult.data;
    
    const objectStorageService = new ObjectStorageService();
    
    if (!mediaUrl.startsWith('https://storage.googleapis.com/')) {
      return validationError(res, 'Invalid media URL');
    }
    
    const normalizedMediaUrl = await objectStorageService.trySetObjectEntityAclPolicy(
      mediaUrl,
      { owner: String(telegramId), visibility: "public" }
    );
    
    const sanitizedHashtags = hashtags?.map((tag: string) => tag.replace(/[^a-zA-Zа-яА-Я0-9_]/g, '').toLowerCase()).filter(Boolean) || [];
    
    const storyData = {
      telegramId,
      title: sanitizeHtmlString(title),
      description: description ? sanitizeHtmlString(description) : null,
      mediaType,
      mediaUrl: normalizedMediaUrl,
      thumbnailUrl: thumbnailUrl || null,
      category,
      hashtags: sanitizedHashtags,
      linkedDemoId: linkedDemoId || null,
      location: location ? sanitizeHtmlString(location) : null,
      isActive: true,
      isApproved: false,
    };
    
    const [newStory] = await db.insert(userStories).values(storyData).returning();
    
    res.json({ 
      success: true, 
      story: newStory,
      message: 'Story created successfully. It will be visible after moderation.'
    });
  } catch (error) {
    console.error('Error creating user story:', error);
    res.status(500).json({ error: 'Failed to create story' });
  }
});

router.patch("/api/user-stories/:id", verifyTelegramUser, async (req: any, res) => {
  try {
    const storyId = parseInt(req.params.id);
    const telegramId = req.telegramUser.id;
    
    const updateSchema = z.object({
      title: z.string().min(1).max(100).optional(),
      description: z.string().max(500).optional().nullable(),
      category: z.enum(['my-business', 'idea', 'review', 'before-after', 'looking-for', 'lifehack', 'achievement', 'question']).optional(),
    });
    
    const validationResult = updateSchema.safeParse(req.body);
    if (!validationResult.success) {
      return validationError(res, 'Validation failed', { errors: validationResult.error.errors });
    }
    
    const updateData: Record<string, unknown> = {};
    if (validationResult.data.title) updateData.title = sanitizeHtmlString(validationResult.data.title);
    if (validationResult.data.description !== undefined) {
      updateData.description = validationResult.data.description ? sanitizeHtmlString(validationResult.data.description) : null;
    }
    if (validationResult.data.category) updateData.category = validationResult.data.category;
    
    const [updatedStory] = await db.update(userStories)
      .set(updateData)
      .where(and(eq(userStories.id, storyId), eq(userStories.telegramId, telegramId)))
      .returning();
    
    if (!updatedStory) {
      return res.status(404).json({ error: 'Story not found or unauthorized' });
    }
    
    res.json({ success: true, story: updatedStory });
  } catch (error) {
    console.error('Error updating story:', error);
    res.status(500).json({ error: 'Failed to update story' });
  }
});

router.post("/api/user-stories/:id/view", async (req, res) => {
  try {
    const storyId = parseInt(req.params.id);
    
    await db.update(userStories)
      .set({ viewCount: sql`${userStories.viewCount} + 1` })
      .where(eq(userStories.id, storyId));
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error incrementing view count:', error);
    res.status(500).json({ error: 'Failed to update view count' });
  }
});

router.delete("/api/user-stories/:id", verifyTelegramUser, async (req: any, res) => {
  try {
    const storyId = parseInt(req.params.id);
    const telegramId = req.telegramUser.id;
    
    const [deactivatedStory] = await db.update(userStories)
      .set({ isActive: false })
      .where(and(eq(userStories.id, storyId), eq(userStories.telegramId, telegramId)))
      .returning();
    
    if (!deactivatedStory) {
      return res.status(404).json({ error: 'Story not found or unauthorized' });
    }
    
    res.json({ success: true, story: deactivatedStory });
  } catch (error) {
    console.error('Error deleting story:', error);
    res.status(500).json({ error: 'Failed to delete story' });
  }
});

const reactionTypes = ['like', 'fire', 'clap', 'heart_eyes', 'rocket'] as const;
const reactionCountFields = {
  like: userStories.likesCount,
  fire: userStories.fireCount,
  clap: userStories.clapCount,
  heart_eyes: userStories.heartEyesCount,
  rocket: userStories.rocketCount,
} as const;

router.get("/api/user-stories/:id/reactions", optionalTelegramAuthMiddleware, async (req: any, res) => {
  try {
    const storyId = parseInt(req.params.id);
    const telegramId = req.telegramUser?.id;
    
    const [story] = await db.select({
      id: userStories.id,
      likesCount: userStories.likesCount,
      fireCount: userStories.fireCount,
      clapCount: userStories.clapCount,
      heartEyesCount: userStories.heartEyesCount,
      rocketCount: userStories.rocketCount,
    })
      .from(userStories)
      .where(eq(userStories.id, storyId))
      .limit(1);
    
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    let userReactions: string[] = [];
    if (telegramId) {
      const reactions = await db.select({ reactionType: storyReactions.reactionType })
        .from(storyReactions)
        .where(and(
          eq(storyReactions.storyId, storyId),
          eq(storyReactions.telegramId, telegramId)
        ));
      userReactions = reactions.map(r => r.reactionType);
    }
    
    res.json({
      counts: {
        like: story.likesCount,
        fire: story.fireCount,
        clap: story.clapCount,
        heart_eyes: story.heartEyesCount,
        rocket: story.rocketCount,
      },
      userReactions,
    });
  } catch (error) {
    console.error('Error fetching reactions:', error);
    res.status(500).json({ error: 'Failed to fetch reactions' });
  }
});

router.post("/api/user-stories/:id/reactions", verifyTelegramUser, async (req: any, res) => {
  try {
    const storyId = parseInt(req.params.id);
    const telegramId = req.telegramUser.id;
    
    const reactionSchema = z.object({
      reactionType: z.enum(reactionTypes),
    });
    
    const validationResult = reactionSchema.safeParse(req.body);
    if (!validationResult.success) {
      return validationError(res, 'Invalid reaction type');
    }
    
    const { reactionType } = validationResult.data;
    
    const [story] = await db.select({ id: userStories.id })
      .from(userStories)
      .where(eq(userStories.id, storyId))
      .limit(1);
    
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    const [existingReaction] = await db.select()
      .from(storyReactions)
      .where(and(
        eq(storyReactions.storyId, storyId),
        eq(storyReactions.telegramId, telegramId),
        eq(storyReactions.reactionType, reactionType)
      ))
      .limit(1);
    
    const countField = reactionCountFields[reactionType];
    
    if (existingReaction) {
      await db.delete(storyReactions)
        .where(eq(storyReactions.id, existingReaction.id));
      
      await db.update(userStories)
        .set({ [reactionType === 'like' ? 'likesCount' : `${reactionType}Count`]: sql`GREATEST(${countField} - 1, 0)` })
        .where(eq(userStories.id, storyId));
      
      res.json({ success: true, action: 'removed', reactionType });
    } else {
      await db.insert(storyReactions).values({
        storyId,
        telegramId,
        reactionType,
      });
      
      await db.update(userStories)
        .set({ [reactionType === 'like' ? 'likesCount' : `${reactionType}Count`]: sql`${countField} + 1` })
        .where(eq(userStories.id, storyId));
      
      res.json({ success: true, action: 'added', reactionType });
    }
  } catch (error) {
    console.error('Error toggling reaction:', error);
    res.status(500).json({ error: 'Failed to toggle reaction' });
  }
});

export default router;
