import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  drinks,
  classic,
  activeGroups,
  validRecipe,
  validSelection,
  price,
  recipeKey,
  recipeParts,
} from '../client/src/components/demos/coffee/menu';
import {
  pickupTimes,
  timeOf,
  availablePickup,
  clubBalance,
  availableDiscount,
  ticketTotal,
  type Ticket,
} from '../client/src/components/demos/coffee/orders';

test('all house recipes match the menu and exclude incompatible customisations', () => {
  for (const d of drinks) {
    const r = classic(d.id);
    assert.ok(validRecipe(r));
    assert.equal(price(r), d.price);
    assert.equal(activeGroups(d.id).includes('milk'), d.milk);
    assert.equal(activeGroups(d.id).includes('foam'), d.foam);
    assert.ok(recipeParts(r, 'en').join(' ').includes('ml'));
    assert.ok(recipeParts(r, 'ru').join(' ').includes('мл'));
  }
  const black = classic('americano');
  assert.equal(recipeKey(black), recipeKey({ ...black, milk: 'oat' }));
  assert.equal(price(black), price({ ...black, milk: 'oat' }));
  assert.equal(validRecipe({ ...black, ml: 999 }), false);
  assert.equal(validRecipe({ ...black, drink: '__proto__' }), false);
  assert.equal(validRecipe({ ...black, syrup: 'missing' }), false);
});
test('a full custom cup is priced identically in menu, bag and repeat orders', () => {
  const r = {
    ...classic('cappuccino'),
    ml: 350,
    milk: 'oat',
    syrup: 'vanilla',
    beans: 'fruit',
    shot: 'extra',
  };
  assert.equal(price(r), 370);
  assert.match(recipeParts(r, 'ru').join(', '), /Овсяное молоко/);
  assert.notEqual(recipeKey(r), recipeKey({ ...r, syrup: 'caramel' }));
});
test('paper-menu recipes retain existing orders and distinguish sugar and latte art', () => {
  const original = classic('cappuccino');
  assert.ok(validRecipe(original));
  assert.equal(
    recipeKey({ ...original, sugar: 'unsweetened', latteArt: 'plain' }),
    recipeKey(original),
  );
  const decorated = { ...original, sugar: 'one', latteArt: 'rosetta' };
  assert.ok(validRecipe(decorated));
  assert.notEqual(recipeKey(decorated), recipeKey(original));
  assert.equal(price(decorated), price(original));
  assert.match(recipeParts(decorated, 'en').join(' '), /Rosetta latte art/);
  assert.equal(validRecipe({ ...original, sugar: 'invalid' }), false);
});
test('pickup follows both Bishkek bars, preparation lead time and the next operating day', () => {
  const evening = Date.UTC(2026, 10, 26, 14, 44); // 20:44 in Bishkek
  const a = pickupTimes('boulevard', evening);
  assert.equal(timeOf(a[0]), '08:00');
  assert.equal(a[0], Date.UTC(2026, 10, 27, 2));
  assert.equal(timeOf(pickupTimes('park', evening)[0]), '09:00');
  const midday = Date.UTC(2026, 10, 26, 6, 0);
  const slots = pickupTimes('park', midday);
  assert.equal(slots.length, 6);
  assert.equal(timeOf(slots[0]), '12:15');
  assert.ok(availablePickup('park', slots[0], midday));
  assert.ok(!availablePickup('park', slots[0], midday + 600000));
  assert.deepEqual(
    slots,
    [...new Set(slots)].sort((x, y) => x - y),
  );
});
test('cold drinks and drinks without coffee expose only compatible changes', () => {
  const iced = classic('iced-latte');
  assert.equal(recipeKey(iced), recipeKey({ ...iced, ice: 'regular' }));
  assert.notEqual(recipeKey(iced), recipeKey({ ...iced, ice: 'no-ice' }));
  assert.deepEqual(activeGroups('cold-brew').sort(), ['ice', 'sugar', 'syrup']);
  for (const id of ['matcha-latte', 'cocoa'] as const) {
    assert.ok(
      !activeGroups(id).includes('beans') && !activeGroups(id).includes('shot'),
    );
    assert.equal(
      price(classic(id)),
      price({ ...classic(id), beans: 'decaf', shot: 'extra' }),
    );
  }
});
test('stamps are earned on collection, reserved on redemption and released on cancellation', () => {
  const base: Ticket = {
    id: 'one',
    created: 1,
    pickup: 2,
    bar: 'park',
    stage: 'collected',
    items: [{ recipe: classic('cappuccino'), qty: 6, unit: 200 }],
  };
  assert.deepEqual(clubBalance([base]), { rewards: 1, stamps: 1 });
  const espresso = { recipe: classic('espresso'), qty: 2 };
  assert.equal(availableDiscount({ orders: [base], bag: [espresso] }), 120);
  assert.equal(
    availableDiscount({
      orders: [base],
      bag: [espresso, { recipe: classic('mocha'), qty: 1 }],
    }),
    200,
  );
  const used: Ticket = {
    ...base,
    id: 'two',
    stage: 'received',
    reward: 120,
    items: [{ ...espresso, unit: 120 }],
  };
  assert.equal(ticketTotal(used), 120);
  assert.deepEqual(clubBalance([base, used]), { rewards: 0, stamps: 1 });
  assert.equal(availableDiscount({ orders: [base, used], bag: [espresso] }), 0);
  assert.deepEqual(clubBalance([base, { ...used, stage: 'collected' }]), {
    rewards: 0,
    stamps: 2,
  });
  assert.deepEqual(clubBalance([base, { ...used, stage: 'cancelled' }]), {
    rewards: 1,
    stamps: 1,
  });
  assert.deepEqual(clubBalance([{ ...base, stage: 'ready' }]), {
    rewards: 0,
    stamps: 0,
  });
});
test('bakery orders keep their weight, price and quantity apart from drink rewards', () => {
  const pastry = { bakery: 'almond-croissant' } as const;
  assert.ok(validSelection(pastry));
  assert.equal(validSelection({ bakery: '__proto__' }), false);
  assert.equal(validRecipe(pastry), false);
  assert.equal(price(pastry), 175);
  assert.deepEqual(recipeParts(pastry, 'ru'), ['95 г', '1 шт.']);
  assert.deepEqual(activeGroups('peach-tea').sort(), ['ice', 'sugar', 'syrup']);
  const pastryLine = { recipe: pastry, qty: 3, unit: 175 };
  const t: Ticket = {
    id: 'mixed',
    created: 1,
    pickup: 2,
    bar: 'park',
    stage: 'collected',
    items: [pastryLine, { recipe: classic('espresso'), qty: 5, unit: 120 }],
  };
  assert.deepEqual(clubBalance([t]), { rewards: 1, stamps: 0 });
  assert.equal(availableDiscount({ orders: [t], bag: [pastryLine] }), 0);
  assert.equal(availableDiscount({ orders: [t], bag: t.items }), 120);
  assert.equal(ticketTotal(t), 1125);
});
test('lemonades price only available changes and preserve legacy coffee keys', () => {
  const originals = classic('cappuccino');
  assert.equal(
    recipeKey(originals),
    'cappuccino/250/house/whole/silky/none/standard',
  );
  assert.equal(validRecipe(originals), true);
  const lemonades = drinks.filter((d) => d.family === 'lemonade');
  assert.equal(lemonades.length, 4);
  for (const d of lemonades) {
    const house = classic(d.id),
      personalised = {
        ...house,
        ml: d.sizes[1],
        water: 'still',
        garnish: 'mint',
        ice: 'no-ice',
      };
    assert.deepEqual(activeGroups(d.id).sort(), [
      'garnish',
      'ice',
      'sugar',
      'water',
    ]);
    assert.ok(validRecipe(personalised));
    assert.notEqual(recipeKey(personalised), recipeKey(house));
    assert.equal(price(personalised), d.price + d.sizePrices[1] + 10);
    assert.equal(
      price({ ...personalised, milk: 'oat', shot: 'extra' }),
      price(personalised),
    );
    assert.match(recipeParts(personalised, 'en').join(' '), /Still water/);
  }
});
