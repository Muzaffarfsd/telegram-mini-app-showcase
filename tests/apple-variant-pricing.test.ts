import { test } from 'node:test';
import assert from 'node:assert/strict';
import {variantPrice,variantHint} from '../client/src/components/demos/appleVariantPricing';

test('demo memory pricing tracks the selected capacity, not the first option',()=>{
 const phone={id:'phone',price:100000,capacities:['256 ГБ','512 ГБ','1 ТБ','2 ТБ']};
 assert.deepEqual(phone.capacities.map(x=>variantPrice(phone,x)),[100000,116000,134000,160000]);
 assert.match(variantHint(phone,'2 ТБ')||'',/места/);
 assert.equal(variantPrice(phone,'unknown'),100000);
});
test('demo size and pack prices follow the option type and do not invent unknown variants',()=>{
 const watch={id:'watch',price:49900,capacities:['42 мм','46 мм'],optionLabel:'Корпус'};
 const mac={id:'mac',price:139900,capacities:['13″','15″'],optionLabel:'Дисплей'};
 const pack={id:'airtag',price:3900,capacities:['1 шт.','4 шт.'],optionLabel:'Комплект'};
 assert.equal(variantPrice(watch,'46 мм'),53900);
 assert.equal(variantPrice(mac,'15″'),164900);
 assert.equal(variantPrice(pack,'4 шт.'),12900);
 assert.equal(variantPrice({...pack,optionLabel:'Неизвестно'},'4 шт.'),3900);
 assert.equal(variantHint(pack,'unknown'),null);
});
