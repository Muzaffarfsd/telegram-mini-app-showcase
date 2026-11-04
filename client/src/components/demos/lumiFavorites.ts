import { useCallback, useEffect, useState } from 'react';

export type LumiFavorites = { masters: string[]; works: string[] };
const KEY = 'web4tg-lumi-favorites-v1';
const EVENT = 'lumi-favorites-change';
const clean = (value: unknown): string[] => Array.isArray(value) ? Array.from(new Set(value.filter((x): x is string => typeof x === 'string' && x.length > 0 && x.length <= 80))).slice(0,100) : [];
export function readLumiFavorites(): LumiFavorites {
 try { const x = JSON.parse(localStorage.getItem(KEY) || '{}'); return { masters:clean(x?.masters), works:clean(x?.works) }; }
 catch { return { masters:[], works:[] }; }
}
export function useLumiFavorites() {
 const [favorites,setFavorites] = useState<LumiFavorites>(readLumiFavorites);
 const [error,setError] = useState('');
 useEffect(()=>{const sync=()=>setFavorites(readLumiFavorites());const storage=(event:StorageEvent)=>{if(event.key===KEY||event.key===null)sync()};window.addEventListener('storage',storage);window.addEventListener(EVENT,sync);return()=>{window.removeEventListener('storage',storage);window.removeEventListener(EVENT,sync)}},[]);
 const toggle = useCallback((kind:keyof LumiFavorites,id:string)=>{try{const current=readLumiFavorites();const list=current[kind];const next={...current,[kind]:list.includes(id)?list.filter(x=>x!==id):[...list,id]};localStorage.setItem(KEY,JSON.stringify(next));setFavorites(next);setError('');window.dispatchEvent(new Event(EVENT));return true;}catch{setError('Не удалось сохранить избранное на этом устройстве.');return false;}},[]);
 return { favorites,toggle,error };
}
