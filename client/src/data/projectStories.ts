export type ProjectStory = {
  id: string;
  title: [string, string];
  intro: [string, string];
  headline: [string, string];
  audience: [string, string];
  businessProblem: [string, string];
  businessValue: Array<{ title: [string, string]; description: [string, string] }>;
  journey: Array<{ title: [string, string]; description: [string, string] }>;
  features: Array<[string, string]>;
};

// Descriptions cover the interactions available in each project, without claims about
// customer outcomes, live payments, delivery, or external services.
export const projectStories: Record<string, ProjectStory> = {
  'muraka-fashion': {
    id: 'muraka-fashion', title: ['Магазин одежды', 'Clothing store'],
    headline: ["От коллекции к заказу с выбранным размером","From collection to an order with the right size"],
    audience: ["Для бренда одежды и мультибрендового магазина","For clothing brands and multi-brand retailers"],
    businessProblem: ["Помочь покупателю найти вещь, рассмотреть её и выбрать размер до оформления заказа.","Help shoppers find a piece, inspect it and choose a size before ordering."],
    businessValue: [
      { title: ["Коллекция ведёт к выбору","From collection to selection"], description: ["Подборки и категории помогают покупателю самостоятельно найти вещь, которую он хочет заказать.","Collections and categories help shoppers find the piece they want to order themselves."] },
      { title: ["Ответы в карточке","Answers on the product page"], description: ["Фото, описание и размеры дают покупателю информацию для выбора ещё до обращения в магазин.","Photos, details and sizes give shoppers the information they need before contacting the store."] },
      { title: ["Выбор собран вместе","The selection in one place"], description: ["В корзине остаются выбранные вещи и размеры — состав заказа легче проверить.","The bag keeps selected items and sizes together so the order can be reviewed."] },
    ],
    intro: ['Коллекция одежды, в которой покупатель рассматривает вещи, выбирает размер и собирает корзину.', 'A clothing collection where shoppers explore pieces, choose a size and build a bag.'],
    journey: [
      { title: ['Коллекция', 'Collection'], description: ['Каталог, категории и поиск помогают найти подходящую вещь.', 'Categories and search help shoppers find a piece.'] },
      { title: ['Детали', 'Details'], description: ['Фотографии, описание и доступные размеры помогают определиться.', 'Photography, descriptions and available sizes help shoppers decide.'] },
      { title: ['Корзина', 'Bag'], description: ['Выбранные вещи и размеры собираются в одном заказе.', 'Selected pieces and sizes come together in one bag.'] },
    ], features: [['Поиск и фильтры', 'Search and filters'], ['Выбор размера', 'Size selection'], ['Избранное', 'Saved items'], ['Корзина', 'Shopping bag']],
  },
  'takt-coffee': {
    id: 'takt-coffee', title: ['Кофейня', 'Coffee bar'],
    headline: ["Кофейня, в которой гость собирает свой заказ","A coffee shop where guests build their order"],
    audience: ["Для кофейни и кафе с самовывозом","For coffee shops and pickup cafés"],
    businessProblem: ["Показать меню и дать гостю настроить напиток, выбрать время получения и собрать заказ.","Present the menu and let guests customize a drink, choose a pickup time and assemble an order."],
    businessValue: [
      { title: ["Меню до обращения","The menu before ordering"], description: ["Гость сам изучает напитки и выпечку по фотографиям и выбирает, что заказать.","Guests explore drinks and pastries by photo and choose what to order themselves."] },
      { title: ["Состав напитка в заказе","The recipe in the order"], description: ["Размер и ингредиенты сохраняются в составе заказа — выбранный рецепт можно проверить.","Size and ingredients stay with the order, so the selected recipe can be reviewed."] },
      { title: ["Время получения заранее","Pickup time upfront"], description: ["Гость выбирает время самовывоза и видит его вместе с составом заказа.","Guests choose a pickup time and see it alongside their order details."] },
      { title: ["Повод вернуться","A reason to return"], description: ["Карта гостя показывает накопленные отметки и награду за напитки.","The guest card shows earned stamps and the drink reward."] },
    ],
    intro: ['Напитки и выпечка, выбор рецепта и удобный сценарий самовывоза.', 'Drinks and pastries, recipe customization and a pickup journey.'],
    journey: [
      { title: ['Меню', 'Menu'], description: ['Гость выбирает напиток или выпечку в каталоге.', 'Guests browse drinks and pastries in the menu.'] },
      { title: ['Свой рецепт', 'Your recipe'], description: ['Для напитка можно настроить размер и доступные ингредиенты.', 'Guests can choose a size and available ingredients.'] },
      { title: ['Самовывоз', 'Pickup'], description: ['Корзина собирает заказ и предлагает выбрать время получения.', 'The bag brings the order together and offers a pickup time.'] },
    ], features: [['Каталог напитков', 'Drinks menu'], ['Настройка рецепта', 'Recipe customization'], ['Выбор времени', 'Pickup time'], ['Карта гостя', 'Guest card']],
  },
  'women-fashion': {
    id: 'women-fashion', title: ['Женская одежда', 'Womenswear'],
    headline: ["Покажите покупателю целый образ","Show customers the complete look"],
    audience: ["Для бренда женской одежды и магазина с коллекциями","For womenswear brands and collection-led stores"],
    businessProblem: ["Показать, как вещи сочетаются между собой, и провести покупателя от вдохновения к выбору.","Show how pieces work together and guide the shopper from inspiration to selection."],
    businessValue: [
      { title: ["Вещи в контексте","Pieces in context"], description: ["Готовые образы помогают покупателю увидеть, какие вещи из коллекции сочетаются между собой.","Complete looks help customers see which pieces in the collection work together."] },
      { title: ["Информация для решения","Details for a decision"], description: ["Фото и размеры доступны в карточке — покупатель может рассмотреть вещь до обращения.","Photos and sizes on the product page let customers examine a piece before getting in touch."] },
      { title: ["Вернуться к выбору","Return to a selection"], description: ["Избранное сохраняет понравившиеся вещи, а корзина собирает выбранные позиции вместе.","Favorites keep appealing pieces close, while the bag brings selected items together."] },
    ],
    intro: ['Коллекции и готовые образы, которые помогают выбрать вещи в одном стиле.', 'Collections and complete looks that help shoppers choose pieces together.'],
    journey: [
      { title: ['Образы', 'Looks'], description: ['Вдохновляющие подборки знакомят с коллекцией.', 'Curated looks introduce the collection.'] },
      { title: ['Вещи', 'Pieces'], description: ['В карточке можно изучить фотографии, описание и размеры.', 'Product pages show photography, descriptions and sizes.'] },
      { title: ['Корзина', 'Bag'], description: ['Понравившиеся вещи можно сохранить или добавить в корзину.', 'Save favorite pieces or add them to the bag.'] },
    ], features: [['Подборки образов', 'Curated looks'], ['Выбор размера', 'Size selection'], ['Избранное', 'Saved items'], ['Корзина', 'Shopping bag']],
  },
  'nike-sneakers': {
    id: 'nike-sneakers', title: ['Магазин кроссовок', 'Sneaker store'],
    headline: ["Покупатель видит пару и выбирает свой размер","Let shoppers find the pair and select their size"],
    audience: ["Для магазина кроссовок и спортивной обуви","For sneaker and athletic footwear stores"],
    businessProblem: ["Показать ассортимент так, чтобы клиент мог выбрать конкретную модель и размер.","Present the range so customers can select a specific model and size."],
    businessValue: [
      { title: ["Проще найти пару","Find the right pair"], description: ["Каталог и подборки помогают покупателю перейти от ассортимента к конкретной модели.","The catalog and collections guide shoppers from the range to a specific model."] },
      { title: ["Детали до заказа","Details before ordering"], description: ["Фотографии и описание дают возможность рассмотреть кроссовки до выбора размера.","Photos and product details let customers examine the sneakers before choosing a size."] },
      { title: ["Модель и размер вместе","Model and size together"], description: ["Выбранный размер остаётся с моделью в корзине — покупателю легче проверить заказ.","The size stays with the selected model in the bag, making the order easier to review."] },
    ],
    intro: ['Каталог кроссовок с подробным просмотром модели и выбором размера.', 'A sneaker catalog with detailed product views and size selection.'],
    journey: [
      { title: ['Каталог', 'Catalog'], description: ['Покупатель просматривает модели и находит нужную пару.', 'Shoppers browse the collection to find a pair.'] },
      { title: ['Модель', 'Product'], description: ['Фотографии и описание показывают детали выбранных кроссовок.', 'Photography and descriptions reveal the details of each pair.'] },
      { title: ['Размер и корзина', 'Size and bag'], description: ['Выбранные модель и размер добавляются в корзину.', 'The chosen model and size are added to the bag.'] },
    ], features: [['Каталог моделей', 'Product catalog'], ['Фотографии товара', 'Product photos'], ['Выбор размера', 'Size selection'], ['Корзина', 'Shopping bag']],
  },
  'apple-store': {
    id: 'apple-store', title: ['Магазин техники Apple', 'Apple device store'],
    headline: ["Помогите выбрать технику по модели и характеристикам","Help customers choose by model and specifications"],
    audience: ["Для магазина смартфонов и электроники","For smartphone and electronics retailers"],
    businessProblem: ["Помочь покупателю разобраться в моделях и выбрать нужную конфигурацию устройства.","Help customers navigate models and choose the configuration they need."],
    businessValue: [
      { title: ["Понятный выбор техники","A clearer device choice"], description: ["Категории помогают покупателю самостоятельно найти нужный тип устройства.","Categories help customers find the type of device they need themselves."] },
      { title: ["Нужная конфигурация","The desired configuration"], description: ["Цвет и память выбираются в карточке — покупатель видит, какой вариант добавляет.","Finish and storage are selected on the product page, making the chosen configuration clear."] },
      { title: ["Заказ можно проверить","A selection to review"], description: ["Модель, конфигурация и количество остаются в корзине для проверки перед оформлением.","The model, configuration and quantity stay in the bag for review before checkout."] },
    ],
    intro: ['Каталог техники с выбором устройства, цвета и объёма памяти.', 'A device catalog with model, finish and storage options.'],
    journey: [
      { title: ['Устройства', 'Devices'], description: ['Покупатель изучает категории и модели в каталоге.', 'Shoppers explore categories and models.'] },
      { title: ['Конфигурация', 'Configuration'], description: ['В карточке можно выбрать цвет и доступную память устройства.', 'On the product page, shoppers choose a finish and available storage.'] },
      { title: ['Корзина', 'Bag'], description: ['Конфигурация и количество сохраняются в корзине.', 'The selected configuration and quantity are kept in the bag.'] },
    ], features: [['Каталог и фильтры', 'Catalog and filters'], ['Цвет и память', 'Finish and storage'], ['Сравнение моделей', 'Model comparison'], ['Корзина', 'Shopping bag']],
  },
  'furniture-studio': {
    id: 'furniture-studio', title: ['Мебельный салон', 'Furniture showroom'],
    headline: ["Покажите мебель в деталях и в пространстве","Show furniture in detail and in a room"],
    audience: ["Для мебельного салона и интерьерного магазина","For furniture showrooms and interior retailers"],
    businessProblem: ["Дать покупателю больше понимания о предмете до обращения: как он выглядит, какие у него размеры и как его разместить.","Give customers a clearer sense of an item before contacting the store: its appearance, dimensions and placement."],
    businessValue: [
      { title: ["Коллекция для выбора","Collections that guide choice"], description: ["Подборки и категории помогают посетителю найти мебель под свою задачу.","Collections and categories help visitors find furniture for their needs."] },
      { title: ["Размеры и детали заранее","Dimensions and details upfront"], description: ["Фото и характеристики помогают покупателю оценить предмет до обращения в салон.","Photos and specifications help customers evaluate a piece before contacting the showroom."] },
      { title: ["Понять размещение","Explore placement"], description: ["В планировщике можно двигать мебель в комнате и оценивать расстановку до выбора.","The room planner lets customers move pieces and explore an arrangement before deciding."] },
    ],
    intro: ['Каталог мебели с фотографиями, описаниями и возможностью изучить предметы в интерьере.', 'A furniture catalog with photography, product details and an interior viewer.'],
    journey: [
      { title: ['Коллекции', 'Collections'], description: ['Покупатель изучает категории мебели и подборки.', 'Shoppers explore furniture categories and collections.'] },
      { title: ['Предмет', 'The piece'], description: ['Фотографии и характеристики помогают рассмотреть товар.', 'Photography and specifications reveal the details of a piece.'] },
      { title: ['Комната', 'The room'], description: ['Планировщик позволяет посмотреть мебель в пространстве и изменить её положение.', 'A room planner lets shoppers view and reposition furniture in a space.'] },
    ], features: [['Каталог мебели', 'Furniture catalog'], ['Фотографии и характеристики', 'Photos and specifications'], ['Просмотр интерьера', 'Interior viewer'], ['Планирование комнаты', 'Room planning']],
  },
  'flower-store': {
    id: 'flower-store', title: ['Магазин цветов', 'Flower shop'],
    headline: ["Пусть клиент выберет букет по фотографии и деталям","Let customers choose a bouquet by photo and details"],
    audience: ["Для цветочной студии и магазина букетов","For florists and bouquet shops"],
    businessProblem: ["Показать цветочные композиции так, чтобы клиент мог выбрать подходящий букет и собрать заказ.","Present floral arrangements so customers can choose a bouquet and put together an order."],
    businessValue: [
      { title: ["Выбор по фотографии","Choose from the photos"], description: ["Каталог помогает клиенту самостоятельно найти композицию к нужному поводу.","The catalog helps customers find an arrangement for the occasion themselves."] },
      { title: ["Понятно, что выбрано","A clearer selection"], description: ["Фотографии и детали букета помогают уточнить выбор до оформления.","Bouquet photos and details help customers confirm their choice before checkout."] },
      { title: ["Букет в заказе","The bouquet in the order"], description: ["Выбранная композиция остаётся в корзине, чтобы клиент мог проверить её перед оформлением.","The selected arrangement stays in the bag so the customer can review it before checkout."] },
    ],
    intro: ['Цветочные композиции с фотографиями, выбором букета и оформлением заказа.', 'Floral arrangements with photography, bouquet selection and an order flow.'],
    journey: [
      { title: ['Букеты', 'Bouquets'], description: ['Каталог помогает найти композицию для подходящего повода.', 'The catalog helps shoppers find an arrangement for the occasion.'] },
      { title: ['Композиция', 'Arrangement'], description: ['В карточке можно рассмотреть фотографии и детали букета.', 'The product page shows bouquet photos and details.'] },
      { title: ['Заказ', 'Order'], description: ['Выбранный букет можно добавить в корзину и перейти к оформлению.', 'The selected bouquet can be added to the bag for checkout.'] },
    ], features: [['Каталог букетов', 'Bouquet catalog'], ['Фотогалерея', 'Photo gallery'], ['Детали композиции', 'Arrangement details'], ['Корзина', 'Shopping bag']],
  },
  'lumi-studio': {
    id: 'lumi-studio', title: ['Студия красоты', 'Beauty studio'],
    headline: ["От выбора услуги к записи на удобное время","From choosing a service to selecting a time"],
    audience: ["Для салона красоты и студии услуг","For beauty salons and service studios"],
    businessProblem: ["Дать клиенту понятный путь к записи: узнать об услуге, выбрать мастера и время.","Give clients a clear booking path: explore a service, choose a specialist and select a time."],
    businessValue: [
      { title: ["Клиент выбирает услугу","Clients choose a service"], description: ["Каталог помогает заранее понять, какую процедуру выбрать для визита.","The service catalog helps clients decide which treatment to choose before a visit."] },
      { title: ["Мастер представлен заранее","Meet the specialist first"], description: ["Профили мастеров помогают клиенту выбрать, к кому он хочет записаться.","Specialist profiles help clients choose who they would like to see."] },
      { title: ["Детали визита вместе","Visit details together"], description: ["В сценарии записи услуга, мастер и время собраны вместе для проверки клиентом.","The booking flow brings service, specialist and time together for the client to review."] },
    ],
    intro: ['Услуги, мастера и запись собраны в одном приложении студии.', 'Services, specialists and booking brought together in one studio app.'],
    journey: [
      { title: ['Услуга', 'Service'], description: ['Клиент выбирает услугу и знакомится с её описанием.', 'Clients explore services and their details.'] },
      { title: ['Мастер', 'Specialist'], description: ['Профили помогают выбрать специалиста для визита.', 'Specialist profiles help clients choose who to visit.'] },
      { title: ['Время', 'Time'], description: ['Запись проходит через выбор даты, времени и проверку деталей.', 'Booking brings together the date, time and appointment details.'] },
    ], features: [['Каталог услуг', 'Services'], ['Профили мастеров', 'Specialist profiles'], ['Выбор времени', 'Time selection'], ['Детали записи', 'Appointment details']],
  },
  'opt-market': {
    id: 'opt-market', title: ['Оптовый магазин', 'Wholesale store'],
    headline: ["Закупка по позициям и коробкам в одном каталоге","Build a wholesale order by product and case"],
    audience: ["Для оптового поставщика и B2B-магазина","For wholesalers and B2B stores"],
    businessProblem: ["Дать партнёру возможность изучить ассортимент и собрать закупку с нужным количеством позиций.","Let business buyers explore the range and assemble an order with the quantities they need."],
    businessValue: [
      { title: ["Ассортимент доступен партнёру","A range buyers can explore"], description: ["Партнёр изучает каталог по категориям и сам находит нужные позиции.","Buyers browse categories and find the products they need themselves."] },
      { title: ["Условия видны в карточке","Details visible upfront"], description: ["Описание товара и цена помогают партнёру оценить позицию до добавления в закупку.","Product details and pricing let buyers evaluate an item before adding it to the order."] },
      { title: ["Закупка по коробкам","Order by the case"], description: ["Количество коробок и состав корзины собраны вместе — закупку можно проверить до оформления.","Case quantities and basket contents are kept together for review before checkout."] },
    ],
    intro: ['Каталог для закупок с товарными карточками и сбором заказа для бизнеса.', 'A wholesale catalog with product details and an order-building flow for businesses.'],
    journey: [
      { title: ['Ассортимент', 'Assortment'], description: ['Партнёр изучает товары и категории каталога.', 'Business shoppers explore products and categories.'] },
      { title: ['Условия', 'Details'], description: ['Карточка помогает ознакомиться с товаром и его ценой.', 'Product pages show item details and pricing.'] },
      { title: ['Закупка', 'Order'], description: ['Выбранные позиции и количества собираются в корзину.', 'Selected items and quantities come together in the bag.'] },
    ], features: [['Каталог товаров', 'Product catalog'], ['Информация о товаре', 'Product details'], ['Выбор количества', 'Quantity selection'], ['Корзина', 'Shopping bag']],
  },
  'jewelry-store': {
    id: 'jewelry-store', title: ['Магазин украшений', 'Jewelry store'],
    headline: ["Дайте рассмотреть украшение до покупки","Let customers explore the details of a piece"],
    audience: ["Для ювелирного бренда и магазина украшений","For jewelry brands and retailers"],
    businessProblem: ["Передать особенности украшения через изображения и детали, чтобы покупатель мог сделать осознанный выбор.","Communicate each piece through imagery and details so shoppers can make an informed choice."],
    businessValue: [
      { title: ["Коллекция крупным планом","A closer look at the collection"], description: ["Фотографии помогают показать изделие так, чтобы клиент мог рассмотреть его до обращения.","Photos give customers a closer look at each piece before they contact the store."] },
      { title: ["Детали для выбора","Details for a decision"], description: ["Материалы и параметры в карточке помогают уточнить, подходит ли украшение.","Materials and product details help customers decide whether a piece is right for them."] },
      { title: ["Вернуться к украшению","Return to a favorite piece"], description: ["Избранное сохраняет выбор клиента, а корзина собирает изделия для дальнейшего оформления.","Favorites keep a customer’s choices close, and the bag brings pieces together for checkout."] },
    ],
    intro: ['Коллекция украшений с крупными фотографиями и подробными карточками изделий.', 'A jewelry collection with large photography and detailed product pages.'],
    journey: [
      { title: ['Коллекция', 'Collection'], description: ['Покупатель изучает украшения и подборки.', 'Shoppers explore jewelry and curated selections.'] },
      { title: ['Детали', 'Details'], description: ['Фотографии, материал и размер помогают выбрать изделие.', 'Photography, materials and sizes help shoppers choose.'] },
      { title: ['Корзина', 'Bag'], description: ['Изделие можно сохранить или добавить в корзину.', 'Save a piece or add it to the bag.'] },
    ], features: [['Фотографии украшений', 'Jewelry photography'], ['Материалы и размеры', 'Materials and sizes'], ['Избранное', 'Saved items'], ['Корзина', 'Shopping bag']],
  },
  'medical-center': {
    id: 'medical-center', title: ['Медицинский центр', 'Medical center'],
    headline: ["Помогите пациенту выбрать услугу и врача","Help patients choose a service and doctor"],
    audience: ["Для медицинского центра и клиники","For clinics and medical centers"],
    businessProblem: ["Сделать путь к записи понятным: показать услуги и специалистов, затем предложить выбрать время.","Make the appointment journey clear: present services and specialists, then offer a time selection."],
    businessValue: [
      { title: ["Понятный выбор услуги","A clearer service choice"], description: ["Пациент может ознакомиться с направлениями и выбрать нужную услугу самостоятельно.","Patients can explore the center’s services and choose one themselves."] },
      { title: ["Врач с профилем","Doctors with profiles"], description: ["Информация о специалистах помогает пациенту определиться, к кому обратиться.","Specialist information helps patients decide whom to see."] },
      { title: ["Проверка деталей записи","Appointment details to review"], description: ["Услуга, врач и время объединены в сценарии записи, чтобы пациент видел свой выбор.","Service, doctor and time come together in the booking flow for the patient to review."] },
    ],
    intro: ['Услуги, профили специалистов и пошаговый выбор времени приёма.', 'Services, specialist profiles and a step-by-step appointment flow.'],
    journey: [
      { title: ['Услуги', 'Services'], description: ['Пациент знакомится с направлениями и услугами центра.', 'Patients explore the center’s services.'] },
      { title: ['Специалисты', 'Specialists'], description: ['Профили врачей помогают узнать о специалистах.', 'Doctor profiles help patients learn about specialists.'] },
      { title: ['Запись', 'Appointment'], description: ['Выбор услуги, врача и времени собран в последовательный сценарий.', 'Service, doctor and time selection form a simple booking journey.'] },
    ], features: [['Каталог услуг', 'Services'], ['Профили врачей', 'Doctor profiles'], ['Выбор времени', 'Time selection'], ['Детали записи', 'Appointment details']],
  },
  'china-buyer': {
    id: 'china-buyer', title: ['Байер из Китая', 'China sourcing'],
    headline: ["От идеи закупки к понятному запросу байеру","Turn a sourcing idea into a clear brief"],
    audience: ["Для байера, закупочного агентства и оптового клиента","For sourcing agents and wholesale buyers"],
    businessProblem: ["Собрать пожелания клиента к товару и сделать предложения поставщиков удобными для сравнения.","Capture the client’s product requirements and make supplier offers easier to compare."],
    businessValue: [
      { title: ["Образцы для обсуждения","Samples for discussion"], description: ["Фотографии и детали дают клиенту и байеру общую основу для выбора товара.","Photos and details give clients and sourcing agents a shared reference when choosing products."] },
      { title: ["Запрос с вводными","A brief with key details"], description: ["Товар, количество и страна доставки собраны в запросе — проще обсудить условия закупки.","Product, quantity and destination are captured in the brief to support a sourcing discussion."] },
      { title: ["Сопоставимые предложения","Offers ready to compare"], description: ["Внесённые вручную цены и доставка представлены вместе для сравнения вариантов закупки.","Manually entered prices and delivery costs are shown together to compare sourcing options."] },
    ],
    intro: ['Пространство для изучения образцов, подготовки запроса и сравнения предложений о закупке.', 'A sourcing workspace for exploring samples, preparing a request and comparing offers.'],
    journey: [
      { title: ['Образцы', 'Samples'], description: ['Клиент рассматривает товары, фотографии и детали.', 'Clients explore samples, photography and product details.'] },
      { title: ['Запрос', 'Brief'], description: ['Для закупки можно указать товар, количество и направление доставки.', 'A sourcing brief captures the item, quantity and destination.'] },
      { title: ['Предложения', 'Offers'], description: ['Внесённые предложения можно сравнить по стоимости закупки и доставки.', 'Entered supplier offers can be compared by item and delivery costs.'] },
    ], features: [['Библиотека образцов', 'Sample library'], ['Запрос на закупку', 'Sourcing brief'], ['Выбор страны', 'Destination selection'], ['Сравнение предложений', 'Offer comparison']],
  },
  'skincare-aura': {
    id: 'skincare-aura', title: ['Магазин косметики', 'Skincare store'],
    headline: ["Помогите клиенту найти подходящий уход","Help customers find a suitable skincare routine"],
    audience: ["Для магазина косметики и бренда ухода","For skincare brands and beauty retailers"],
    businessProblem: ["Помочь с выбором среди средств ухода и показать покупателю подходящие варианты.","Help customers navigate skincare products and discover relevant options."],
    businessValue: [
      { title: ["Средства проще найти","Help customers find products"], description: ["Категории и поиск помогают покупателю самостоятельно ориентироваться в ассортименте.","Categories and search help customers navigate the range on their own."] },
      { title: ["Подбор по потребностям","Guided by skin needs"], description: ["Короткие вопросы помогают показать клиенту варианты ухода, соответствующие его ответам.","A short questionnaire helps show customers product options based on their answers."] },
      { title: ["Выбор под рукой","Keep selections close"], description: ["Избранное и корзина дают возможность сохранить средства и вернуться к выбору.","Favorites and the bag let shoppers save products and return to their selection."] },
    ],
    intro: ['Средства ухода, поиск по каталогу и подбор с учётом потребностей кожи.', 'Skincare products, catalog search and recommendations based on skin needs.'],
    journey: [
      { title: ['Каталог', 'Catalog'], description: ['Покупатель изучает средства и ищет подходящие товары.', 'Shoppers browse and search for skincare products.'] },
      { title: ['Подбор', 'Recommendations'], description: ['Короткие вопросы помогают подобрать средства по потребностям.', 'A short set of questions helps suggest products for individual needs.'] },
      { title: ['Корзина', 'Bag'], description: ['Понравившиеся средства можно сохранить и собрать в корзину.', 'Favorite products can be saved and added to the bag.'] },
    ], features: [['Каталог и поиск', 'Catalog and search'], ['Подбор ухода', 'Skincare recommendations'], ['Избранное', 'Saved items'], ['Корзина', 'Shopping bag']],
  },
};
