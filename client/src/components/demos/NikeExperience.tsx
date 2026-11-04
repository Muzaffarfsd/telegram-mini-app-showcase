import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, GitCompareArrows, Plus, X } from 'lucide-react';
import './NikeExperience.css';

/** Uses only the product fields already exposed by the demo catalogue. */
export type NikeExperienceProduct = {
  id: string;
  name: string;
  image: string;
  price: number;
  category: string;
  summary: string;
  materials: string;
  sizes: number[];
};
type Collection = { id: string; name: string; productIds: string[] };
type ExperienceState = { recent: string[]; compare: string[]; collections: Collection[] };
const STORAGE_KEY = 'nike-sneakers-experience-v1';
const emptyState = (): ExperienceState => ({ recent: [], compare: [], collections: [] });
const formatPrice = (value: number) => `${new Intl.NumberFormat('ru-RU').format(value)} ₽`;
const modelCount = (count: number) => `${count} ${count % 10 === 1 && count % 100 !== 11 ? 'модель' : count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 12 || count % 100 > 14) ? 'модели' : 'моделей'}`;

function readState(validIds: Set<string>): ExperienceState {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const ids = (value: unknown, limit: number) => Array.isArray(value)
      ? Array.from(new Set(value.filter((id): id is string => typeof id === 'string' && validIds.has(id)))).slice(0, limit)
      : [];
    const collections = Array.isArray(raw.collections) ? raw.collections
      .filter((value: unknown): value is Collection => !!value && typeof value === 'object' && typeof (value as Collection).id === 'string' && typeof (value as Collection).name === 'string' && !!(value as Collection).name.trim())
      .slice(0, 12).map((value: Collection) => ({ id: value.id.slice(0, 80), name: value.name.trim().slice(0, 32), productIds: ids(value.productIds, 64) })) : [];
    return { recent: ids(raw.recent, 12), compare: ids(raw.compare, 3), collections };
  } catch { return emptyState(); }
}

export function useNikeExperience(products: NikeExperienceProduct[]) {
  const validIds = useMemo(() => new Set(products.map(product => product.id)), [products]);
  const [state, setState] = useState<ExperienceState>(() => readState(validIds));
  const [storageWarning, setStorageWarning] = useState(false);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); setStorageWarning(false); }
    catch { setStorageWarning(true); }
  }, [state]);
  const visit = useCallback((id: string) => {
    if (!validIds.has(id)) return;
    setState(current => ({ ...current, recent: [id, ...current.recent.filter(item => item !== id)].slice(0, 12) }));
  }, [validIds]);
  const toggleCompare = useCallback((id: string) => {
    if (!validIds.has(id)) return;
    setState(current => ({ ...current, compare: current.compare.includes(id)
      ? current.compare.filter(item => item !== id)
      : current.compare.length < 3 ? [...current.compare, id] : current.compare }));
  }, [validIds]);
  const addCollection = useCallback((name: string, initialProductId?: string) => {
    const trimmed = name.trim().slice(0, 32);
    if (!trimmed) return false;
    // Duplicate labels would be indistinguishable in the picker.
    if (state.collections.length >= 12 || state.collections.some(c => c.name.toLocaleLowerCase('ru') === trimmed.toLocaleLowerCase('ru'))) return false;
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setState(current => ({ ...current, collections: [...current.collections, { id, name: trimmed, productIds: initialProductId && validIds.has(initialProductId) ? [initialProductId] : [] }] }));
    return true;
  }, [state.collections, validIds]);
  const removeCollection = useCallback((id: string) => setState(current => ({ ...current, collections: current.collections.filter(item => item.id !== id) })), []);
  const toggleCollectionProduct = useCallback((collectionId: string, productId: string) => {
    if (!validIds.has(productId)) return;
    setState(current => ({ ...current, collections: current.collections.map(collection => collection.id !== collectionId ? collection : {
      ...collection, productIds: collection.productIds.includes(productId)
        ? collection.productIds.filter(id => id !== productId) : [...collection.productIds, productId],
    }) }));
  }, [validIds]);
  return { ...state, storageWarning, visit, toggleCompare, addCollection, removeCollection, toggleCollectionProduct };
}
export type NikeExperience = ReturnType<typeof useNikeExperience>;

