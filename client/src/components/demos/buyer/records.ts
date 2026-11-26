import { useEffect, useRef, useState } from 'react';
import { categories, sampleIds, type Category, type Copy } from './samples';

export type Brief = {
  category: Category;
  description: string;
  url: string;
  size: string;
  color: string;
  quantity: string;
  budget: string;
  photo: string;
  sampleIds: string[];
};
export type SavedBrief = Brief & {
  id: string;
  createdAt: string;
  updatedAt: string;
};
const recordsKey = 'china-buyer-demo-requests-v1';
const draftPrefix = 'yangben-draft-v1:';
const clip = (value: unknown, limit: number) =>
  typeof value === 'string' ? value.slice(0, limit) : '';
export function emptyBrief(
  ids: string[] = [],
  category: Category = 'Другое',
): Brief {
  return {
    category,
    description: '',
    url: '',
    size: '',
    color: '',
    quantity: '1',
    budget: '',
    photo: '',
    sampleIds: ids,
  };
}
export function cleanBrief(value: unknown): Brief {
  const input = (value && typeof value === 'object' ? value : {}) as Record<
    string,
    unknown
  >;
  const category = categories.find((c) => c === input.category) ?? 'Другое';
  const photo =
    typeof input.photo === 'string' &&
    input.photo.length < 480000 &&
    /^data:image\/jpeg;base64,[a-zA-Z\d+/]+=*$/.test(input.photo)
      ? input.photo
      : '';
  return {
    category,
    description: clip(input.description, 800),
    url: clip(input.url, 500),
    size: clip(input.size, 80),
    color: clip(input.color, 80),
    quantity:
      typeof input.quantity === 'string' ? clip(input.quantity, 3) : '1',
    budget: clip(input.budget, 9),
    photo,
    sampleIds: sampleIds(input.sampleIds).slice(0, 3),
  };
}
export function validate(brief: Brief): Copy | undefined {
  const url = brief.url.trim();
  if (url) {
    try {
      const parsed = new URL(url);
      if (
        !['https:', 'http:'].includes(parsed.protocol) ||
        !parsed.hostname ||
        parsed.username ||
        parsed.password
      )
        throw Error();
    } catch {
      return [
        'Введите полный адрес страницы с https:// или http://.',
        'Enter a full page address starting with https:// or http://.',
      ];
    }
  }
  if (
    !brief.description.trim() &&
    !url &&
    !brief.photo &&
    !brief.sampleIds.length
  )
    return [
      'Добавьте фото, ссылку, описание или образец.',
      'Add a photo, a link, a description or a sample.',
    ];
  if (brief.description.trim() && brief.description.trim().length < 3)
    return [
      'Добавьте к описанию ещё пару букв.',
      'Use at least three characters for your description.',
    ];
  if (!/^\d{1,3}$/.test(brief.quantity) || Number(brief.quantity) < 1)
    return [
      'Укажите количество от 1 до 999.',
      'Enter a quantity from 1 to 999.',
    ];
  if (
    brief.budget &&
    (!/^\d{1,9}$/.test(brief.budget) || Number(brief.budget) < 1)
  )
    return [
      'Укажите бюджет целым числом в рублях.',
      'Enter a whole rouble amount for your budget.',
    ];
}
function readRecords(): SavedBrief[] {
  try {
    const data: unknown = JSON.parse(localStorage.getItem(recordsKey) || '[]');
    if (!Array.isArray(data)) return [];
    return data.slice(0, 30).flatMap((raw) => {
      if (
        !raw ||
        typeof raw.id !== 'string' ||
        !raw.id ||
        !Number.isFinite(Date.parse(raw.createdAt))
      )
        return [];
      const fields = cleanBrief(raw);
      if (validate(fields)) return [];
      return [
        {
          ...fields,
          id: raw.id,
          createdAt: raw.createdAt,
          updatedAt: Number.isFinite(Date.parse(raw.updatedAt))
            ? raw.updatedAt
            : raw.createdAt,
        },
      ];
    });
  } catch {
    return [];
  }
}
export function useBriefs() {
  const [records, setRecords] = useState(readRecords);
  const memory = useRef(records);
  const [temporary, setTemporary] = useState(false);
  const failed = useRef(false);
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if ((event.key === recordsKey || event.key === null) && !failed.current) {
        memory.current = readRecords();
        setRecords(memory.current);
      }
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  function write(next: SavedBrief[]) {
    try {
      localStorage.setItem(recordsKey, JSON.stringify(next));
      failed.current = false;
    } catch {
      failed.current = true;
    }
    memory.current = next;
    setRecords(next);
    setTemporary(failed.current);
  }
  function save(
    input: Brief,
    id?: string,
  ): { record?: SavedBrief; error?: Copy } {
    const fields = cleanBrief({
      ...input,
      description: input.description.trim(),
      url: input.url.trim(),
      color: input.color.trim(),
      size: input.size.trim(),
    });
    const error = validate(fields);
    if (error) return { error };
    const current = failed.current ? memory.current : readRecords();
    const existing = current.find((x) => x.id === id);
    if (id && !existing)
      return {
        error: ['Этот запрос уже удалён.', 'This brief has been deleted.'],
      };
    if (!id && current.length >= 30)
      return {
        error: [
          'Сохранено 30 запросов. Удалите один, чтобы добавить новый.',
          'You have 30 saved briefs. Delete one to make room for another.',
        ],
      };
    const now = new Date().toISOString();
    const record = {
      ...fields,
      id:
        existing?.id ??
        (globalThis.crypto?.randomUUID?.() ||
          String(Date.now()) + '-' + Math.random().toString(36).slice(2)),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    write(
      existing
        ? current.map((x) => (x.id === id ? record : x))
        : [record, ...current],
    );
    return { record };
  }
  function remove(id: string) {
    write(
      (failed.current ? memory.current : readRecords()).filter(
        (x) => x.id !== id,
      ),
    );
  }
  return { records, save, remove, temporary };
}
export function useSelection(key: string, limit: number) {
  const read = () => {
    try {
      return sampleIds(JSON.parse(localStorage.getItem(key) || '[]')).slice(
        0,
        limit,
      );
    } catch {
      return [];
    }
  };
  const [ids, setIds] = useState<string[]>(read);
  const [temporary, setTemporary] = useState(false);
  useEffect(() => {
    const sync = (e: StorageEvent) => {
      if (e.key === key || e.key === null) setIds(read());
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, [key, limit]);
  function toggle(id: string) {
    const current = temporary ? ids : read();
    if (!current.includes(id) && current.length >= limit) return false;
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id];
    try {
      localStorage.setItem(key, JSON.stringify(next));
      setTemporary(false);
    } catch {
      setTemporary(true);
    }
    setIds(next);
    return true;
  }
  return { ids, toggle, temporary };
}
export function useDrafts() {
  const cache = useRef(new Map<string, Brief>());
  const [temporary, setTemporary] = useState(false);
  function get(slot: string): Brief | undefined {
    if (cache.current.has(slot)) return cache.current.get(slot);
    try {
      const value = sessionStorage.getItem(draftPrefix + slot);
      if (value) return cleanBrief(JSON.parse(value));
    } catch {}
    return undefined;
  }
  function put(slot: string, fields: Brief) {
    cache.current.set(slot, fields);
    try {
      sessionStorage.setItem(draftPrefix + slot, JSON.stringify(fields));
      setTemporary(false);
    } catch {
      setTemporary(true);
    }
  }
  function clear(slot: string) {
    cache.current.delete(slot);
    try {
      sessionStorage.removeItem(draftPrefix + slot);
    } catch {}
  }
  return { get, put, clear, temporary };
}
export async function preparePhoto(file: File): Promise<string> {
  if (file.size < 12 || file.size > 10 * 1024 * 1024) throw Error('file');
  // Some native pickers omit the MIME type, including for valid WebP files.
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const header = new DataView(bytes.buffer);
  let type: string;
  if (header.getUint16(0) === 0xffd8 && bytes[2] === 0xff) type = 'image/jpeg';
  else if (
    header.getUint32(0) === 0x89504e47 &&
    header.getUint32(4) === 0x0d0a1a0a
  )
    type = 'image/png';
  else if (
    header.getUint32(0) === 0x52494646 &&
    header.getUint32(8) === 0x57454250
  )
    type = 'image/webp';
  else throw Error('file');
  const href = URL.createObjectURL(file.slice(0, file.size, type));
  try {
    const img = new Image();
    img.src = href;
    await img.decode();
    const scale = Math.min(1, 900 / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.width * scale));
    canvas.height = Math.max(1, Math.round(img.height * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) throw Error('decode');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    for (const quality of [0.78, 0.64, 0.48]) {
      const data = canvas.toDataURL('image/jpeg', quality);
      if (data.startsWith('data:image/jpeg;base64,') && data.length < 480000)
        return data;
    }
    throw Error('size');
  } finally {
    URL.revokeObjectURL(href);
  }
}
