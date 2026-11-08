// Existing offerings and prices, separated from the order interface.
// These are presentation choices for the same ecommerce package, not new tariffs.
export const storeCategories = [
  { id: 'clothes', ru: 'Одежда', en: 'Clothing', fullRu: 'Магазин одежды', fullEn: 'Clothing store', descriptionRu: 'Каталог одежды и заказ', descriptionEn: 'Fashion catalog and ordering', image: '/home-editorial/fashion-muraka-home-v2.webp' },
  { id: 'shoes', ru: 'Обувь', en: 'Shoes', fullRu: 'Магазин обуви', fullEn: 'Shoe store', descriptionRu: 'Пример: подборка обуви байера', descriptionEn: 'Example: a buyer’s shoe selection', image: '/order-editorial/footwear-v2.webp' },
  { id: 'sneakers', ru: 'Кроссовки', en: 'Sneakers', fullRu: 'Магазин кроссовок', fullEn: 'Sneaker store', descriptionRu: 'Каталог кроссовок и заказ', descriptionEn: 'Sneaker catalog and ordering', image: '/home-editorial/sneaker-no-header-home-v4.webp' },
  { id: 'tech', ru: 'Смартфоны', en: 'Smartphones', fullRu: 'Магазин смартфонов и аксессуаров', fullEn: 'Smartphones and accessories store', descriptionRu: 'Apple, техника и аксессуары', descriptionEn: 'Apple, devices and accessories', image: '/home-editorial/apple-home-real-v5.webp' },
  { id: 'flowers', ru: 'Цветы', en: 'Flowers', fullRu: 'Магазин цветов', fullEn: 'Flower store', descriptionRu: 'Каталог букетов и заказ', descriptionEn: 'Bouquets and ordering', image: '/home-editorial/florist-home-no-header-v3.webp' },
] as const;
export type StoreCategoryId = typeof storeCategories[number]['id'];

export const appTemplatesBase = [
  { id: 'ecommerce-basic', nameKey: 'constructor.onlineStore', descriptionKey: 'constructor.onlineStoreDesc', features: ['catalog', 'cart', 'auth', 'payments'], estimatedPrice: 150000, developmentTimeKey: 'constructor.days710', popular: true },
  { id: 'restaurant', nameKey: 'constructor.restaurantTemplate', descriptionKey: 'constructor.restaurantTemplateDesc', features: ['catalog', 'cart', 'auth', 'booking-system'], estimatedPrice: 180000, developmentTimeKey: 'constructor.days1012', popular: false },
  { id: 'fitness-center', nameKey: 'constructor.fitnessClub', descriptionKey: 'constructor.fitnessClubDesc', features: ['booking-system', 'auth', 'subscriptions', 'progress-tracking'], estimatedPrice: 200000, developmentTimeKey: 'constructor.days1215', popular: false },
  { id: 'services', nameKey: 'constructor.servicesTemplate', descriptionKey: 'constructor.servicesTemplateDesc', features: ['catalog', 'booking-system', 'auth', 'payments'], estimatedPrice: 170000, developmentTimeKey: 'constructor.days812', popular: false }
];

