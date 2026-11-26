export const markets = {
  AZ: {
    ru: 'Азербайджан',
    en: 'Azerbaijan',
    currency: 'AZN',
    city: ['Баку', 'Baku'],
  },
  AM: {
    ru: 'Армения',
    en: 'Armenia',
    currency: 'AMD',
    city: ['Ереван', 'Yerevan'],
  },
  BY: {
    ru: 'Беларусь',
    en: 'Belarus',
    currency: 'BYN',
    city: ['Минск', 'Minsk'],
  },
  KZ: {
    ru: 'Казахстан',
    en: 'Kazakhstan',
    currency: 'KZT',
    city: ['Алматы', 'Almaty'],
  },
  KG: {
    ru: 'Кыргызстан',
    en: 'Kyrgyzstan',
    currency: 'KGS',
    city: ['Бишкек', 'Bishkek'],
  },
  MD: {
    ru: 'Молдова',
    en: 'Moldova',
    currency: 'MDL',
    city: ['Кишинёв', 'Chișinău'],
  },
  RU: {
    ru: 'Россия',
    en: 'Russia',
    currency: 'RUB',
    city: ['Москва', 'Moscow'],
  },
  TJ: {
    ru: 'Таджикистан',
    en: 'Tajikistan',
    currency: 'TJS',
    city: ['Душанбе', 'Dushanbe'],
  },
  TM: {
    ru: 'Туркменистан',
    en: 'Turkmenistan',
    currency: 'TMT',
    city: ['Ашхабад', 'Ashgabat'],
  },
  UZ: {
    ru: 'Узбекистан',
    en: 'Uzbekistan',
    currency: 'UZS',
    city: ['Ташкент', 'Tashkent'],
  },
} as const;
export type MarketCode = keyof typeof markets;
export const marketCodes = Object.keys(markets) as MarketCode[];
export const currencies = [
  'AZN',
  'AMD',
  'BYN',
  'KZT',
  'KGS',
  'MDL',
  'RUB',
  'TJS',
  'TMT',
  'UZS',
  'CNY',
  'USD',
] as const;
export type Currency = (typeof currencies)[number];
export const marketCode = (input: unknown): MarketCode | '' =>
  marketCodes.find((code) => code === input) ?? '';
export const currencyCode = (input: unknown): Currency | '' =>
  currencies.find((code) => code === input) ?? '';
const russianUnits: Record<Currency, string> = {
  AZN: 'AZN',
  AMD: '֏',
  BYN: 'BYN',
  KZT: '₸',
  KGS: 'сом',
  MDL: 'MDL',
  RUB: '₽',
  TJS: 'сомони',
  TMT: 'TMT',
  UZS: 'сум',
  CNY: 'CNY',
  USD: 'USD',
};
export const currencyLabel = (c: Currency, ru: boolean) =>
  ru ? russianUnits[c] : c;
export function money(value: number, currency: Currency, ru: boolean) {
  return (
    new Intl.NumberFormat(ru ? 'ru-RU' : 'en-GB', {
      maximumFractionDigits: 2,
    }).format(value) +
    ' ' +
    currencyLabel(currency, ru)
  );
}
export const countryName = (code: MarketCode | '', ru: boolean) =>
  code ? markets[code][ru ? 'ru' : 'en'] : '';
