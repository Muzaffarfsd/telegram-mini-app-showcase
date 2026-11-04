import type {FlowerCatalogItem} from './FlowerCatalogV2';

export type FlowerHomeRefItem = FlowerCatalogItem & {homeImage:string};
const entry=(id:string,name:string,category:string,price:number,subtitle:string,composition:string,description:string,moods:string[],tone:string,occasion:string[]):FlowerHomeRefItem=>{
 const root=`/flower-store/ref-home/${id}`;const variant=id==='ref-pink-basket'?'-v2':'';
 return {id,name,category,price,subtitle,composition,description,moods,tone,occasion,homeImage:`${root}.webp`,images:[`${root}.webp`,`${root}-scale${variant}.webp`,`${root}-detail${variant}.webp`]};
};
export const flowerHomeRefItems:FlowerHomeRefItem[]=[
 entry('ref-sun-basket','Солнечная корзина','Корзины',7900,'Яркая композиция в плетёной корзине','Ранункулюсы, розы, подсолнухи и плетёная корзина.','Яркая цветочная композиция с корзиной на фото; её комплектацию необходимо уточнить.',['Яркие'],'Жёлтый',['В подарок','День рождения']),
 entry('ref-vase','Цветочная история','Вазы',8900,'Розовые цветы в прозрачной вазе','Розовые лилии и розы в прозрачной вазе.','Цветочная композиция с лилиями и розами; комплектацию вазы необходимо уточнить.',['Нежные'],'Розовый',['В подарок','Для дома']),
 entry('ref-pink-basket','Нежная корзина','Корзины',8200,'Розовые цветы в плетёной корзине','Розовые розы, ранункулюсы, белая эустома и плетёная корзина.','Нежная цветочная композиция в корзине; комплектацию корзины необходимо уточнить.',['Нежные'],'Розовый',['В подарок','День рождения']),
 entry('ref-red-rose','Красные розы','Розы',7600,'Выразительный букет садовых роз','Красные садовые розы и зелень.','Композиция красных роз — выразительный цвет и живые лепестки.',['Яркие'],'Красный',['В подарок','День рождения']),
 entry('ref-spring','Летний букет','Сборные',6900,'Светлая и яркая цветочная композиция','Разноцветные цветы и стеклянная ваза на фото.','Цветочная композиция в стеклянной вазе; комплектацию вазы необходимо уточнить.',['Яркие'],'Разноцветный',['В подарок','Без повода'])
];
