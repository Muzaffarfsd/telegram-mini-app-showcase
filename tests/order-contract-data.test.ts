import test from 'node:test';
import assert from 'node:assert/strict';
import { buildOrderContract, getSupportPackagePreview, type OrderContractInput } from '../client/src/components/orderContractData';

const base: OrderContractInput = {
  direction: 'Цветочный магазин', projectName: 'Сад', includedFeatures: ['Каталог', 'Корзина'],
  extraFeatures: [{ name: 'CRM', price: 25000 }], estimatedTotal: 175000,
  customer: { name: 'ООО «Сад»', taxId: '1234567890', address: 'Адрес клиента', email: 'client@example.com' },
  support: null,
};
const all = (input: OrderContractInput) => buildOrderContract(input).sections.flatMap(section => section.paragraphs).join('\n');
const section = (input: OrderContractInput, prefix: string) => buildOrderContract(input).sections.find(item => item.heading.startsWith(prefix))!;
test('complete draft preserves contract and annexes, customer data and estimated 50/50', () => {
  const draft = buildOrderContract(base); const joined = all(base);
  assert.match(draft.title, /Проект договора/);
  for (let n = 1; n <= 5; n++) assert.ok(draft.sections.some(s => s.heading.startsWith(`Приложение № ${n}.`)));
  assert.match(joined, /ООО «Сад»/); assert.match(joined, /1234567890/);
  assert.match(joined, /Каталог; Корзина/); assert.match(joined, /CRM/);
  assert.match(joined, /предварительн/i); assert.match(joined, /50% согласованной общей цены/);
  assert.equal((joined.match(/87\s?500\s?₽/g) || []).length, 2);
  assert.match(joined, /Музапаров Музаффар Шерзодович/);
  assert.match(joined, /плательщик налога на профессиональный доход/);
  assert.match(section(base, '11. Реквизиты').paragraphs.join(' '), /ИНН \[заполнить\]/);
  assert.match(section(base, '4. Цена').paragraphs.join(' '), /Исполнитель применяет налог на профессиональный доход/);
  assert.doesNotMatch(section(base, '4. Цена').paragraphs.join(' '), /Применяется только если|Неприменимый абзац удалить/);
});
test('monthly support is separate and prepaid for each period', () => {
  const input: OrderContractInput = { ...base, support: { name: 'Стандарт', price: 14900, period: 'month' } };
  assert.match(section(input, 'Приложение № 2.').paragraphs.join(' '), /100% стоимости каждого месяца до начала/);
  assert.match(section(input, 'Приложение № 4.').paragraphs.join(' '), /100% стоимости первого месяца/);
  assert.match(all(input), /не делает её безусловно невозвратной/);
});
test('support previews expand the actual catalogue inheritance and remain preliminary', () => {
  const minimal = { name: 'Минимальный', price: 9900, period: 'month' as const };
  const standard = { name: 'Стандартный', price: 14900, period: 'month' as const };
  const premium = { name: 'Премиум', price: 249000, period: 'year' as const };
  const minimalFeatures = ['Хостинг 99.9%', 'Мелкие правки', 'Email поддержка', 'Ежемесячные бэкапы'];
  const standardFeatures = [...minimalFeatures, 'Приоритетная поддержка', 'Бесплатные обновления', 'Еженедельные бэкапы', 'Ответ за 2 часа'];
  const premiumFeatures = [...standardFeatures, 'Персональный менеджер', 'Бизнес-консультации', 'Ежедневные бэкапы', 'Приоритетные доработки', 'Аналитические отчёты'];
  assert.deepEqual(getSupportPackagePreview(minimal), minimalFeatures);
  assert.deepEqual(getSupportPackagePreview(standard), standardFeatures);
  assert.deepEqual(getSupportPackagePreview(premium), premiumFeatures);
  assert.deepEqual(getSupportPackagePreview(null), []);
  assert.deepEqual(getSupportPackagePreview({ ...minimal, name: 'Неизвестный тариф' }), []);
  const content = section({ ...base, support: premium }, 'Приложение № 4.').paragraphs.join(' ');
  for (const feature of premiumFeatures) assert.ok(content.includes(feature));
  assert.match(content, /Предварительный состав по каталогу/);
  assert.match(content, /не согласованные обязательства/);
  assert.match(content, /рабочие часы, часовой пояс и показатели обслуживания \(SLA\) согласуются/);
  assert.match(content, /время ответа относится к первому ответу, а не к сроку устранения/);
  assert.match(content, /ориентировочно 249\s000 ₽ за год/);
  assert.match(content, /Месячная предоплата не применяется автоматически/);
  assert.doesNotMatch(section({ ...base, support: null }, 'Приложение № 4.').paragraphs.join(' '), /Предварительный состав по каталогу/);
});
test('yearly support does not silently become monthly billing', () => {
  const input: OrderContractInput = { ...base, support: { name: 'Стандарт', price: 149000, period: 'year' } };
  assert.match(section(input, 'Приложение № 2.').paragraphs.join(' '), /за год.*требуют отдельного согласования/);
  assert.match(section(input, 'Приложение № 4.').paragraphs.join(' '), /Месячная предоплата не применяется автоматически/);
  assert.doesNotMatch(section(input, '6. Гарантия').paragraphs.join(' '), /100% предоплаты стоимости каждого месяца/);
});
test('unselected support is not presented as a commitment; calculations round to kopecks', () => {
  const input = { ...base, estimatedTotal: 101.01 };
  assert.match(section(input, 'Приложение № 2.').paragraphs.join(' '), /Поддержка не выбрана/);
  assert.match(all(input), /аванс 50,51 ₽, итоговый платёж 50,5 ₽/);
  assert.throws(() => buildOrderContract({ ...base, estimatedTotal: -1 }), RangeError);
});
test('general contract without a selected order never invents an estimate or fees', () => {
  const input: OrderContractInput = { ...base, direction: '', projectName: '', includedFeatures: [], extraFeatures: [], estimatedTotal: null, customer: {}, support: null };
  const content = all(input);
  const commercial = section(input, 'Приложение № 2.').paragraphs.join(' ');
  const assignment = section(input, 'Приложение № 1.').paragraphs.join(' ');
  assert.match(commercial, /Стоимость разработки не рассчитана/);
  assert.match(commercial, /50% согласованной общей цены/);
  assert.match(commercial, /остальные 50%/);
  assert.match(commercial, /Суммы платежей определяются после согласования стоимости/);
  assert.match(assignment, /Состав функций.*согласовать в техническом задании/);
  assert.doesNotMatch(content, /(?:^|\s)0(?:[,.]0+)?\s*₽/);
  for (let n = 1; n <= 5; n++) assert.ok(buildOrderContract(input).sections.some(s => s.heading.startsWith(`Приложение № ${n}.`)));
});

test('selected custom project retains requested features without fabricating a total', () => {
  const input: OrderContractInput = { ...base, direction:'Мебельный салон', includedFeatures:[], extraFeatures:[{name:'Поиск',price:20000}], estimatedTotal:null, support:null };
  const content = all(input);
  const assignment = section(input,'Приложение № 1.').paragraphs.join(' ');
  const commercial = section(input,'Приложение № 2.').paragraphs.join(' ');
  assert.match(assignment,/Выбранное направление: Мебельный салон/);
  assert.match(assignment,/Поиск — предварительно 20\s000 ₽/);
  assert.match(assignment,/Общая стоимость проекта и размеры платежей подлежат согласованию/);
  assert.match(commercial,/Стоимость разработки не рассчитана/);
  assert.match(commercial,/50% согласованной общей цены/);
  assert.doesNotMatch(content,/(?:^|\s)0(?:[,.]0+)?\s*₽/);
});
