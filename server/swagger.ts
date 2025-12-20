import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import type { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'WEB4TG API',
      version: '1.0.0',
      description: 'Telegram Mini App Portfolio API Documentation',
      contact: {
        name: 'WEB4TG Support',
        url: 'https://t.me/web4tgs',
      },
    },
    servers: [
      {
        url: process.env.RAILWAY_PUBLIC_DOMAIN 
          ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
          : 'http://localhost:5000',
        description: process.env.NODE_ENV === 'production' ? 'Production' : 'Development',
      },
    ],
    components: {
      securitySchemes: {
        TelegramAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-Telegram-Init-Data',
          description: 'Telegram WebApp initData for authentication',
        },
        CSRFToken: {
          type: 'apiKey',
          in: 'header',
          name: 'X-CSRF-Token',
          description: 'CSRF protection token',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
        User: {
          type: 'object',
          properties: {
            telegramId: { type: 'integer' },
            username: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            level: { type: 'integer' },
            xp: { type: 'integer' },
            coins: { type: 'string' },
          },
        },
        Notification: {
          type: 'object',
          required: ['chatId', 'message'],
          properties: {
            chatId: { type: 'integer', description: 'Telegram chat ID' },
            message: { type: 'string', description: 'Message text (HTML supported)' },
            parseMode: { type: 'string', enum: ['HTML', 'Markdown'], default: 'HTML' },
          },
        },
        Review: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            company: { type: 'string' },
            rating: { type: 'integer', minimum: 1, maximum: 5 },
            text: { type: 'string' },
            isApproved: { type: 'boolean' },
          },
        },
      },
    },
    tags: [
      { name: 'Health', description: 'Health check endpoints' },
      { name: 'Auth', description: 'Authentication and CSRF' },
      { name: 'Users', description: 'User management' },
      { name: 'Gamification', description: 'XP, levels, and rewards' },
      { name: 'Referrals', description: 'Referral program' },
      { name: 'Notifications', description: 'Push notifications via Telegram' },
      { name: 'Photos', description: 'Photo gallery management' },
      { name: 'Reviews', description: 'User reviews' },
      { name: 'Analytics', description: 'A/B testing and analytics' },
      { name: 'Payments', description: 'Stripe payment processing' },
    ],
  },
  apis: ['./server/routes.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'WEB4TG API Docs',
  }));
  
  app.get('/api/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}

export { swaggerSpec };
