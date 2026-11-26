import { useState } from 'react';
import { type RoomProject, removeProject, restoreProject } from './roomLibrary';
type Props = {
  projects: RoomProject[];
  ru: boolean;
  onOpen: (p: RoomProject) => void;
  onContinue: () => void;
  onChange: () => void;
  onError: () => void;
};
export default function SavedRooms({ projects, ru, onOpen, onContinue, onChange, onError }: Props) {
  const t = (r: string, e: string) => (ru ? r : e);
  const [editing, setEditing] = useState(''),
    [name, setName] = useState(''),
    [removed, setRemoved] = useState<RoomProject | null>(null);
  const commit = (edit: () => void) => {
    try {
      edit();
      onChange();
    } catch {
      onError();
    }
  };
  return (
    <section className="fs-account-projects">
      <h2>{t('Мои комнаты', 'My rooms')}</h2>
      <div className="fs-projects">
        {projects.length === 0 && !removed && (
          <p>{t('Сохранённые варианты расстановки появятся здесь.', 'Saved room layouts appear here.')}</p>
        )}
        {projects.map((p) => (
          <article key={p.id}>
            {editing === p.id ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (name.trim())
                    commit(() => {
                      restoreProject({ ...p, name: name.trim(), date: new Date().toISOString() });
                      setEditing('');
                    });
                }}
              >
                <label>
                  {t('Название варианта', 'Version name')}
                  <input autoFocus value={name} maxLength={70} onChange={(e) => setName(e.target.value)} />
                </label>
                <button disabled={!name.trim()}>{t('Сохранить', 'Save')}</button>{' '}
                <button type="button" onClick={() => setEditing('')}>
                  {t('Отмена', 'Cancel')}
                </button>
              </form>
            ) : (
              <>
                <strong>{p.name}</strong>
                <p>
                  {[p.layout.room.width, p.layout.room.depth]
                    .map((v) => v.toLocaleString(ru ? 'ru' : 'en'))
                    .join(' × ')}{' '}
                  {t('м', 'm')} · {p.layout.items.length} {t('предм.', 'pieces')}
                </p>
                <div>
                  <button onClick={() => onOpen(p)}>{t('Открыть', 'Open')}</button>
                  <button
                    onClick={() => {
                      setEditing(p.id);
                      setName(p.name);
                    }}
                  >
                    {t('Переименовать', 'Rename')}
                  </button>
                  <button
                    onClick={() =>
                      commit(() => {
                        removeProject(p.id);
                        setRemoved(p);
                      })
                    }
                  >
                    {t('Удалить', 'Delete')}
                  </button>
                </div>
              </>
            )}
          </article>
        ))}
        {removed && (
          <p role="status">
            {t('Удалён вариант', 'Removed version')} «{removed.name}».{' '}
            <button
              onClick={() =>
                commit(() => {
                  restoreProject(removed);
                  setRemoved(null);
                })
              }
            >
              {t('Восстановить', 'Undo')}
            </button>
          </p>
        )}
        <button onClick={onContinue}>{t('Продолжить свою комнату', 'Continue your room')}</button>
      </div>
    </section>
  );
}
