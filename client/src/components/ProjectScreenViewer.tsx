import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { ProjectStoryScreen } from '../data/projectStoryScreens';
import './ProjectScreenViewer.css';

interface ProjectScreenViewerProps {
  screen: ProjectStoryScreen;
  ru: boolean;
  onClose: () => void;
}

/** A modal image viewer sized to Telegram's visible and safe viewport. */
export function ProjectScreenViewer({ screen, ru, onClose }: ProjectScreenViewerProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const locale = ru ? 0 : 1;

  useEffect(() => {
    const element = dialog.current;
    if (element && !element.open) element.showModal();
  }, []);

  return <dialog ref={dialog} className="project-screen-viewer" data-testid="project-screen-viewer"
    aria-label={`${ru ? 'Экран проекта' : 'Project screen'}: ${screen.caption[locale]}`} onClose={onClose}>
    <div className="project-screen-viewer-content">
      <div className="project-screen-viewer-title">{screen.caption[locale]}</div>
      <div className="project-screen-viewer-image"><img src={screen.src} srcSet={screen.src3x ? `${screen.src} 780w, ${screen.src3x} 1170w` : undefined} sizes="(max-width: 422px) calc(100vw - 32px), 390px" alt={screen.caption[locale]} /></div>
      <div className="project-screen-viewer-actions">
        <button type="button" onClick={() => dialog.current?.close()} aria-label={ru ? 'Закрыть' : 'Close'} data-testid="project-screen-close"><X size={18} />{ru ? 'Закрыть' : 'Close'}</button>
      </div>
    </div>
  </dialog>;
}