function ProductTile({ product, onOpen }: { product: NikeExperienceProduct; onOpen: (id: string) => void }) {
  return <button type="button" className="rsx-tile" onClick={() => onOpen(product.id)} aria-label={`Открыть ${product.name}`}>
    <span className="rsx-tile__photo"><img src={product.image} alt="" loading="lazy" decoding="async" /></span>
    <strong>{product.name}</strong><span>{formatPrice(product.price)}</span>
  </button>;
}

export function NikeRecentlyViewed({ experience, products, onOpen }: { experience: NikeExperience; products: NikeExperienceProduct[]; onOpen: (id: string) => void }) {
  const recent = experience.recent.map(id => products.find(product => product.id === id)).filter((product): product is NikeExperienceProduct => !!product);
  if (!recent.length) return null;
  return <section className="rsx-recent" aria-labelledby="rsx-recent-title">
    <div className="rsx-heading"><div><p className="rsx-kicker">ВАШ ВЫБОР</p><h2 id="rsx-recent-title">Недавно смотрели</h2></div><span>{recent.length}</span></div>
    <div className="rsx-carousel">{recent.map(product => <ProductTile key={product.id} product={product} onOpen={onOpen} />)}</div>
  </section>;
}

export function NikeProductTools({ product, experience, onAccount }: { product: NikeExperienceProduct; experience: NikeExperience; onAccount: () => void }) {
  const compared = experience.compare.includes(product.id);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');
  return <section className="rsx-tools" aria-label="Сохранить и сравнить модель">
    <div className="rsx-tools__top"><button type="button" className="rsx-tool-button" aria-pressed={compared} disabled={!compared && experience.compare.length >= 3} onClick={() => experience.toggleCompare(product.id)}>
      <GitCompareArrows size={17} /> {compared ? 'В сравнении' : 'Сравнить'} {compared && <Check size={15} />}
    </button><button type="button" className="rsx-inline" onClick={onAccount}>Мои подборки <ArrowRight size={15} /></button></div>
    {experience.compare.length >= 3 && !compared && <p className="rsx-note">В сравнении уже три пары. Уберите одну в профиле, чтобы добавить другую.</p>}
    <details className="rsx-picker"><summary><Plus size={17} /> Добавить в подборку</summary>
      <p>Собирайте любимые пары в свои списки.</p>
      {experience.collections.map(collection => <button key={collection.id} className="rsx-picker__choice" type="button" aria-pressed={collection.productIds.includes(product.id)} onClick={() => experience.toggleCollectionProduct(collection.id, product.id)}>
        <span>{collection.name}</span>{collection.productIds.includes(product.id) ? <Check size={17} /> : <Plus size={17} />}
      </button>)}
      <form className="rsx-create" onSubmit={event => { event.preventDefault(); if (experience.addCollection(newName, product.id)) { setNewName(''); setError(''); } else setError('Введите новое название. Можно создать до 12 подборок.'); }}>
        <label htmlFor={`rsx-create-${product.id}`}>Новая подборка</label><div><input id={`rsx-create-${product.id}`} maxLength={32} value={newName} onChange={event => setNewName(event.target.value)} placeholder="Например, на каждый день"/><button type="submit" aria-label="Создать подборку"><Plus size={18}/></button></div>
      </form>{error && <p className="rsx-error" role="alert">{error}</p>}
    </details>
    {experience.storageWarning && <p className="rsx-error" role="status">Не удалось сохранить данные на устройстве. Выбор доступен до закрытия страницы.</p>}
  </section>;
}

