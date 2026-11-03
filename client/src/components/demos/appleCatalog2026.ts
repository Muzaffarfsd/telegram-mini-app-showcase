/** Apple product families listed by Apple in November 2026. Prices are illustrative RUB demo values.
 * Images link to Apple-hosted files: use in a public/commercial release requires a rights review.
 * A single photograph may illustrate the family rather than the selected finish or size.
 */
export type AppleCategory = 'iPhone' | 'iPad' | 'Watch' | 'AirPods' | 'Mac' | 'Home' | 'Vision' | 'Аксессуары';
export type AppleCatalogItem = {
  id: string; family: string; name: string; category: AppleCategory; price: number;
  summary: string; colors: string[]; capacities: string[]; image: string; source: string;
  availability: 'available' | 'preorder'; optionLabel?: string;
};

const store = (name:string) => `https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/${name}?wid=940&hei=1112&fmt=png-alpha`;
const apple = (path:string) => `https://www.apple.com${path}`;
const sources = {
  iphone: 'https://www.apple.com/shop/buy-iphone', ipad: 'https://www.apple.com/ipad/compare/',
  watch: 'https://www.apple.com/shop/buy-watch', airpods: 'https://www.apple.com/airpods/',
  mac: 'https://www.apple.com/mac/', home: 'https://www.apple.com/home/', vision: 'https://www.apple.com/apple-vision-pro/specs/',
};
const single = ['Один вариант'];
const defaultColors = ['Стандартный'];
const phoneProColors = ['Бордо', 'Ледниковый', 'Серебристый', 'Чёрный'];
const phoneStorage = ['256 ГБ', '512 ГБ', '1 ТБ'];

