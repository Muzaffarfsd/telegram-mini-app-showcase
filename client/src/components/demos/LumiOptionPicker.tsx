import React from 'react';
import type { LumiService } from './lumiData';
import { lumiOptionGroups,normalizeOptions,type LumiOptionSelection } from './lumiOptionData';
import './LumiOptionPicker.css';
export default function LumiOptionPicker({service,value,onChange}:{service:LumiService;value:LumiOptionSelection;onChange:(value:LumiOptionSelection)=>void}){
 const groups=lumiOptionGroups[service.id]||[];const current=normalizeOptions(service.id,value);if(!groups.length)return null;
 return <div className="lumi-options"><div className="lumi-options-heading"><span>ВАШ ВЫБОР</span><strong>ДЕТАЛИ УСЛУГИ.</strong><p>Выберите подходящие варианты. Цена и длительность показаны для демонстрации.</p></div>{groups.map(group=><fieldset key={group.id}><legend>{group.title}</legend>{group.hint&&<p>{group.hint}</p>}<div className="lumi-options-choices">{group.options.map(option=><label key={option.id} className={current[group.id]===option.id?'selected':''}><input type="radio" name={`lumi-${service.id}-${group.id}`} checked={current[group.id]===option.id} onChange={()=>onChange({...current,[group.id]:option.id})}/><span>{option.label}</span><small>{option.price===0?'Включено':`+ ${new Intl.NumberFormat('ru-RU').format(option.price)} ₽ · ${option.minutes} мин`}</small></label>)}</div></fieldset>)}</div>;
}
