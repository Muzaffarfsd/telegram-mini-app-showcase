const formatter = new Intl.NumberFormat('ru-RU');

/** A display estimate only; order calculations remain in RUB. */
export function rubWithUsd(amount: number, rubToUsd: number | null): string {
  const rubles = `${formatter.format(amount)} ₽`;
  return `${rubles} / ${rubToUsd === null ? '—' : `≈ $${formatter.format(Math.round(amount * rubToUsd))}`}`;
}
