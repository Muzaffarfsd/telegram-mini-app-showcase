export type FlowerProductNotes = {title:string; flowers:{name:string; detail:string}[]; care:string};

const rose = {name:'Розы',detail:'Лепестки раскрываются слоями, постепенно меняя очертание бутона.'};
const whiteRose = {name:'Белые розы',detail:'Светлые лепестки складываются в плотный бутон и постепенно раскрываются.'};
const redRose = {name:'Красные розы',detail:'Насыщенный оттенок подчёркивает многослойную форму раскрывающихся лепестков.'};
const eustoma = {name:'Эустома',detail:'Нежные цветки и небольшие бутоны добавляют композиции воздушности.'};
const sunflower = {name:'Подсолнухи',detail:'Крупные соцветия с тёмной серединой и жёлтыми краевыми лепестками создают яркий акцент.'};
const peony = {name:'Пионы',detail:'Многослойные лепестки раскрываются в объёмные округлые цветки; рядом остаются бутоны.'};
const tulip = {name:'Тюльпаны',detail:'Гладкие лепестки образуют вытянутые бутоны, а листья подчёркивают линию стеблей.'};
const water = 'Обновляйте срезы, меняйте воду и держите букет вдали от солнца и источников тепла.';
const basket = 'Если цветы закреплены во флористической губке, уточните у флориста способ её увлажнения. Держите композицию вдали от солнца и тепла.';

// The descriptions follow the illustrative compositions in flowerPopularV5; actual flowers and substitutions require confirmation.
export const flowerProductNotes:Record<string,FlowerProductNotes> = {
 'popular-sunflower-basket':{title:'Солнце и нежность',flowers:[sunflower,whiteRose],care:basket},
 'popular-vase-roses':{title:'Лепестки и лёгкость',flowers:[rose,eustoma],care:'Следите за чистотой воды в вазе, обновляйте срезы и держите цветы вдали от солнца и тепла.'},
 'popular-pink-rose-basket':{title:'Розы и эустома',flowers:[rose,eustoma],care:basket},
 'popular-red-roses':{title:'Роза крупным планом',flowers:[redRose],care:water},
 'popular-pink-mix':{title:'Три цветочные фактуры',flowers:[rose,{name:'Гвоздики',detail:'Волнистые края лепестков создают мягкую рельефную фактуру.'},eustoma],care:water},
 'popular-white-roses':{title:'Роза крупным планом',flowers:[whiteRose],care:water},
 'popular-red-white-roses':{title:'Контраст лепестков',flowers:[redRose,whiteRose],care:water},
 'popular-pink-peonies':{title:'Пион крупным планом',flowers:[peony],care:'Пионам нужна чистая вода: обновляйте срезы и держите букет в прохладе, вдали от прямого солнца.'},
 'popular-agent-peonies':{title:'Объём пиона',flowers:[peony],care:'Пионам нужна чистая вода: обновляйте срезы и держите букет в прохладе, вдали от прямого солнца.'},
 'popular-pink-tulips':{title:'Линии тюльпанов',flowers:[tulip],care:'Меняйте воду и обновляйте срезы. Тюльпаны могут продолжать расти и менять наклон стеблей в вазе.'},
 'popular-tulips':{title:'Цвет и форма',flowers:[tulip],care:'Меняйте воду и обновляйте срезы. Тюльпаны могут продолжать расти и менять наклон стеблей в вазе.'},
 'popular-blue-hydrangeas':{title:'Облако и бутон',flowers:[{name:'Гортензии',detail:'Множество мелких цветков объединены в округлые пышные соцветия.'},whiteRose],care:'Следите за уровнем чистой воды, обновляйте срезы и держите композицию в прохладе; детали ухода уточните у флориста.'},
 'popular-chrysanthemums':{title:'Небольшие соцветия',flowers:[{name:'Хризантемы',detail:'Белые краевые лепестки окружают жёлтую серединку каждого небольшого соцветия.'}],care:water},
 'popular-eustoma':{title:'Цветы и бутоны',flowers:[eustoma],care:water},
 'popular-gerberas':{title:'Открытая форма',flowers:[{name:'Герберы',detail:'Открытые соцветия с центральным диском и длинными лепестками создают выразительный силуэт.'}],care:'Следите за чистотой воды и стеблей, обновляйте срезы; рекомендации по конкретному букету уточните у флориста.'},
 'popular-sunflowers':{title:'Солнечный акцент',flowers:[sunflower,whiteRose],care:water},
 'popular-white-lilies':{title:'Лилия крупным планом',flowers:[{name:'Лилии',detail:'Крупные раскрытые цветки сочетаются с вытянутыми бутонами и длинными листьями.'}],care:'Меняйте воду и обновляйте срезы; аромат и пыльца лилий могут быть выраженными. Уточните уход у флориста.'}
};
