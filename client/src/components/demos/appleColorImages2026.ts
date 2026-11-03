/** Product finish images found in Apple's own product pages. */
const store = (name:string) => `https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/${name}?wid=940&hei=1112&fmt=png-alpha`;
const airpods = (name:string) => `https://www.apple.com/v/airpods/ag/images/overview/${name}_large.png`;

export const appleColorImages2026:Record<string,Record<string,string>> = {
  'iphone-18-pro-max': {
    'Чёрный':store('iphone-18-pro-max-finish-select-black-202609'), 'Бордо':store('iphone-18-pro-max-finish-select-burgundy-202609'),
    'Ледниковый':store('iphone-18-pro-max-finish-select-glacier-202609'), 'Серебристый':store('iphone-18-pro-max-finish-select-silver-202609'),
  },
  'iphone-18-pro': {
    'Чёрный':store('iphone-18-pro-finish-select-black-202609'), 'Бордо':store('iphone-18-pro-finish-select-burgundy-202609'),
    'Ледниковый':store('iphone-18-pro-finish-select-glacier-202609'), 'Серебристый':store('iphone-18-pro-finish-select-silver-202609'),
  },
  'iphone-duo': {'Звёздный белый':store('iphone-duo-finish-select-star-white-202609'), 'Ночное небо':store('iphone-duo-finish-select-night-sky-202609')},
  'iphone-air': {'Небесно-голубой':store('iphone-air-finish-select-skyblue-202509'), 'Светло-золотой':store('iphone-air-finish-select-lightgold-202509'), 'Облачный белый':store('iphone-air-finish-select-cloudwhite-202509'), 'Чёрный космос':store('iphone-air-finish-select-spaceblack-202509')},
  'iphone-17': {'Лавандовый':store('iphone-17-finish-select-lavender-202509_GEO_US'), 'Шалфей':store('iphone-17-finish-select-sage-202509_GEO_US'), 'Туманный голубой':store('iphone-17-finish-select-mistblue-202509_GEO_US'), 'Белый':store('iphone-17-finish-select-white-202509_GEO_US'), 'Чёрный':store('iphone-17-finish-select-black-202509_GEO_US')},
  'iphone-17e': {'Нежно-розовый':store('iphone-17e-finish-select-softpink-202603'), 'Белый':store('iphone-17e-finish-select-white-202603'), 'Чёрный':store('iphone-17e-finish-select-black-202603')},
  'ipad-mini-a20': {'Тёмная ночь':store('ipad-mini-finish-select-wifi-midnight-202610'), 'Сияющая звезда':store('ipad-mini-finish-select-wifi-starlight-202610')},
  'airpods-max-2': {'Фиолетовый':airpods('airpods_max_purple__d9y3g3n7cnyq'), 'Тёмная ночь':airpods('airpods_max_black__x3byrd2venmu'), 'Сияющая звезда':airpods('airpods_max_stardust__l9lr6719rmaa'), 'Голубой':airpods('airpods_max_blue__fsfaleh1smuu'), 'Оранжевый':airpods('airpods_max_orange__gln3ifz5o9ei')},
  'macbook-neo': {'Румянец':store('macbook-neo-blush-cto-hero-202603'), 'Серебристый':store('macbook-neo-silver-cto-hero-202603'), 'Цитрус':store('macbook-neo-citrus-cto-hero-202603'), 'Индиго':store('macbook-neo-indigo-cto-hero-202603')},
  'macbook-air-2026': {'Небесно-голубой':store('mba13-skyblue-select-202503'), 'Серебристый':store('mba13-silver-select-202503'), 'Сияющая звезда':store('mba15-starlight-select-202503'), 'Тёмная ночь':store('mba13-midnight-select-202503')},
  'macbook-pro-proled': {'Чёрный космос':store('mbp14-proled-spaceblack-cto-hero-202610'), 'Серебристый':store('mbp14-proled-silver-cto-hero-202610')},
  'homeview': {'Розовый':store('homeview-select-rosepink-202610'), 'Серебристый':store('homeview-select-silver-202610'), 'Сияющая звезда':store('homeview-select-starlight-202610'), 'Серый космос':store('homeview-select-spacegray-202610')},
  'homeview-wall': {'Серебристый':store('homeview-wallmount-select-silver-202610'), 'Серый космос':store('homeview-wallmount-select-spacegray-202610')},
};

/** Only include additional angles confirmed to exist for every finish in a family. */
export function appleColorPhotos2026(id:string, color:string):string[] | null {
  const src = appleColorImages2026[id]?.[color];
  if (!src) return null;
  const extras = ['iphone-18-pro-max','iphone-18-pro','iphone-duo','iphone-air'].includes(id) ? ['_AV2','_AV3'] : id === 'iphone-17e' ? ['_AV2'] : [];
  return [src, ...extras.map(suffix => { const u=new URL(src); u.pathname += suffix; return u.toString(); })];
}
