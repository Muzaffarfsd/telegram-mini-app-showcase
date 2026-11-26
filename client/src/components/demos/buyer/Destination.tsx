import { useId } from 'react';
import { MapPin } from 'lucide-react';
import {
  countryName,
  marketCode,
  marketCodes,
  type MarketCode,
} from './markets';
export function Destination({
  value,
  onChange,
  ru,
  compact = false,
}: {
  value: MarketCode | '';
  onChange: (v: MarketCode | '') => void;
  ru: boolean;
  compact?: boolean;
}) {
  const id = useId();
  return (
    <label className={compact ? 'yb-route-picker' : 'yb-field'} htmlFor={id}>
      <span id={id + '-label'}>
        {compact && <MapPin size={16} />}{' '}
        {ru ? 'Страна доставки' : 'Delivery country'}
      </span>
      <select
        id={id}
        aria-labelledby={id + '-label'}
        value={value}
        onChange={(event) => onChange(marketCode(event.target.value))}
      >
        <option value="">{ru ? 'Выберите страну' : 'Choose a country'}</option>
        {marketCodes.map((code) => (
          <option key={code} value={code}>
            {countryName(code, ru)}
          </option>
        ))}
      </select>
    </label>
  );
}
