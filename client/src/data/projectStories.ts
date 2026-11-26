export type ProjectStory = {
  id: string;
  title: [string, string];
  intro: [string, string];
  journey: Array<{ title: [string, string]; description: [string, string] }>;
  features: Array<[string, string]>;
};

// Descriptions cover the interactions available in each project, without claims about
// customer outcomes, live payments, delivery, or external services.
export const projectStories: Record<string, ProjectStory> = {
  'muraka-fashion': {
    id: 'muraka-fashion', title: ['Магазин одежды', 'Clothing store'],
    intro: ['Коллекция одежды, в которой покупатель рассматривает вещи, выбирает размер и собирает корзину.', 'A clothing collection where shoppers explore pieces, choose a size and build a bag.'],
    journey: [
      { title: ['Коллекция', 'Collection'], description: ['Каталог, категории и поиск помогают найти подходящую вещь.', 'Categories and search help shoppers find a piece.'] },
      { title: ['Детали', 'Details'], description: ['Фотографии, описание и доступные размеры помогают определиться.', 'Photography, descriptions and available sizes help shoppers decide.'] },
      { title: ['Корзина', 'Bag'], description: ['Выбранные вещи и размеры собираются в одном заказе.', 'Selected pieces and sizes come together in one bag.'] },
    ], features: [['Поиск и фильтры', 'Search and filters'], ['Выбор размера', 'Size selection'], ['Избранное', 'Saved items'], ['Корзина', 'Shopping bag']],
  },
  'takt-coffee': {
    id: 'takt-coffee', title: ['Кофейня', 'Coffee bar'],
    intro: ['Напитки и выпечка, выбор рецепта и удобный сценарий самовывоза.', 'Drinks and pastries, recipe customization and a pickup journey.'],
    journey: [
      { title: ['Меню', 'Menu'], description: ['Гость выбирает напиток или выпечку в каталоге.', 'Guests browse drinks and pastries in the menu.'] },
      { title: ['Свой рецепт', 'Your recipe'], description: ['Для напитка можно настроить размер и доступные ингредиенты.', 'Guests can choose a size and available ingredients.'] },
      { title: ['Самовывоз', 'Pickup'], description: ['Корзина собирает заказ и предлагает выбрать время получения.', 'The bag brings the order together and offers a pickup time.'] },
    ], features: [['Каталог напитков', 'Drinks menu'], ['Настройка рецепта', 'Recipe customization'], ['Выбор времени', 'Pickup time'], ['Карта гостя', 'Guest card']],
  },
  'women-fashion': {
    id: 'women-fashion', title: ['Женская одежда', 'Womenswear'],
    intro: ['Коллекции и готовые образы, которые помогают выбрать вещи в одном стиле.', 'Collections and complete looks that help shoppers choose pieces together.'],
    journey: [
      { title: ['Образы', 'Looks'], description: ['Вдохновляющие подборки знакомят с коллекцией.', 'Curated looks introduce the collection.'] },
      { title: ['Вещи', 'Pieces'], description: ['В карточке можно изучить фотографии, описание и размеры.', 'Product pages show photography, descriptions and sizes.'] },
      { title: ['Корзина', 'Bag'], description: ['Понравившиеся вещи можно сохранить или добавить в корзину.', 'Save favorite pieces or add them to the bag.'] },
    ], features: [['Подборки образов', 'Curated looks'], ['Выбор размера', 'Size selection'], ['Избранное', 'Saved items'], ['Корзина', 'Shopping bag']],
  },
  'nike-sneakers': {
    id: 'nike-sneakers', title: ['Магазин кроссовок', 'Sneaker store'],
    intro: ['Каталог кроссовок с подробным просмотром модели и выбором размера.', 'A sneaker catalog with detailed product views and size selection.'],
    journey: [
      { title: ['Каталог', 'Catalog'], description: ['Покупатель просматривает модели и находит нужную пару.', 'Shoppers browse the collection to find a pair.'] },
      { title: ['Модель', 'Product'], description: ['Фотографии и описание показывают детали выбранных кроссовок.', 'Photography and descriptions reveal the details of each pair.'] },
      { title: ['Размер и корзина', 'Size and bag'], description: ['Выбранные модель и размер добавляются в корзину.', 'The chosen model and size are added to the bag.'] },
    ], features: [['Каталог моделей', 'Product catalog'], ['Фотографии товара', 'Product photos'], ['Выбор размера', 'Size selection'], ['Корзина', 'Shopping bag']],
  },
  'apple-store': {
    id: 'apple-store', title: ['Магазин техники Apple', 'Apple device store'],
    intro: ['Каталог техники с выбором устройства, цвета и объёма памяти.', 'A device catalog with model, finish and storage options.'],
    journey: [
      { title: ['Устройства', 'Devices'], description: ['Покупатель изучает категории и модели в каталоге.', 'Shoppers explore categories and models.'] },
      { title: ['Конфигурация', 'Configuration'], description: ['В карточке можно выбрать цвет и доступную память устройства.', 'On the product page, shoppers choose a finish and available storage.'] },
      { title: ['Корзина', 'Bag'], description: ['Конфигурация и количество сохраняются в корзине.', 'The selected configuration and quantity are kept in the bag.'] },
    ], features: [['Каталог и фильтры', 'Catalog and filters'], ['Цвет и память', 'Finish and storage'], ['Сравнение моделей', 'Model comparison'], ['Корзина', 'Shopping bag']],
  },
  'furniture-studio': {
    id: 'furniture-studio', title: ['Мебельный салон', 'Furniture showroom'],
    intro: ['Каталог мебели с фотографиями, описаниями и возможностью изучить предметы в интерьере.', 'A furniture catalog with photography, product details and an interior viewer.'],
    journey: [
      { title: ['Коллекции', 'Collections'], description: ['Покупатель изучает категории мебели и подборки.', 'Shoppers explore furniture categories and collections.'] },
      { title: ['Предмет', 'The piece'], description: ['Фотографии и характеристики помогают рассмотреть товар.', 'Photography and specifications reveal the details of a piece.'] },
      { title: ['Комната', 'The room'], description: ['Планировщик позволяет посмотреть мебель в пространстве и изменить её положение.', 'A room planner lets shoppers view and reposition furniture in a space.'] },
    ], features: [['Каталог мебели', 'Furniture catalog'], ['Фотографии и характеристики', 'Photos and specifications'], ['Просмотр интерьера', 'Interior viewer'], ['Планирование комнаты', 'Room planning']],
  },
  'flower-store': {
    id: 'flower-store', title: ['Магазин цветов', 'Flower shop'],
    intro: ['Цветочные композиции с фотографиями, выбором букета и оформлением заказа.', 'Floral arrangements with photography, bouquet selection and an order flow.'],
    journey: [
      { title: ['Букеты', 'Bouquets'], description: ['Каталог помогает найти композицию для подходящего повода.', 'The catalog helps shoppers find an arrangement for the occasion.'] },
      { title: ['Композиция', 'Arrangement'], description: ['В карточке можно рассмотреть фотографии и детали букета.', 'The product page shows bouquet photos and details.'] },
      { title: ['Заказ', 'Order'], description: ['Выбранный букет можно добавить в корзину и перейти к оформлению.', 'The selected bouquet can be added to the bag for checkout.'] },
    ], features: [['Каталог букетов', 'Bouquet catalog'], ['Фотогалерея', 'Photo gallery'], ['Детали композиции', 'Arrangement details'], ['Корзина', 'Shopping bag']],
  },
  'lumi-studio': {
    id: 'lumi-studio', title: ['Студия красоты', 'Beauty studio'],
    intro: ['Услуги, мастера и запись собраны в одном приложении студии.', 'Services, specialists and booking brought together in one studio app.'],
    journey: [
      { title: ['Услуга', 'Service'], description: ['Клиент выбирает услугу и знакомится с её описанием.', 'Clients explore services and their details.'] },
      { title: ['Мастер', 'Specialist'], description: ['Профили помогают выбрать специалиста для визита.', 'Specialist profiles help clients choose who to visit.'] },
      { title: ['Время', 'Time'], description: ['Запись проходит через выбор даты, времени и проверку деталей.', 'Booking brings together the date, time and appointment details.'] },
    ], features: [['Каталог услуг', 'Services'], ['Профили мастеров', 'Specialist profiles'], ['Выбор времени', 'Time selection'], ['Детали записи', 'Appointment details']],
  },
  'opt-market': {
    id: 'opt-market', title: ['Оптовый магазин', 'Wholesale store'],
    intro: ['Каталог для закупок с товарными карточками и сбором заказа для бизнеса.', 'A wholesale catalog with product details and an order-building flow for businesses.'],
    journey: [
      { title: ['Ассортимент', 'Assortment'], description: ['Партнёр изучает товары и категории каталога.', 'Business shoppers explore products and categories.'] },
      { title: ['Условия', 'Details'], description: ['Карточка помогает ознакомиться с товаром и его ценой.', 'Product pages show item details and pricing.'] },
      { title: ['Закупка', 'Order'], description: ['Выбранные позиции и количества собираются в корзину.', 'Selected items and quantities come together in the bag.'] },
    ], features: [['Каталог товаров', 'Product catalog'], ['Информация о товаре', 'Product details'], ['Выбор количества', 'Quantity selection'], ['Корзина', 'Shopping bag']],
  },
  'jewelry-store': {
    id: 'jewelry-store', title: ['Магазин украшений', 'Jewelry store'],
    intro: ['Коллекция украшений с крупными фотографиями и подробными карточками изделий.', 'A jewelry collection with large photography and detailed product pages.'],
    journey: [
      { title: ['Коллекция', 'Collection'], description: ['Покупатель изучает украшения и подборки.', 'Shoppers explore jewelry and curated selections.'] },
      { title: ['Детали', 'Details'], description: ['Фотографии, материал и размер помогают выбрать изделие.', 'Photography, materials and sizes help shoppers choose.'] },
      { title: ['Корзина', 'Bag'], description: ['Изделие можно сохранить или добавить в корзину.', 'Save a piece or add it to the bag.'] },
    ], features: [['Фотографии украшений', 'Jewelry photography'], ['Материалы и размеры', 'Materials and sizes'], ['Избранное', 'Saved items'], ['Корзина', 'Shopping bag']],
  },
  'medical-center': {
    id: 'medical-center', title: ['Медицинский центр', 'Medical center'],
    intro: ['Услуги, профили специалистов и пошаговый выбор времени приёма.', 'Services, specialist profiles and a step-by-step appointment flow.'],
    journey: [
      { title: ['Услуги', 'Services'], description: ['Пациент знакомится с направлениями и услугами центра.', 'Patients explore the center’s services.'] },
      { title: ['Специалисты', 'Specialists'], description: ['Профили врачей помогают узнать о специалистах.', 'Doctor profiles help patients learn about specialists.'] },
      { title: ['Запись', 'Appointment'], description: ['Выбор услуги, врача и времени собран в последовательный сценарий.', 'Service, doctor and time selection form a simple booking journey.'] },
    ], features: [['Каталог услуг', 'Services'], ['Профили врачей', 'Doctor profiles'], ['Выбор времени', 'Time selection'], ['Детали записи', 'Appointment details']],
  },
  'china-buyer': {
    id: 'china-buyer', title: ['Байер из Китая', 'China sourcing'],
    intro: ['Пространство для изучения образцов, подготовки запроса и сравнения предложений о закупке.', 'A sourcing workspace for exploring samples, preparing a request and comparing offers.'],
    journey: [
      { title: ['Образцы', 'Samples'], description: ['Клиент рассматривает товары, фотографии и детали.', 'Clients explore samples, photography and product details.'] },
      { title: ['Запрос', 'Brief'], description: ['Для закупки можно указать товар, количество и направление доставки.', 'A sourcing brief captures the item, quantity and destination.'] },
      { title: ['Предложения', 'Offers'], description: ['Внесённые предложения можно сравнить по стоимости закупки и доставки.', 'Entered supplier offers can be compared by item and delivery costs.'] },
    ], features: [['Библиотека образцов', 'Sample library'], ['Запрос на закупку', 'Sourcing brief'], ['Выбор страны', 'Destination selection'], ['Сравнение предложений', 'Offer comparison']],
  },
  'skincare-aura': {
    id: 'skincare-aura', title: ['Магазин косметики', 'Skincare store'],
    intro: ['Средства ухода, поиск по каталогу и подбор с учётом потребностей кожи.', 'Skincare products, catalog search and recommendations based on skin needs.'],
    journey: [
      { title: ['Каталог', 'Catalog'], description: ['Покупатель изучает средства и ищет подходящие товары.', 'Shoppers browse and search for skincare products.'] },
      { title: ['Подбор', 'Recommendations'], description: ['Короткие вопросы помогают подобрать средства по потребностям.', 'A short set of questions helps suggest products for individual needs.'] },
      { title: ['Корзина', 'Bag'], description: ['Понравившиеся средства можно сохранить и собрать в корзину.', 'Favorite products can be saved and added to the bag.'] },
    ], features: [['Каталог и поиск', 'Catalog and search'], ['Подбор ухода', 'Skincare recommendations'], ['Избранное', 'Saved items'], ['Корзина', 'Shopping bag']],
  },
};
