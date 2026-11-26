import type { Copy } from './samples';

type Profile = {
  colour: Copy;
  swatch: string;
  story: Copy;
  measure: Copy;
  inspect: Copy;
};
export const sampleProfiles: Record<string, Profile> = {
  fold: {
    colour: ['Кобальт', 'Cobalt'],
    swatch: '#264b89',
    story: [
      'Плоская сумка ложится близко к телу. Тёмный ремень и красный хвостик молнии выделяются на синей клетке рипстопа.',
      'A flat crossbody that sits close to the body. Dark webbing and a red zip pull stand out against the cobalt ripstop grid.',
    ],
    measure: [
      'Ширина и высота корпуса, глубина дна и длина ремня в крайних положениях.',
      'Body width and height, base depth, shortest and longest strap settings.',
    ],
    inspect: [
      'Попросите открыть сумку и показать закрепки ремня под нагрузкой.',
      'Ask to see the bag open and the strap anchors under tension.',
    ],
  },
  arc: {
    colour: ['Матовый никель', 'Brushed nickel'],
    swatch: '#a9aaae',
    story: [
      'Светлый купол подвешен к тонкой дуге. Радиальная шлифовка улавливает свет, а низкое основание оставляет стол открытым.',
      'A pale dome hangs from a slender arc. Circular brushing catches the light above a low-profile base.',
    ],
    measure: [
      'Высота лампы, диаметр основания и вылет плафона над столом.',
      'Overall height, base diameter and horizontal reach of the shade.',
    ],
    inspect: [
      'Попросите фото маркировки блока питания, вилки и включённой лампы на белой стене.',
      'Request the power rating, plug and a photograph of the beam on a white wall.',
    ],
  },
  clay: {
    colour: ['Терракота', 'Terracotta'],
    swatch: '#a85b3d',
    story: [
      'Низкий округлый чайник и небольшая пиала образуют пару. Неглазурованная на вид поверхность раскрывается вблизи.',
      'A low round teapot sits alongside a small cup. The close-up shows the grain of its unglazed-looking surface.',
    ],
    measure: [
      'Объём чайника и пиалы, ширина с носиком и ручкой.',
      'Capacity of pot and cup, and width including spout and handle.',
    ],
    inspect: [
      'Попросите видео налива, крупный план кромки и упаковку каждого предмета.',
      'Ask for a pouring video, a rim close-up and the packaging for each piece.',
    ],
  },
  'inspection-backpack': {
    colour: ['Чернильно-синий', 'Ink navy'],
    swatch: '#26354c',
    story: [
      'Городской рюкзак с округлым верхом и отдельным карманом спереди. Обратный ракурс показывает посадку двух мягких лямок.',
      'A rounded city backpack with a separate front pocket. The rear view shows the placement of the two padded straps.',
    ],
    measure: [
      'Высота и ширина спинки, глубина дна и полезный проём отделения.',
      'Back panel height and width, base depth and usable compartment opening.',
    ],
    inspect: [
      'Попросите проверить бегунки и снять крупно швы обеих лямок на одном образце.',
      'Ask for a zip test and close-ups of both strap seams on the same sample.',
    ],
  },
  'v5-feature': {
    colour: ['Бордо', 'Bordeaux'],
    swatch: '#743843',
    story: [
      'Мягкая сумка вытянутой формы держится на тонком ремне. Плавную верхнюю линию подчёркивает гладкая бордовая поверхность.',
      'A slim strap carries the elongated soft body. Smooth Bordeaux surfaces follow the curved top edge.',
    ],
    measure: [
      'Высота ручки над краем, ширина корпуса и длина входа.',
      'Handle drop, body width and length of the opening.',
    ],
    inspect: [
      'Попросите проверить крепление колец и показать цвет с обеих сторон при дневном свете.',
      'Request a ring attachment check and daylight photographs of both sides.',
    ],
  },
  'v4-coat': {
    colour: ['Слоновая кость', 'Ivory'],
    swatch: '#e2d9c7',
    story: [
      'Свободное светлое пальто собирается поясом. Широкий лацкан и мягкий ворс особенно хорошо читаются в боковом свете.',
      'An easy ivory coat closes with a belt. Side light brings out the broad lapel and brushed nap.',
    ],
    measure: [
      'Длина по спинке, обхват груди изделия, ширина плеч и длина рукава.',
      'Back length, garment chest circumference, shoulder width and sleeve length.',
    ],
    inspect: [
      'Запросите фото подкладки, состав с ярлыка и край борта в расстёгнутом виде.',
      'Ask for the lining, the fibre label and the inside of the open placket.',
    ],
  },
  'v4-bag': {
    colour: ['Винный', 'Wine'],
    swatch: '#63333d',
    story: [
      'Чёткий трапециевидный силуэт и короткая ручка. Конверт клапана замыкается небольшим квадратом матового металла.',
      'A crisp trapezoid with a short handle. A small brushed-metal square closes the envelope flap.',
    ],
    measure: [
      'Ширина основания, глубина боковины и просвет под ручкой.',
      'Base width, gusset depth and clearance under the handle.',
    ],
    inspect: [
      'Попросите открыть и закрыть замок на видео и показать обработку нижних углов.',
      'Ask to see the clasp working and the finishing on the lower corners.',
    ],
  },
  tailoring: {
    colour: ['Графит', 'Graphite'],
    swatch: '#43454a',
    story: [
      'Двубортный жакет с очерченной линией плеча. Узкий рисунок переплетения проявляется крупным планом у лацкана.',
      'A double-breasted jacket with a defined shoulder line. A close shot at the lapel reveals the fine weave.',
    ],
    measure: [
      'Плечи, полуобхват груди, длина по спинке и рукав от плечевого шва.',
      'Shoulder width, half chest, centre back length and sleeve from shoulder seam.',
    ],
    inspect: [
      'Попросите замеры в застёгнутом виде, фото шлицы, подкладки и ярлыка состава.',
      'Ask for measurements with buttons closed, plus the vent, lining and fibre label.',
    ],
  },
  bag: {
    colour: ['Карамель', 'Caramel'],
    swatch: '#a76d42',
    story: [
      'У прямоугольной сумки две длинные ручки. Светлая строчка обводит места их крепления на карамельной поверхности.',
      'Two long handles frame this rectangular tote. Pale stitching outlines their attachment points on the caramel surface.',
    ],
    measure: [
      'Длина ручек, ширина дна, высота и ширина входа.',
      'Handle length, base width, height and width of the opening.',
    ],
    inspect: [
      'Попросите показать внутренний карман и обе стороны каждой ручки.',
      'Ask to see the inside pocket and both sides of each handle.',
    ],
  },
  sneaker: {
    colour: ['Мел и серый', 'Chalk and grey'],
    swatch: '#bdbab4',
    story: [
      'Низкие кроссовки сочетают светлую сетку и ворсовые накладки. Медовый край подошвы очерчивает профиль пары.',
      'Low trainers combine pale mesh with napped overlays. A gum outsole traces the profile.',
    ],
    measure: [
      'Длина стельки в сантиметрах и ширина в пучках для выбранного размера.',
      'Insole length in centimetres and width across the forefoot in the requested size.',
    ],
    inspect: [
      'Попросите снять стельку с линейкой и показать симметрию носков и швов.',
      'Ask for a ruler alongside the insole and a front view of both toe boxes and seams.',
    ],
  },
  wardrobe: {
    colour: ['Индиго и молочный', 'Indigo and cream'],
    swatch: '#34475d',
    story: [
      'Три слоя собраны вокруг тёмной рубашки. Кремовый трикотаж смягчает плотный деним, а прямые брюки продолжают спокойный силуэт.',
      'A dark overshirt anchors three easy layers. Cream knit softens the denim above straight trousers.',
    ],
    measure: [
      'Замеры каждого предмета отдельно, включая талию и шаговый шов брюк.',
      'Measurements for each piece, including trouser waist and inseam.',
    ],
    inspect: [
      'Попросите перечислить, какие вещи входят в предложение, и дать цену каждой.',
      'Ask which garments are included in the offer and the price of each.',
    ],
  },
  burgundy: {
    colour: ['Тёмная вишня', 'Dark cherry'],
    swatch: '#6b3340',
    story: [
      'Небольшая сумка-кисет собирается мягкими складками у горловины. Узкий шнур огибает корпус и задаёт форму.',
      'The pouch gathers into soft folds at the opening. A narrow drawcord shapes the body.',
    ],
    measure: [
      'Диаметр основания, высота и ширина раскрытой горловины.',
      'Base diameter, height and width of the opening with the cord released.',
    ],
    inspect: [
      'Попросите несколько раз затянуть шнур и показать его выходы из кулисы.',
      'Ask to see the cord pulled a few times and its exit points in the casing.',
    ],
  },
  loafers: {
    colour: ['Чёрный', 'Black'],
    swatch: '#2c2b2e',
    story: [
      'Лоферы на низком каблуке с гладким верхом. Объёмный шов вдоль мыска и перемычка создают характерный профиль.',
      'Low-heeled loafers with a smooth upper. The apron seam and saddle strap define the toe.',
    ],
    measure: [
      'Длина стельки, полнота и высота подъёма для нужного размера.',
      'Insole length, width fitting and instep height for the requested size.',
    ],
    inspect: [
      'Попросите снять сгиб пары, шов мыска и место соединения верха с подошвой.',
      'Ask to see the flex point, apron seam and the upper-to-sole join.',
    ],
  },
  accessory: {
    colour: ['Дымчато-синий', 'Smoke blue'],
    swatch: '#465b79',
    story: [
      'Угловатая полупрозрачная оправа смягчается скруглениями. Свет проходит сквозь синий ацетатный на вид край дужки.',
      'Soft corners temper the angular translucent frame. Light passes through the smoky blue, acetate-like temple edge.',
    ],
    measure: [
      'Ширина линзы, мостика и рамки целиком, длина дужки.',
      'Lens width, bridge width, overall frame width and temple length.',
    ],
    inspect: [
      'Попросите маркировку линз и фото петель. Степень защиты должен подтвердить поставщик.',
      'Ask for lens markings and hinge photos. The supplier should confirm the protection rating.',
    ],
  },
  home: {
    colour: ['Меловой белый', 'Chalk white'],
    swatch: '#e9e7df',
    story: [
      'Асимметричный сосуд с защипом горловины. Мелкие тёмные точки прерывают мягкую белую поверхность.',
      'An asymmetric vessel with a pinched lip. Fine dark speckles interrupt the chalk-white surface.',
    ],
    measure: [
      'Высота, ширина в самой объёмной части и диаметр горловины.',
      'Height, widest body measurement and mouth diameter.',
    ],
    inspect: [
      'Попросите фото дна и уточните, удерживает ли сосуд воду при длительном наполнении.',
      'Ask for a base photo and whether the vessel holds water for extended periods.',
    ],
  },
  'v2-coat': {
    colour: ['Ночной синий', 'Midnight navy'],
    swatch: '#273249',
    story: [
      'Длинный прямой силуэт и сдержанный лацкан. Плотная тёмная поверхность делает линию застёжки почти незаметной.',
      'A long straight silhouette and restrained lapel. Dense navy texture softens the front fastening line.',
    ],
    measure: [
      'Длина спинки, ширина плеч и обхват груди поверх выбранного слоя.',
      'Back length, shoulders and garment chest over the intended layer.',
    ],
    inspect: [
      'Запросите фото застёжки и подкладки, проверьте ход шлицы при шаге.',
      'Ask to see the fastening and lining, and check how the vent opens when walking.',
    ],
  },
  'v2-knit': {
    colour: ['Овсяный меланж', 'Oat melange'],
    swatch: '#c5b8a4',
    story: [
      'Мягкий кардиган с округлой горловиной и тёмными пуговицами. Рельефная вязка заметнее всего на манжете.',
      'A soft round-neck cardigan with dark buttons. The cuff shows the raised rib in close-up.',
    ],
    measure: [
      'Полуобхват груди и длина без растяжения, рукав и манжета.',
      'Half chest and length without stretching, plus sleeve and cuff measurements.',
    ],
    inspect: [
      'Попросите состав пряжи, ярлык ухода и крупный план петли для пуговицы.',
      'Request yarn composition, the care label and a close view of a buttonhole.',
    ],
  },
  'v2-bag-sculpted': {
    colour: ['Тауп', 'Taupe'],
    swatch: '#9e9288',
    story: [
      'Скульптурный корпус с прямоугольной ручкой. Сложенные боковины работают как объёмные бумажные сгибы.',
      'A sculptural body with a rectangular handle. Its folded gussets recall the creases in paper.',
    ],
    measure: [
      'Ширина дна и верха, глубина складки и ширина ручки изнутри.',
      'Base and top widths, gusset depth and inner handle width.',
    ],
    inspect: [
      'Попросите фото пустой сумки сбоку и развернутой боковины.',
      'Ask to see the empty bag from the side and the gusset unfolded.',
    ],
  },
  'v2-bag-burgundy': {
    colour: ['Слива', 'Plum'],
    swatch: '#583847',
    story: [
      'Изогнутый корпус-полумесяц и тонкий регулируемый ремень. Мелкая строчка следует контуру нижней дуги.',
      'A crescent-shaped body hangs from a slim adjustable strap. Fine stitching follows the lower curve.',
    ],
    measure: [
      'Ширина от края до края, глубина по центру и диапазон ремня.',
      'Tip-to-tip width, centre depth and strap adjustment range.',
    ],
    inspect: [
      'Попросите фото отверстий ремня и нижнего шва у обеих боковин.',
      'Ask for strap holes and the lower seam at each side.',
    ],
  },
  'v2-boots': {
    colour: ['Чернильный чёрный', 'Ink black'],
    swatch: '#303038',
    story: [
      'Короткие ботильоны с боковой молнией. Устойчивый прямой каблук уравновешивает вытянутую линию мыска.',
      'Ankle boots with a side zip. A straight block heel balances the elongated toe line.',
    ],
    measure: [
      'Длина стельки, обхват и высота голенища, высота каблука.',
      'Insole length, shaft circumference and height, and heel height.',
    ],
    inspect: [
      'Попросите видео молнии в движении и фото набойки и внутреннего шва.',
      'Ask for the zip in motion, the heel cap and the inside seam.',
    ],
  },
  'v2-slingbacks': {
    colour: ['Молочный и шоколад', 'Ivory and chocolate'],
    swatch: '#e5dbc9',
    story: [
      'Светлые туфли с открытой пяткой и заострённым мысом. Тёмный каблук задаёт контраст в профиль.',
      'Ivory slingbacks with a pointed toe. The dark heel introduces contrast in profile.',
    ],
    measure: [
      'Длина стельки, ширина мыска и диапазон заднего ремешка.',
      'Insole length, toe-box width and rear strap adjustment.',
    ],
    inspect: [
      'Попросите проверить фиксацию ремешка на пятке и показать обе набойки.',
      'Ask for a strap fit check at the heel and photographs of both heel caps.',
    ],
  },
  'v2-scarf': {
    colour: ['Ультрамарин', 'Ultramarine'],
    swatch: '#304888',
    story: [
      'Синяя волна переходит через складку молочного полотна. Тонкий подрубленный край сохраняет лёгкую линию платка.',
      'An ultramarine wave crosses the folds of ivory fabric. A finely rolled edge keeps the scarf light.',
    ],
    measure: [
      'Длина каждой стороны в разложенном виде и ширина подгибки.',
      'Each side measured flat and width of the rolled hem.',
    ],
    inspect: [
      'Попросите показать оборот принта, углы и ярлык с волокнистым составом.',
      'Ask for the reverse of the print, the corners and the fibre label.',
    ],
  },
  'v2-earrings': {
    colour: ['Серебристый', 'Silver tone'],
    swatch: '#b2b5bb',
    story: [
      'Изогнутые формы напоминают сложенные металлические ленты. Полированная поверхность меняет рисунок при повороте.',
      'Curved forms recall folded metal ribbons. Reflections shift as the polished pieces turn.',
    ],
    measure: [
      'Длина, максимальная ширина и вес одной серьги.',
      'Length, widest point and weight of a single earring.',
    ],
    inspect: [
      'Попросите показать застёжки пары и уточнить металл и покрытие у поставщика.',
      'Ask to see both fasteners and confirm the base metal and finish with the supplier.',
    ],
  },
  'v2-teaware': {
    colour: ['Ледяной голубой', 'Ice blue'],
    swatch: '#bad3e5',
    story: [
      'Гайвань с крышкой, блюдце и две пиалы объединены светло-голубой глазурью. Свет собирается на тонких кромках.',
      'A lidded gaiwan, saucer and two cups share an ice-blue glaze. Light picks up their fine rims.',
    ],
    measure: [
      'Полезный объём гайвани и пиал, диаметр блюдца.',
      'Usable volume of the gaiwan and cups, and saucer diameter.',
    ],
    inspect: [
      'Попросите пересчитать предметы, показать посадку крышки и прокладки в коробке.',
      'Ask for a piece count, the lid fit and the separators in the box.',
    ],
  },
  'v2-lamp': {
    colour: ['Опал и дуб', 'Opal and oak'],
    swatch: '#d8c5a7',
    story: [
      'Полусфера опалового стекла опирается на короткое деревянное основание. В выключенном виде видна граница двух материалов.',
      'An opal hemisphere sits on a short wood base. The join between the two materials is visible with the lamp switched off.',
    ],
    measure: [
      'Высота, диаметр плафона, диаметр основания и длина кабеля.',
      'Height, shade and base diameters, and cable length.',
    ],
    inspect: [
      'Попросите фото включённого рассеивателя и уточните тип лампы, вилки и заменяемость.',
      'Ask to see the diffuser lit and confirm the bulb, plug and whether the light source is replaceable.',
    ],
  },
};