export function NikePersonalSpace({ experience, products, onOpen, onCatalog }: { experience: NikeExperience; products: NikeExperienceProduct[]; onOpen: (id: string) => void; onCatalog: () => void }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [removing, setRemoving] = useState<string | null>(null);
  const chosen = experience.compare.map(id => products.find(product => product.id === id)).filter((product): product is NikeExperienceProduct => !!product);
  return <div className="rsx-personal">
    {experience.storageWarning && <p className="rsx-error" role="status">Не удалось сохранить данные на устройстве. Выбор доступен до закрытия страницы.</p>}
    <section aria-labelledby="rsx-collections-title"><div className="rsx-heading"><div><p className="rsx-kicker">СОБРАНО ВАМИ</p><h2 id="rsx-collections-title">Мои подборки</h2></div><span>{experience.collections.length}</span></div>
      <p className="rsx-note">Объедините пары по настроению или случаю. Подборки сохраняются на этом устройстве.</p>
      <form className="rsx-create" onSubmit={event => { event.preventDefault(); if (experience.addCollection(name)) { setName(''); setError(''); } else setError('Введите новое название. Можно создать до 12 подборок.'); }}>
        <label htmlFor="rsx-collection-name">Создать подборку</label><div><input id="rsx-collection-name" maxLength={32} value={name} onChange={event => setName(event.target.value)} placeholder="Например, на каждый день"/><button type="submit" aria-label="Создать подборку"><Plus size={18}/></button></div>
      </form>{error && <p className="rsx-error" role="alert">{error}</p>}
      {experience.collections.map(collection => {
        const items = collection.productIds.map(id => products.find(product => product.id === id)).filter((product): product is NikeExperienceProduct => !!product);
        return <details className="rsx-collection" key={collection.id}><summary><span><strong>{collection.name}</strong><small>{modelCount(items.length)}</small></span><ArrowRight size={17}/></summary>
          {items.length ? <div className="rsx-collection__list">{items.map(product => <div key={product.id}><ProductTile product={product} onOpen={onOpen} /><button type="button" className="rsx-remove" onClick={() => experience.toggleCollectionProduct(collection.id, product.id)} aria-label={`Убрать ${product.name} из подборки ${collection.name}`}><X size={16}/></button></div>)}</div> : <p className="rsx-note">Добавьте пару со страницы товара.</p>}
          {removing === collection.id ? <div className="rsx-confirm" role="group" aria-label={`Удаление подборки ${collection.name}`}><span>Удалить подборку?</span><button type="button" onClick={() => { experience.removeCollection(collection.id); setRemoving(null); }}>Удалить</button><button type="button" onClick={() => setRemoving(null)}>Отмена</button></div>
            : <button type="button" className="rsx-inline rsx-delete" onClick={() => setRemoving(collection.id)}>Удалить подборку</button>}
        </details>;
      })}
    </section>
    <section aria-labelledby="rsx-compare-title"><div className="rsx-heading"><div><p className="rsx-kicker">ВЫБРАТЬ ПРОЩЕ</p><h2 id="rsx-compare-title">Сравнение моделей</h2></div><span>{chosen.length} / 3</span></div>
      <p className="rsx-note">Добавьте от двух до трёх моделей со страницы товара и сравните их параметры.</p>
      {chosen.length > 1 && <p className="rsx-swipe">Листайте таблицу в сторону →</p>}
      {chosen.length > 0 && <div className="rsx-compare-scroll" role="region" aria-label="Таблица сравнения моделей" tabIndex={0}><table className="rsx-compare"><thead><tr><th scope="col">Модель</th>{chosen.map(product => <th scope="col" key={product.id}><button type="button" className="rsx-compare__product" onClick={() => onOpen(product.id)}><img src={product.image} alt="" loading="lazy"/><strong>{product.name}</strong></button><button className="rsx-compare__remove" type="button" onClick={() => experience.toggleCompare(product.id)} aria-label={`Убрать ${product.name} из сравнения`}><X size={16}/></button></th>)}</tr></thead><tbody>
        {([['Цена', (product: NikeExperienceProduct) => formatPrice(product.price)], ['Категория', (product: NikeExperienceProduct) => product.category], ['Материалы и детали', (product: NikeExperienceProduct) => product.materials], ['Размеры EU', (product: NikeExperienceProduct) => product.sizes.join(', ')]] as [string, (product: NikeExperienceProduct) => string][]).map(([label, value]) => <tr key={label}><th scope="row">{label}</th>{chosen.map(product => <td key={product.id}>{value(product)}</td>)}</tr>)}
      </tbody></table></div>}
      {chosen.length < 2 && <button type="button" className="rsx-inline" onClick={onCatalog}>Выбрать модели <ArrowRight size={15}/></button>}
    </section>
    <NikeRecentlyViewed experience={experience} products={products} onOpen={onOpen}/>
  </div>;
}