export const availableFeaturesBase = [
  { id: 'catalog', nameKey: 'constructor.catalogFeature', price: 25000, categoryKey: 'constructor.basicFeatures', included: true },
  { id: 'cart', nameKey: 'constructor.cartFeature', price: 20000, categoryKey: 'constructor.basicFeatures', included: true },
  { id: 'auth', nameKey: 'constructor.authFeature', price: 15000, categoryKey: 'constructor.basicFeatures', included: true },
  { id: 'search', nameKey: 'constructor.searchFeature', price: 20000, categoryKey: 'constructor.basicFeatures', included: false },
  { id: 'favorites', nameKey: 'constructor.favoritesFeature', price: 12000, categoryKey: 'constructor.basicFeatures', included: false },
  { id: 'reviews', nameKey: 'constructor.reviewsFeature', price: 25000, categoryKey: 'constructor.basicFeatures', included: false },
  { id: 'payments', nameKey: 'constructor.paymentsFeature', price: 45000, categoryKey: 'constructor.paymentsCategory', included: false },
  { id: 'subscriptions', nameKey: 'constructor.subscriptionsFeature', price: 55000, categoryKey: 'constructor.paymentsCategory', included: false },
  { id: 'installments', nameKey: 'constructor.installmentsFeature', price: 35000, categoryKey: 'constructor.paymentsCategory', included: false },
  { id: 'delivery-basic', nameKey: 'constructor.deliveryFeature', price: 30000, categoryKey: 'constructor.deliveryCategory', included: false },
  { id: 'pickup-points', nameKey: 'constructor.pickupFeature', price: 35000, categoryKey: 'constructor.deliveryCategory', included: false },
  { id: 'express-delivery', nameKey: 'constructor.expressFeature', price: 25000, categoryKey: 'constructor.deliveryCategory', included: false },
  { id: 'push-notifications', nameKey: 'constructor.notificationsFeature', price: 25000, categoryKey: 'constructor.communicationsCategory', included: false },
  { id: 'chat-support', nameKey: 'constructor.chatSupportFeature', price: 45000, categoryKey: 'constructor.communicationsCategory', included: false },
  { id: 'video-calls', nameKey: 'constructor.videoCallsFeature', price: 60000, categoryKey: 'constructor.communicationsCategory', included: false },
  { id: 'loyalty-program', nameKey: 'constructor.loyaltyFeature', price: 65000, categoryKey: 'constructor.marketingCategory', included: false },
  { id: 'promo-codes', nameKey: 'constructor.promoCodesFeature', price: 30000, categoryKey: 'constructor.marketingCategory', included: false },
  { id: 'referral-system', nameKey: 'constructor.referralFeature', price: 55000, categoryKey: 'constructor.marketingCategory', included: false },
  { id: 'basic-analytics', nameKey: 'constructor.analyticsFeature', price: 45000, categoryKey: 'constructor.managementCategory', included: false },
  { id: 'admin-panel', nameKey: 'constructor.adminPanelFeature', price: 75000, categoryKey: 'constructor.managementCategory', included: false },
  { id: 'crm-system', nameKey: 'constructor.crmFeature', price: 120000, categoryKey: 'constructor.managementCategory', included: false },
  { id: 'booking-system', nameKey: 'constructor.bookingFeature', price: 55000, categoryKey: 'constructor.bookingCategory', included: false },
  { id: 'queue-management', nameKey: 'constructor.queueFeature', price: 45000, categoryKey: 'constructor.bookingCategory', included: false },
  { id: 'calendar-sync', nameKey: 'constructor.calendarFeature', price: 30000, categoryKey: 'constructor.bookingCategory', included: false },
  { id: 'progress-tracking', nameKey: 'constructor.progressFeature', price: 45000, categoryKey: 'constructor.managementCategory', included: false },
  { id: 'ai-chatbot', nameKey: 'constructor.aiChatbotFeature', price: 49000, categoryKey: 'constructor.aiAutomationCategory', included: false },
  { id: 'ai-recommendations', nameKey: 'constructor.aiRecommendationsFeature', price: 55000, categoryKey: 'constructor.aiAutomationCategory', included: false },
  { id: 'auto-responses', nameKey: 'constructor.autoResponsesFeature', price: 25000, categoryKey: 'constructor.aiAutomationCategory', included: false },
  { id: 'smart-search', nameKey: 'constructor.smartSearchFeature', price: 35000, categoryKey: 'constructor.aiAutomationCategory', included: false },
  { id: 'voice-assistant', nameKey: 'constructor.voiceAssistantFeature', price: 75000, categoryKey: 'constructor.aiAutomationCategory', included: false },
  { id: 'telegram-bot', nameKey: 'constructor.telegramBotFeature', price: 35000, categoryKey: 'constructor.integrationsCategory', included: false },
  { id: 'whatsapp-integration', nameKey: 'constructor.whatsappFeature', price: 45000, categoryKey: 'constructor.integrationsCategory', included: false },
  { id: 'google-maps', nameKey: 'constructor.googleMapsFeature', price: 20000, categoryKey: 'constructor.integrationsCategory', included: false },
  { id: 'sms-notifications', nameKey: 'constructor.smsFeature', price: 25000, categoryKey: 'constructor.integrationsCategory', included: false },
  { id: 'email-marketing', nameKey: 'constructor.emailMarketingFeature', price: 30000, categoryKey: 'constructor.integrationsCategory', included: false },
  { id: '1c-integration', nameKey: 'constructor.integration1cFeature', price: 85000, categoryKey: 'constructor.integrationsCategory', included: false },
  { id: 'api-access', nameKey: 'constructor.apiAccessFeature', price: 55000, categoryKey: 'constructor.integrationsCategory', included: false }
];

export const categoryKeys = [
  'constructor.basicFeatures', 'constructor.paymentsCategory', 'constructor.deliveryCategory',
  'constructor.communicationsCategory', 'constructor.marketingCategory', 'constructor.managementCategory',
  'constructor.bookingCategory', 'constructor.aiAutomationCategory', 'constructor.integrationsCategory'
];

export const subscriptionPlansBase = [
  { id: 'minimal', nameKey: 'constructor.minimalPlan', price: 9900, descriptionKey: 'constructor.minimalPlanDesc',
    featuresKeys: ['constructor.subscriptionFeatures.hosting99', 'constructor.subscriptionFeatures.minorFixes', 'constructor.subscriptionFeatures.emailSupport', 'constructor.subscriptionFeatures.monthlyBackups'],
    color: '#9CA3AF', },
  { id: 'standard', nameKey: 'constructor.standardPlan', price: 14900, descriptionKey: 'constructor.standardPlanDesc',
    featuresKeys: ['constructor.subscriptionFeatures.allFromMinimal', 'constructor.subscriptionFeatures.prioritySupport', 'constructor.subscriptionFeatures.freeUpdates', 'constructor.subscriptionFeatures.weeklyBackups', 'constructor.subscriptionFeatures.response2h'],
    color: '#34d399', popular: true },
  { id: 'premium', nameKey: 'constructor.premiumPlan', price: 24900, descriptionKey: 'constructor.premiumPlanDesc',
    featuresKeys: ['constructor.subscriptionFeatures.allFromStandard', 'constructor.subscriptionFeatures.personalManager', 'constructor.subscriptionFeatures.businessConsulting', 'constructor.subscriptionFeatures.dailyBackups', 'constructor.subscriptionFeatures.priorityImprovements', 'constructor.subscriptionFeatures.analyticsReports'],
    color: '#a78bfa', }
];
