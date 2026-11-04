/** Illustrative prices for this offline demo. No values are live Apple prices. */
export type ApplePriceItem={id:string;price:number;capacities:string[];optionLabel?:string};

const memorySteps:Record<string,number>={'128 ГБ':0,'256 ГБ':10000,'512 ГБ':26000,'1 ТБ':44000,'2 ТБ':70000};
const byOption:Record<string,number[]>={
  'Корпус':[0,4000,8000],
  'Дисплей':[0,25000,50000],
  'Комплект':[0,9000,18000]
};

/** Return a deterministic, integer demo price; unknown variants preserve the base. */
export function variantPrice(item:ApplePriceItem,capacity:string):number {
  const base=Number.isSafeInteger(item.price)&&item.price>=0?item.price:0;
  const index=item.capacities.indexOf(capacity);
  if(index<=0)return base;
  const first=item.capacities[0];
  if(first in memorySteps && capacity in memorySteps) return base+Math.max(0,memorySteps[capacity]-memorySteps[first]);
  const steps=byOption[item.optionLabel||''];
  return base+(steps?.[index]??0);
}

/** Short explanations are deliberately generic: a generated image is not a specification. */
export function variantHint(item:ApplePriceItem,capacity:string):string|null {
  const index=item.capacities.indexOf(capacity);
  if(index<0||item.capacities.length<2)return null;
  if(capacity in memorySteps){
    if(index===0)return 'Базовый объём для приложений и повседневных файлов.';
    return 'Больше места для фотографий, видео и других файлов.';
  }
  if(item.optionLabel==='Корпус')return index===0?'Более компактный корпус.':'Более крупный корпус.';
  if(item.optionLabel==='Дисплей')return index===0?'Компактный формат экрана.':'Больше места на экране.';
  if(item.optionLabel==='Комплект')return index===0?'Одна метка в комплекте.':'Больше меток в комплекте.';
  return null;
}
