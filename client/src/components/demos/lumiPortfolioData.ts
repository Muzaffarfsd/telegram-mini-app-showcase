export type LumiWork = { id:string; masterId:string; serviceId:string; image:string; title:string; category:string; detail:string };
/** Иллюстративные фотографии для демо, не реальные работы мастеров. */
export const lumiWorks:LumiWork[]=[
 {id:'hair-portrait',masterId:'alina',serviceId:'cut',image:'lumi-v5-hair-portrait.webp',title:'ФОРМА И ДВИЖЕНИЕ',category:'ВОЛОСЫ',detail:'Стрижка и укладка'},
 {id:'hair-craft',masterId:'alina',serviceId:'cut',image:'lumi-v5-hair-craft.webp',title:'ИСКУССТВО ФОРМЫ',category:'ВОЛОСЫ',detail:'Детали работы'},
 {id:'hair-texture',masterId:'alina',serviceId:'color',image:'lumi-v5-hair-texture.webp',title:'СВЕТ И ТЕКСТУРА',category:'ВОЛОСЫ',detail:'Цвет и текстура'},
 {id:'nails-portrait',masterId:'diana',serviceId:'coat',image:'lumi-v5-nails-portrait.webp',title:'ЦВЕТ В ДЕТАЛЯХ',category:'НОГТИ',detail:'Маникюр с покрытием'},
 {id:'nails-craft',masterId:'diana',serviceId:'manicure',image:'lumi-v5-nails-craft.webp',title:'ТОЧНОСТЬ ЛИНИЙ',category:'НОГТИ',detail:'Детали работы'},
 {id:'nails-texture',masterId:'diana',serviceId:'coat',image:'lumi-v5-nails-texture.webp',title:'ФОРМА И ОТТЕНОК',category:'НОГТИ',detail:'Текстура и покрытие'},
 {id:'brows-portrait',masterId:'milana',serviceId:'brows',image:'lumi-v5-brows-portrait.webp',title:'ЕСТЕСТВЕННЫЙ АКЦЕНТ',category:'БРОВИ',detail:'Архитектура бровей'},
 {id:'brows-craft',masterId:'milana',serviceId:'brows',image:'lumi-v5-brows-craft.webp',title:'ИСКУССТВО ЛИНИИ',category:'БРОВИ',detail:'Детали работы'},
 {id:'brows-texture',masterId:'milana',serviceId:'brow-lift',image:'lumi-v5-brows-texture.webp',title:'МЯГКАЯ ФОРМА',category:'БРОВИ',detail:'Укладка бровей'},
 {id:'face-portrait',masterId:'milana',serviceId:'face',image:'lumi-v5-face-portrait.webp',title:'ВРЕМЯ ДЛЯ СЕБЯ',category:'УХОД',detail:'Уход за лицом'},
 {id:'face-craft',masterId:'milana',serviceId:'face',image:'lumi-v5-face-craft.webp',title:'КАЖДОЕ ПРИКОСНОВЕНИЕ',category:'УХОД',detail:'Детали ухода'},
 {id:'face-texture',masterId:'milana',serviceId:'face',image:'lumi-v5-face-texture.webp',title:'РИТУАЛ ЗАБОТЫ',category:'УХОД',detail:'Средства и текстуры'},
];
