import type { LumiService } from './lumiData';

/** Demonstration choices. Prices and durations are examples, not salon prices. */
export type LumiOptionSelection = Record<string,string>;
export type LumiOption = { id:string; label:string; price:number; minutes:number };
export type LumiOptionGroup = { id:string; title:string; hint?:string; options:LumiOption[] };
const yesNo=(id:string,title:string,value:string,label:string,price:number,minutes:number):LumiOptionGroup=>({id,title,options:[{id:'none',label:'Не добавлять',price:0,minutes:0},{id:value,label,price,minutes}]});
const length=(forColor=false):LumiOptionGroup=>({id:'hair-length',title:'Длина волос',hint:'В демо базовая стоимость рассчитана для коротких волос.',options:[{id:'short',label:'Короткие',price:0,minutes:0},{id:'medium',label:'Средние',price:forColor?1000:500,minutes:30},{id:'long',label:'Длинные',price:forColor?2000:1000,minutes:60}]});
const hairCare=()=>yesNo('hair-care','Дополнительный уход','care','Уход для волос',800,30);
const nailRemoval=()=>yesNo('nail-removal','Снятие покрытия','remove','Снятие покрытия',400,30);
export const lumiOptionGroups:Record<string,LumiOptionGroup[]>={
 cut:[length(),hairCare()],
 color:[length(true),hairCare()],
 manicure:[nailRemoval()],
 coat:[nailRemoval(),yesNo('nail-design','Дизайн ногтей','design','Демонстрационный дизайн',700,30)],
 brows:[yesNo('brow-tint','Дополнительное оформление','tint','Окрашивание бровей',500,30)],
 'brow-lift':[yesNo('brow-tint','Дополнительное оформление','tint','Окрашивание бровей',500,30)],
 face:[yesNo('face-extra','Дополнительный уход','mask','Уходовая маска',600,30)],
};
export function defaultOptions(serviceId:string):LumiOptionSelection{return Object.fromEntries((lumiOptionGroups[serviceId]||[]).map(group=>[group.id,group.options[0].id]));}
/** Reject unknown or outdated choices instead of trusting persisted browser data. */
export function normalizeOptions(serviceId:string,selection?:unknown):LumiOptionSelection{const source=selection&&typeof selection==='object'&&!Array.isArray(selection)?selection as Record<string,unknown>:{};return Object.fromEntries((lumiOptionGroups[serviceId]||[]).map(group=>{const found=group.options.find(option=>option.id===source[group.id]);return [group.id,found?.id||group.options[0].id]}));}
export function optionTotals(service:LumiService,selection?:unknown){const normalized=normalizeOptions(service.id,selection);let price=service.price,minutes=service.minutes;const labels:string[]=[];for(const group of lumiOptionGroups[service.id]||[]){const option=group.options.find(item=>item.id===normalized[group.id])!;price+=option.price;minutes+=option.minutes;if(option.id!=='none')labels.push(`${group.title}: ${option.label}`)}return {price,minutes,labels,selection:normalized};}