export const appleCatalog2026: AppleCatalogItem[] = [
  {id:'iphone-18-pro-max',family:'iphone-18-pro-max',name:'iPhone 18 Pro Max',category:'iPhone',price:169900,summary:'Большой дисплей и система камер Pro.',colors:['Чёрный','Бордо','Ледниковый','Серебристый'],capacities:[...phoneStorage,'2 ТБ'],image:store('iphone-18-pro-max-finish-select-black-202609'),source:sources.iphone,availability:'available'},
  {id:'iphone-18-pro',family:'iphone-18-pro',name:'iPhone 18 Pro',category:'iPhone',price:149900,summary:'Производительность и камера Pro.',colors:phoneProColors,capacities:[...phoneStorage,'2 ТБ'],image:store('iphone-18-pro-finish-select-burgundy-202609'),source:sources.iphone,availability:'available'},
  {id:'iphone-duo',family:'iphone-duo',name:'iPhone Duo',category:'iPhone',price:239900,summary:'Складной iPhone с большим экраном.',colors:['Звёздный белый','Ночное небо'],capacities:[...phoneStorage,'2 ТБ'],image:store('iphone-duo-finish-select-star-white-202609'),source:sources.iphone,availability:'available'},
  {id:'iphone-air',family:'iphone-air',name:'iPhone Air',category:'iPhone',price:129900,summary:'Тонкий и лёгкий iPhone.',colors:['Небесно-голубой','Светло-золотой','Облачный белый','Чёрный космос'],capacities:phoneStorage,image:store('iphone-air-finish-select-skyblue-202509'),source:sources.iphone,availability:'available'},
  {id:'iphone-17',family:'iphone-17',name:'iPhone 17',category:'iPhone',price:99900,summary:'iPhone для каждого дня.',colors:['Лавандовый','Шалфей','Туманный голубой','Белый','Чёрный'],capacities:['256 ГБ','512 ГБ'],image:store('iphone-17-finish-select-lavender-202509_GEO_US'),source:sources.iphone,availability:'available'},
  {id:'iphone-17e',family:'iphone-17e',name:'iPhone 17e',category:'iPhone',price:74900,summary:'Компактный iPhone для повседневных задач.',colors:['Нежно-розовый','Белый','Чёрный'],capacities:['256 ГБ','512 ГБ'],image:store('iphone-17e-finish-select-softpink-202603'),source:sources.iphone,availability:'available'},
  {id:'iphone-16',family:'iphone-16',name:'iPhone 16',category:'iPhone',price:69900,summary:'Знакомый iPhone для каждого дня.',colors:defaultColors,capacities:single,image:store('iphone-16-black-select-202409'),source:sources.iphone,availability:'available'},

  {id:'ipad-pro-13-m5',family:'ipad-pro',name:'iPad Pro 13″ M5',category:'iPad',price:159900,summary:'Большой дисплей и чип M5.',colors:defaultColors,capacities:single,image:store('ipad-pro-13-select-wifi-spaceblack-202405'),source:sources.ipad,availability:'available'},
  {id:'ipad-pro-11-m5',family:'ipad-pro',name:'iPad Pro 11″ M5',category:'iPad',price:129900,summary:'iPad Pro с чипом M5.',colors:defaultColors,capacities:single,image:store('ipad-pro-11-select-wifi-spaceblack-202405'),source:sources.ipad,availability:'available'},
  {id:'ipad-air-13-m4',family:'ipad-air',name:'iPad Air 13″ M4',category:'iPad',price:99900,summary:'Большой экран в тонком корпусе.',colors:defaultColors,capacities:single,image:store('ipad-air-select-13in-wifi-blue-202405'),source:sources.ipad,availability:'available'},
  {id:'ipad-air-11-m4',family:'ipad-air',name:'iPad Air 11″ M4',category:'iPad',price:79900,summary:'Лёгкий iPad Air с чипом M4.',colors:defaultColors,capacities:single,image:store('ipad-air-select-11in-wifi-blue-202405'),source:sources.ipad,availability:'available'},
  {id:'ipad-a16',family:'ipad-a16',name:'iPad A16',category:'iPad',price:49900,summary:'Универсальный iPad с чипом A16.',colors:defaultColors,capacities:['128 ГБ','256 ГБ','512 ГБ'],image:store('ipad-2022-hero-blue-wifi-select'),source:sources.ipad,availability:'available'},
  {id:'ipad-mini-a20',family:'ipad-mini-a20',name:'iPad mini A20 Pro',category:'iPad',price:74900,summary:'Компактный iPad с чипом A20 Pro.',colors:['Тёмная ночь','Сияющая звезда'],capacities:single,image:store('ipad-mini-finish-select-wifi-midnight-202610'),source:sources.ipad,availability:'preorder'},

  {id:'watch-series-12',family:'watch-series-12',name:'Apple Watch Series 12',category:'Watch',price:49900,summary:'Часы для движения и повседневных дел.',colors:defaultColors,capacities:['42 мм','46 мм'],optionLabel:'Корпус',image:store('watch-compare-series-12-202609'),source:sources.watch,availability:'available'},
  {id:'watch-ultra-4',family:'watch-ultra-4',name:'Apple Watch Ultra 4',category:'Watch',price:99900,summary:'Часы для спорта и приключений.',colors:defaultColors,capacities:['49 мм'],optionLabel:'Корпус',image:store('watch-compare-ultra-4-202609'),source:sources.watch,availability:'available'},
  {id:'watch-se-3',family:'watch-se-3',name:'Apple Watch SE 3',category:'Watch',price:29900,summary:'Всё важное на запястье.',colors:defaultColors,capacities:['40 мм','44 мм'],optionLabel:'Корпус',image:store('watch-compare-se-3-202609'),source:sources.watch,availability:'available'},
  {id:'watch-hermes-series-12',family:'watch-hermes-series-12',name:'Apple Watch Hermès Series 12',category:'Watch',price:109900,summary:'Apple Watch в коллекции Hermès.',colors:defaultColors,capacities:single,image:store('watch-card-40-hermes-202609'),source:sources.watch,availability:'available'},
  {id:'watch-hermes-ultra-4',family:'watch-hermes-ultra-4',name:'Apple Watch Hermès Ultra 4',category:'Watch',price:119900,summary:'Apple Watch Ultra в коллекции Hermès.',colors:defaultColors,capacities:single,image:store('watch-card-40-hermes-ultra-202609'),source:sources.watch,availability:'available'},

  {id:'airpods-5',family:'airpods-5',name:'AirPods 5',category:'AirPods',price:16900,summary:'Беспроводные наушники с шумоподавлением.',colors:['Белый'],capacities:single,image:store('airpods-5-hero-select-202609'),source:sources.airpods,availability:'available'},
  {id:'airpods-5-wireless',family:'airpods-5',name:'AirPods 5 с беспроводным зарядным футляром',category:'AirPods',price:18900,summary:'AirPods 5 с беспроводным зарядным футляром.',colors:['Белый'],capacities:single,image:apple('/v/airpods-5/b/images/overview/contrast/airpods_chargingcase_wireless__b41jvywbfgc2_large.png'),source:sources.airpods,availability:'available'},
  {id:'airpods-pro-3',family:'airpods-pro-3',name:'AirPods Pro 3',category:'AirPods',price:29900,summary:'Наушники с активным шумоподавлением.',colors:['Белый'],capacities:single,image:store('airpods-pro-3-hero-select-202509'),source:sources.airpods,availability:'available'},
  {id:'airpods-max-2',family:'airpods-max-2',name:'AirPods Max 2',category:'AirPods',price:64900,summary:'Полноразмерные беспроводные наушники.',colors:['Фиолетовый','Тёмная ночь','Сияющая звезда','Голубой','Оранжевый'],capacities:single,image:apple('/v/airpods/ag/images/overview/airpods_max_purple__d9y3g3n7cnyq_large.png'),source:sources.airpods,availability:'available'},

  {id:'macbook-neo',family:'macbook-neo',name:'MacBook Neo',category:'Mac',price:79900,summary:'Компактный ноутбук Mac.',colors:['Румянец','Серебристый','Цитрус','Индиго'],capacities:single,image:store('macbook-neo-blush-cto-hero-202603'),source:sources.mac,availability:'available'},
  {id:'macbook-air-2026',family:'macbook-air-2026',name:'MacBook Air',category:'Mac',price:139900,summary:'Тонкий и лёгкий MacBook.',colors:['Небесно-голубой','Серебристый','Сияющая звезда','Тёмная ночь'],capacities:['13″','15″'],optionLabel:'Дисплей',image:store('mba13-skyblue-select-202503'),source:sources.mac,availability:'available'},
  {id:'macbook-pro-2026',family:'macbook-pro-2026',name:'MacBook Pro',category:'Mac',price:219900,summary:'Ноутбук для сложных задач.',colors:defaultColors,capacities:['14″','16″'],optionLabel:'Дисплей',image:apple('/assets-www/en_WW/mac/09_product_tile/large/mbp_14_16_fd25cd37a.jpg'),source:sources.mac,availability:'available'},
  {id:'macbook-pro-proled',family:'macbook-pro-proled',name:'MacBook Pro PROLED XDR',category:'Mac',price:329900,summary:'MacBook Pro с дисплеем PROLED XDR.',colors:['Чёрный космос','Серебристый'],capacities:['14″','16″'],optionLabel:'Дисплей',image:apple('/assets-www/en_WW/mac/09_product_tile/large/mbp_proled_04a1179f3.jpg'),source:sources.mac,availability:'preorder'},
  {id:'imac-2026',family:'imac-2026',name:'iMac',category:'Mac',price:179900,summary:'Моноблок для работы и творчества.',colors:defaultColors,capacities:single,image:apple('/assets-www/en_WW/mac/04_product_tile/large/imac_24_7732743f3.jpg'),source:sources.mac,availability:'preorder'},
  {id:'mac-mini-2026',family:'mac-mini-2026',name:'Mac mini',category:'Mac',price:99900,summary:'Настольный Mac в компактном корпусе.',colors:['Серебристый'],capacities:single,image:store('mac-mini-summary-select-202608'),source:sources.mac,availability:'available'},
  {id:'mac-studio-2026',family:'mac-studio-2026',name:'Mac Studio',category:'Mac',price:279900,summary:'Производительный настольный Mac.',colors:['Серебристый'],capacities:single,image:store('mac-studio-summary-select-202608'),source:sources.mac,availability:'available'},
  {id:'studio-display',family:'studio-display',name:'Studio Display',category:'Mac',price:179900,summary:'Дисплей 5K Retina для Mac.',colors:['Серебристый'],capacities:single,image:store('MFF24'),source:sources.mac,availability:'available'},
  {id:'studio-display-xdr',family:'studio-display-xdr',name:'Studio Display XDR',category:'Mac',price:329900,summary:'Дисплей 5K Retina XDR для Mac.',colors:['Серебристый'],capacities:single,image:store('MFEQ4'),source:sources.mac,availability:'available'},

  {id:'homeview',family:'homeview',name:'Apple HomeView',category:'Home',price:89900,summary:'Экран для управления домом.',colors:['Розовый','Серебристый','Сияющая звезда','Серый космос'],capacities:single,image:store('homeview-select-rosepink-202610'),source:sources.home,availability:'preorder'},
  {id:'homeview-wall',family:'homeview-wall',name:'Apple HomeView Wall Mounted',category:'Home',price:89900,summary:'Экран для управления домом с настенным креплением.',colors:['Серебристый','Серый космос'],capacities:single,image:store('homeview-wallmount-select-silver-202610'),source:'https://www.apple.com/shop/buy-home/apple-homeview/apple-homeview-wall-mounted-silver',availability:'preorder'},
  {id:'apple-tv-4k-4',family:'apple-tv-4k-4',name:'Apple TV 4K',category:'Home',price:34900,summary:'Apple TV 4K четвёртого поколения.',colors:['Чёрный'],capacities:single,image:store('apple-tv-4k-hero-select-202610'),source:sources.home,availability:'preorder'},
  {id:'homepod-mini-2',family:'homepod-mini-2',name:'HomePod mini 2',category:'Home',price:14900,summary:'Компактная умная колонка.',colors:defaultColors,capacities:single,image:store('homepod-mini-select-white-202610'),source:sources.home,availability:'available'},
  {id:'homepod',family:'homepod',name:'HomePod',category:'Home',price:34900,summary:'Умная колонка с насыщенным звуком.',colors:defaultColors,capacities:single,image:store('homepod-select-white-202610'),source:sources.home,availability:'available'},
  {id:'vision-pro-m5',family:'vision-pro-m5',name:'Apple Vision Pro M5',category:'Vision',price:399900,summary:'Пространственный компьютер Apple.',colors:defaultColors,capacities:['256 ГБ','512 ГБ','1 ТБ'],image:store('vision-pro-gallery-summary-202510'),source:sources.vision,availability:'available'},
  {id:'airtag-2026',family:'airtag-2026',name:'AirTag',category:'Аксессуары',price:3900,summary:'Метка для поиска вещей.',colors:['Белый'],capacities:['1 шт.','4 шт.'],optionLabel:'Комплект',image:store('airtag-1pack-select-202601'),source:'https://www.apple.com/shop/buy-airtag/airtag/1-pack',availability:'available'},
  {id:'apple-pencil-pro-2024',family:'apple-pencil-pro-2024',name:'Apple Pencil Pro',category:'Аксессуары',price:14900,summary:'Стилус для совместимых моделей iPad.',colors:['Белый'],capacities:single,image:store('MX2D3'),source:'https://www.apple.com/shop/product/mx2d3am/a/apple-pencil-pro',availability:'available'},
  {id:'apple-pencil-usbc-2023',family:'apple-pencil-usbc-2023',name:'Apple Pencil USB‑C',category:'Аксессуары',price:9900,summary:'Стилус с зарядкой USB‑C для совместимых iPad.',colors:['Белый'],capacities:single,image:store('MUWA3'),source:'https://www.apple.com/shop/product/muwa3am/a/apple-pencil-usb-c',availability:'available'},
  {id:'magic-keyboard-usbc-2024',family:'magic-keyboard-usbc-2024',name:'Magic Keyboard USB‑C',category:'Аксессуары',price:12900,summary:'Беспроводная клавиатура для Mac.',colors:['Белый'],capacities:single,image:store('MJLX4'),source:'https://www.apple.com/shop/product/mjlx4ll/a/magic-keyboard-usb-c-us-english',availability:'available'},
];
