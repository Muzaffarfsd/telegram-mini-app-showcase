import { Router } from "express";
import { db } from "../db";
import { reviews, insertReviewSchema } from "../../shared/schema";
import { desc, eq, count } from "drizzle-orm";
import { parsePaginationParams, createPaginatedResponse, withTimeout, isDbTimeoutError, dbTimeoutError, internalError } from "../apiUtils";
import { verifyTelegramUser } from "./shared";

const router = Router();

router.get("/api/reviews", async (req, res) => {
  try {
    const { limit, offset } = parsePaginationParams(req);

    const [totalResult, reviewsList] = await Promise.all([
      withTimeout(
        db.select({ count: count() })
          .from(reviews)
          .where(eq(reviews.isApproved, true))
      ),
      withTimeout(
        db.select()
          .from(reviews)
          .where(eq(reviews.isApproved, true))
          .orderBy(desc(reviews.isFeatured), desc(reviews.createdAt))
          .limit(limit)
          .offset(offset)
      ),
    ]);

    const total = totalResult[0]?.count ?? 0;
    res.json(createPaginatedResponse(reviewsList, total, { limit, offset }));
  } catch (error) {
    console.error('Error fetching reviews:', error);
    if (isDbTimeoutError(error)) {
      return dbTimeoutError(res, 'Failed to fetch reviews: database timeout');
    }
    return internalError(res, 'Failed to fetch reviews');
  }
});

router.post("/api/reviews", verifyTelegramUser, async (req: any, res) => {
  try {
    const validationResult = insertReviewSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationResult.error.issues 
      });
    }
    
    const reviewData = validationResult.data;
    
    const [newReview] = await db.insert(reviews).values({
      name: reviewData.name as string,
      company: (reviewData.company as string) || null,
      logoUrl: (reviewData.logoUrl as string) || null,
      rating: reviewData.rating as number,
      text: reviewData.text as string,
      location: (reviewData.location as string) || null,
      telegramId: (reviewData.telegramId as number) || null,
      isApproved: false,
      isFeatured: false,
    }).returning();
    
    res.json({ 
      success: true, 
      message: 'Отзыв отправлен на модерацию',
      review: newReview 
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

router.post("/api/reviews/seed", async (req, res) => {
  try {
    const existingReviews = await db.select().from(reviews).limit(1);
    if (existingReviews.length > 0) {
      return res.json({ message: 'Reviews already seeded' });
    }

    const featuredReviews = [
      {
        name: "Алексей Морозов",
        company: "Додо Пицца",
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Dodo_Pizza_Logo.svg/200px-Dodo_Pizza_Logo.svg.png",
        rating: 5,
        text: "Интеграция Telegram Mini App увеличила конверсию заказов на 34%. Клиенты оформляют заказы прямо в мессенджере без переключения между приложениями. ROI превзошёл все ожидания.",
        location: "Москва",
        isApproved: true,
        isFeatured: true,
      },
      {
        name: "Мария Соколова",
        company: "Lamoda",
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Lamoda_logo.svg/200px-Lamoda_logo.svg.png",
        rating: 5,
        text: "Запустили каталог с примеркой через Mini App за 2 недели. Средний чек вырос на 28%, а возвраты сократились благодаря удобному интерфейсу выбора размера.",
        location: "Санкт-Петербург",
        isApproved: true,
        isFeatured: true,
      },
      {
        name: "Дмитрий Волков",
        company: "Яндекс Еда",
        logoUrl: "https://avatars.mds.yandex.net/get-bunker/994278/02d88a098b0e7b695e9f9b3c4d2b1e3d4f5a6b7c/orig",
        rating: 5,
        text: "Mini App стало идеальным каналом для корпоративных заказов. Автоматизация согласований сэкономила командам по 3 часа в неделю. Отличное качество разработки.",
        location: "Москва",
        isApproved: true,
        isFeatured: true,
      },
      {
        name: "Анна Кузнецова",
        company: "Wildberries",
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Wildberries_logo.svg/200px-Wildberries_logo.svg.png",
        rating: 5,
        text: "Telegram-витрина для наших селлеров показала конверсию на 45% выше чем мобильный сайт. Быстрая интеграция с платёжными системами — огромный плюс.",
        location: "Москва",
        isApproved: true,
        isFeatured: true,
      },
      {
        name: "Сергей Петров",
        company: "World Class",
        logoUrl: "https://upload.wikimedia.org/wikipedia/ru/thumb/a/a0/World_Class_logo.svg/200px-World_Class_logo.svg.png",
        rating: 5,
        text: "Записи на тренировки через Mini App выросли на 67%. Тренеры получают уведомления мгновенно, клиенты видят свободные слоты в реальном времени.",
        location: "Москва",
        isApproved: true,
        isFeatured: true,
      },
      {
        name: "Елена Новикова",
        company: "OZON",
        logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Ozon_logo.svg/200px-Ozon_logo.svg.png",
        rating: 5,
        text: "Лояльность клиентов выросла на 40% после запуска бонусной программы в Telegram. Push-уведомления о статусе заказа — то, что клиенты давно ждали.",
        location: "Москва",
        isApproved: true,
        isFeatured: true,
      }
    ];

    await db.insert(reviews).values(featuredReviews);
    
    res.json({ success: true, message: 'Featured reviews seeded' });
  } catch (error) {
    console.error('Error seeding reviews:', error);
    res.status(500).json({ error: 'Failed to seed reviews' });
  }
});

router.get("/api/commercial-proposal.pdf", (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json({
    message: 'PDF commercial proposal is being generated',
    downloadUrl: 'https://t.me/web4tgs',
    note: 'Contact us to receive a personalized commercial proposal'
  });
});

export default router;
