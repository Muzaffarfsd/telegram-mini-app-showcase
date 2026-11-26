import { useState } from 'react';
import { Copy, Download, FolderPlus } from 'lucide-react';
import { downloadPlan } from './MeasuredPlan';
import { roomURL, storeProject, type RoomKey } from './roomLibrary';
import type { PlannerLayout, PlannerProduct } from './plannerTypes';

export default function RoomActions({
  layout,
  products,
  scene,
  ru,
  initialName,
  onKit,
}: {
  layout: PlannerLayout;
  products: readonly PlannerProduct[];
  scene: RoomKey;
  ru: boolean;
  initialName: string;
  onKit?: (ids: string[]) => void;
}) {
  const [name, setName] = useState(initialName),
    [info, setInfo] = useState(''),
    [link, setLink] = useState('');
  const t = (r: string, e: string) => (ru ? r : e);
  return (
    <section className="atelier-tools">
      <label>
        {t('Название варианта', 'Version name')}
        <input value={name} maxLength={70} onChange={(e) => setName(e.target.value)} />
      </label>
      <div className="room-buttons">
        <button
          type="button"
          disabled={!name.trim()}
          onClick={() => {
            try {
              storeProject(name, scene, layout);
              setInfo(t('Вариант сохранён в профиле', 'Version saved to your profile'));
            } catch {
              setInfo(
                t('Хранилище недоступно. Скопируйте ссылку.', 'Local storage unavailable. Copy the link.')
              );
            }
          }}
        >
          <FolderPlus size={15} /> {t('Сохранить вариант', 'Save version')}
        </button>
        <button
          type="button"
          onClick={async () => {
            const url = roomURL(layout, scene);
            try {
              await navigator.clipboard.writeText(url);
              setInfo(t('Ссылка скопирована', 'Link copied'));
              setLink('');
            } catch {
              setLink(url);
              setInfo(t('Выделите и скопируйте ссылку', 'Select and copy the link'));
            }
          }}
        >
          <Copy size={15} /> {t('Ссылка на план', 'Copy plan link')}
        </button>
        <button type="button" onClick={() => downloadPlan(layout, products, ru)}>
          <Download size={15} /> {t('Скачать план', 'Download plan')}
        </button>
        {onKit && layout.items.length > 0 && (
          <button type="button" onClick={() => onKit(layout.items.map((i) => i.productId))}>
            {t('Весь комплект в подборку', 'Add the entire set')}
          </button>
        )}
      </div>
      {link && (
        <input
          aria-label={t('Ссылка на план', 'Plan link')}
          readOnly
          value={link}
          onFocus={(e) => e.target.select()}
        />
      )}
      <span role="status">{info}</span>
    </section>
  );
}
