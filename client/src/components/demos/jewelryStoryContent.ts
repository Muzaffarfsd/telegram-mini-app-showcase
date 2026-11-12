import type { JewelryProduct } from './jewelryProducts';

type StoryCopy = { heading: string; designTitle: string; designText: string; detailTitle: string; detailText: string };

// Text is based on the product data in jewelryProducts.ts and the cited Tiffany listings.
// The two chapters explain different aspects: form, then material or wearing dimensions.
export const jewelryStoryCopy: Record<string, StoryCopy> = {
  'tiffany-76394164': { heading: 'Ритм звеньев', designTitle: 'Цепь в миниатюре', designText: 'Подвижные звенья micro создают узнаваемый силуэт HardWear в формате кольца.', detailTitle: 'Жёлтое золото', detailText: 'Модель выполнена из золота 18k, без камней: внимание сосредоточено на форме звеньев.' },
  'tiffany-67796772': { heading: 'Точная линия', designTitle: 'Мотив T', designText: 'Графичный мотив Tiffany T T1 становится центральной деталью кольца.', detailTitle: 'Пропорции', detailText: 'Золотая линия шириной 2,5 мм сохраняет изящный масштаб украшения.' },
  'tiffany-76363854': { heading: 'Диалог металлов', designTitle: 'Два оттенка', designText: 'Платина и жёлтое золото 18k соединяются в кольце Sixteen Stone.', detailTitle: 'Узкая форма', detailText: 'Ширина модели составляет 3 мм. В этом варианте камни не указаны.' },
  'tiffany-75981481': { heading: 'Линия крыла', designTitle: 'Мотив Wings', designText: 'Узкое кольцо переосмысляет мотив крыльев коллекции Bird on a Rock.', detailTitle: 'Тёплый металл', detailText: 'Форма выполнена в жёлтом золоте 18k, без камней.' },
  'tiffany-76073929': { heading: 'Контраст в деталях', designTitle: 'Форма Lock', designText: 'Модель small соединяет розовое золото 18k и платину в одном кольце.', detailTitle: 'Бриллиантовый акцент', detailText: 'Общий вес бриллиантов в модели составляет 0,14 карата.' },
  'tiffany-76394555': { heading: 'Графика и цвет', designTitle: 'Звено HardWear', designText: 'Золотое звено размера medium дополнено бирюзовыми элементами.', detailTitle: 'Бирюза', detailText: 'Диаметр бирюзовых элементов — 4–4,5 мм. Основа выполнена из жёлтого золота 18k.' },
  'tiffany-76394571': { heading: 'Звено и жемчуг', designTitle: 'HardWear по-новому', designText: 'Звено medium из жёлтого золота соединено с жемчугом акойя.', detailTitle: 'Размер жемчуга', detailText: 'Диаметр жемчуга в этой модели составляет 4–4,5 мм.' },
  'tiffany-76152535': { heading: 'Свет на звеньях', designTitle: 'Золотой силуэт', designText: 'Серьги HardWear построены вокруг золотого звена размера medium.', detailTitle: 'Бриллианты', detailText: 'Бриллиантовые акценты имеют общий вес 1,02 карата.' },
  'tiffany-76073902': { heading: 'Два металла. Один силуэт.', designTitle: 'Lock в размере small', designText: 'Компактная форма сочетает розовое золото 18k с платиной.', detailTitle: 'Свет бриллиантов', detailText: 'Общий вес бриллиантовых акцентов — 0,05 карата.' },
  'tiffany-75959761': { heading: 'Круг и линия T', designTitle: 'Tiffany T T1', designText: 'Круглая форма дополнена графичным мотивом T и белым перламутром.', detailTitle: 'Маленькие акценты', detailText: 'В жёлтом золоте 18k соединены перламутр и бриллианты общим весом 0,05 карата.' },
  'tiffany-76394490': { heading: 'Бирюза в центре', designTitle: 'Подвеска HardWear', designText: 'Звено medium из жёлтого золота дополнено бирюзой диаметром 4–4,5 мм.', detailTitle: 'Длина цепочки', detailText: 'Регулируемая цепочка позволяет выбрать длину от 15 до 16 дюймов.' },
  'tiffany-76394512': { heading: 'Жемчуг в центре', designTitle: 'Форма HardWear', designText: 'Золотое звено medium соединено с жемчугом акойя 4–4,5 мм.', detailTitle: 'Длина цепочки', detailText: 'Длина цепочки этой подвески регулируется от 15 до 16 дюймов.' },
  'tiffany-76261512': { heading: 'Линия оливы', designTitle: 'Olive Leaf Vine', designText: 'Мотив листьев в версии large выполнен в жёлтом золоте 18k.', detailTitle: 'Длина цепочки', detailText: 'Регулируемая цепочка подвески — от 15 до 17 дюймов.' },
  'tiffany-75959869': { heading: 'Мягкая линия Smile', designTitle: 'Форма и перламутр', designText: 'Мотив medium соединяет розовое золото 18k и белый перламутр.', detailTitle: 'Длина цепочки', detailText: 'Цепочку можно отрегулировать в пределах от 16 до 18 дюймов.' },
  'tiffany-76141231': { heading: 'Перламутр в круге', designTitle: 'Графика T1', designText: 'Круглый мотив из жёлтого золота 18k дополняет белый перламутр.', detailTitle: 'Длина цепочки', detailText: 'У регулируемой цепочки диапазон длины — 16–18 дюймов.' },
  'tiffany-76261881': { heading: 'Звенья и бирюза', designTitle: 'Ритм HardWear', designText: 'Золотые звенья размера small соединены с бирюзой диаметром 8 мм.', detailTitle: 'Посадка', detailText: 'Указан размер medium для запястья до 6,25 дюйма.' },
  'tiffany-75765487': { heading: 'Тонкая цепь', designTitle: 'Звенья micro', designText: 'В браслете HardWear звенья размера micro выполнены из платины.', detailTitle: 'Посадка', detailText: 'Указан размер medium для запястья до 6,25 дюйма.' },
  'tiffany-75766165': { heading: 'Smile в цвете', designTitle: 'Золотой мотив', designText: 'Мотив Smile из жёлтого золота 18k дополнен бриллиантами.', detailTitle: 'Регулируемый шнур', detailText: 'Модель соединена с синим шнуром. Общий вес бриллиантов — 0,03 карата.' },
  'tiffany-75959923': { heading: 'Линия на запястье', designTitle: 'Smile и перламутр', designText: 'В браслете medium розовое золото 18k сочетается с белым перламутром.', detailTitle: 'Посадка', detailText: 'Указанный размер medium рассчитан на запястье до 6,25 дюйма.' },
  'tiffany-75981333': { heading: 'Сияние крыльев', designTitle: 'Мотив Wings', designText: 'Золотой мотив Bird on a Rock соединяется с платиной и бриллиантами pavé.', detailTitle: 'Посадка', detailText: 'Указанный размер medium рассчитан на запястье до 6,25 дюйма.' },
};

export function getJewelryStoryCopy(product: JewelryProduct): StoryCopy {
  return jewelryStoryCopy[product.id] ?? {
    heading: 'Красота в деталях', designTitle: 'Форма украшения', designText: product.story,
    detailTitle: 'Материалы и размер', detailText: `${product.material}. ${product.measurements}.`,
  };
}
