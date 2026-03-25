import { Router } from "express";
import { db } from "../db";
import { photos, insertPhotoSchema } from "../../shared/schema";
import { desc, eq, count } from "drizzle-orm";
import { ObjectStorageService, ObjectNotFoundError } from "../objectStorage";
import { parsePaginationParams, createPaginatedResponse, withTimeout, isDbTimeoutError, dbTimeoutError, internalError } from "../apiUtils";
import { verifyTelegramUser, uploadUrlSchema, MAX_FILE_SIZE, ALLOWED_TYPES } from "./shared";

const router = Router();

router.post("/api/photos/upload-url", verifyTelegramUser, async (req: any, res) => {
  try {
    const validationResult = uploadUrlSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ error: 'Invalid request body', details: validationResult.error.errors });
    }
    
    const { fileSize, fileType } = validationResult.data;
    
    if (fileSize !== undefined && fileSize > MAX_FILE_SIZE) {
      return res.status(400).json({ 
        error: 'File too large', 
        message: `Maximum file size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
        maxSize: MAX_FILE_SIZE
      });
    }
    
    if (fileType !== undefined && !ALLOWED_TYPES.includes(fileType)) {
      return res.status(400).json({ 
        error: 'Invalid file type', 
        message: `Allowed types: ${ALLOWED_TYPES.join(', ')}`,
        allowedTypes: ALLOWED_TYPES
      });
    }
    
    const objectStorageService = new ObjectStorageService();
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    res.json({ uploadURL });
  } catch (error) {
    console.error('Error getting upload URL:', error);
    res.status(500).json({ error: 'Failed to get upload URL' });
  }
});

router.post("/api/photos", verifyTelegramUser, async (req: any, res) => {
  try {
    const validatedData = insertPhotoSchema.parse(req.body);
    
    const objectStorageService = new ObjectStorageService();
    const normalizedPath = objectStorageService.normalizeObjectEntityPath(validatedData.objectPath);
    
    const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
      validatedData.objectPath,
      {
        owner: validatedData.userId || "anonymous",
        visibility: "public",
      }
    );

    const [photo] = await db.insert(photos).values({
      ...validatedData,
      objectPath: objectPath,
    }).returning();

    res.json(photo);
  } catch (error) {
    console.error('Error creating photo:', error);
    res.status(500).json({ error: 'Failed to create photo' });
  }
});

router.get("/api/photos", async (req, res) => {
  try {
    const { limit, offset } = parsePaginationParams(req);

    const [totalResult, photosList] = await Promise.all([
      withTimeout(db.select({ count: count() }).from(photos)),
      withTimeout(
        db.select()
          .from(photos)
          .orderBy(desc(photos.uploadedAt))
          .limit(limit)
          .offset(offset)
      ),
    ]);

    const total = totalResult[0]?.count ?? 0;
    res.json(createPaginatedResponse(photosList, total, { limit, offset }));
  } catch (error) {
    console.error('Error fetching photos:', error);
    if (isDbTimeoutError(error)) {
      return dbTimeoutError(res, 'Failed to fetch photos: database timeout');
    }
    return internalError(res, 'Failed to fetch photos');
  }
});

router.get("/api/photos/:id", async (req, res) => {
  try {
    const photoId = parseInt(req.params.id);
    const [photo] = await db.select().from(photos).where(eq(photos.id, photoId));
    
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    
    res.json(photo);
  } catch (error) {
    console.error('Error fetching photo:', error);
    res.status(500).json({ error: 'Failed to fetch photo' });
  }
});

router.delete("/api/photos/:id", verifyTelegramUser, async (req: any, res) => {
  try {
    const photoId = parseInt(req.params.id);
    const [deletedPhoto] = await db.delete(photos).where(eq(photos.id, photoId)).returning();
    
    if (!deletedPhoto) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    
    res.json({ success: true, photo: deletedPhoto });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
});

export default router;
