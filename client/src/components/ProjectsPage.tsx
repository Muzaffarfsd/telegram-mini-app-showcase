import { useState, useMemo, useCallback, memo } from "react";
import { demoApps } from "../data/demoApps";
import { Search, ChevronRight, ArrowUpRight } from "lucide-react";

interface ProjectsPageProps {
  onNavigate: (section: string) => void;
  onOpenDemo: (demoId: string) => void;
}

type Category = 'all' | 'sales' | 'services' | 'loyalty';
type SortType = 'trending' | 'new' | 'roi';

const categories: { id: Category; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'sales', label: 'Продажи' },
  { id: 'services', label: 'Сервисы' },
  { id: 'loyalty', label: 'Лояльность' },
];

const categoryMap: Record<Category, string[]> = {
  all: [],
  sales: ['radiance', 'techmart', 'sneaker-vault', 'rascal', 'store-black', 'nike-acg'],
  services: ['glow-spa', 'deluxe-dine', 'time-elite', 'fragrance-royale'],
  loyalty: ['lab-survivalist', 'fitness'],
};

const appMeta: Record<string, { tag: string; kpi: string }> = {
  'radiance': { tag: 'Fashion', kpi: '+340% продаж' },
  'techmart': { tag: 'Electronics', kpi: '+280% заказов' },
  'glow-spa': { tag: 'Beauty', kpi: '+95% записей' },
  'deluxe-dine': { tag: 'Restaurant', kpi: '+180% броней' },
  'time-elite': { tag: 'Luxury', kpi: '+420% ROI' },
  'sneaker-vault': { tag: 'Sneakers', kpi: '+250% drops' },
  'fragrance-royale': { tag: 'Perfume', kpi: '+190% продаж' },
  'rascal': { tag: 'Streetwear', kpi: '+310% заказов' },
  'store-black': { tag: 'Minimal', kpi: '+220% конверсии' },
  'lab-survivalist': { tag: 'Outdoor', kpi: '+175% лояльности' },
  'nike-acg': { tag: 'ACG', kpi: '+290% продаж' },
};

const AppCard = memo(({ 
  app, 
  isLead,
  onOpen,
}: { 
  app: typeof demoApps[0]; 
  isLead: boolean;
  onOpen: () => void;
}) => {
  const meta = appMeta[app.id] || { tag: 'App', kpi: '+200%' };
  
  return (
    <button
      onClick={onOpen}
      className="app-card w-full text-left"
      data-testid={`card-app-${app.id}`}
      aria-label={`Открыть ${app.title}`}
    >
      {/* Tag */}
      <span className="card-tag">{meta.tag}</span>
      
      {/* Title */}
      <h3 className={isLead ? "card-title-lead" : "card-title"}>
        {app.title}
      </h3>
      
      {/* Description - only for lead cards */}
      {isLead && (
        <p className="card-desc">
          {app.description}
        </p>
      )}
      
      {/* Footer */}
      <div className="card-footer">
        <span className="card-kpi">{meta.kpi}</span>
        <span className="card-action">
          Открыть
          <ChevronRight className="w-4 h-4" />
        </span>
      </div>
    </button>
  );
});
AppCard.displayName = 'AppCard';

export default function ProjectsPage({ onOpenDemo }: ProjectsPageProps) {
  const [category, setCategory] = useState<Category>('all');
  const [sort, setSort] = useState<SortType>('trending');
  const [search, setSearch] = useState('');
  
  const handleCategoryChange = useCallback((cat: Category) => {
    setCategory(cat);
  }, []);
  
  const handleSortChange = useCallback((s: SortType) => {
    setSort(s);
  }, []);
  
  const filteredApps = useMemo(() => {
    let apps = demoApps.slice(0, 11);
    
    // Category filter
    if (category !== 'all') {
      const ids = categoryMap[category];
      apps = apps.filter(app => ids.includes(app.id));
    }
    
    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      apps = apps.filter(app => 
        app.title.toLowerCase().includes(q) ||
        app.description.toLowerCase().includes(q)
      );
    }
    
    return apps;
  }, [category, search]);

  return (
    <div className="projects-page">
      {/* ════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════ */}
      <section className="hero-section">
        <span className="overline">Telegram Mini Apps</span>
        <h1 className="hero-title">
          Витрина
          <br />
          приложений
        </h1>
        <p className="hero-subtitle">
          Готовые решения для автоматизации бизнеса в Telegram
        </p>
        
        <div className="hero-actions">
          <button 
            className="btn-primary"
            onClick={() => window.location.hash = '#/constructor'}
            data-testid="button-order-hero"
          >
            Заказать
            <ArrowUpRight className="w-4 h-4" />
          </button>
          <button 
            className="btn-secondary"
            onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Смотреть каталог
          </button>
        </div>
      </section>
      
      {/* ════════════════════════════════════════════
          STATS
      ════════════════════════════════════════════ */}
      <section className="stats-section">
        <div className="stat-item">
          <span className="stat-value">11</span>
          <span className="stat-label">Приложений</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-value">24/7</span>
          <span className="stat-label">Продажи</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-value">14</span>
          <span className="stat-label">Дней запуск</span>
        </div>
      </section>
      
      {/* ════════════════════════════════════════════
          FILTERS
      ════════════════════════════════════════════ */}
      <section className="filters-section" id="catalog">
        {/* Category tabs */}
        <div className="category-tabs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`category-tab ${category === cat.id ? 'active' : ''}`}
              data-testid={`filter-${cat.id}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        
        {/* Search */}
        <div className="search-row">
          <div className="search-input-wrap">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Поиск..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
              data-testid="input-search"
            />
          </div>
        </div>
        
        {/* Sort */}
        <div className="sort-row">
          <span className="sort-label">Сортировка:</span>
          <div className="sort-tabs">
            {[
              { id: 'trending' as SortType, label: 'Популярные' },
              { id: 'new' as SortType, label: 'Новые' },
              { id: 'roi' as SortType, label: 'ROI' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => handleSortChange(s.id)}
                className={`sort-tab ${sort === s.id ? 'active' : ''}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </section>
      
      {/* ════════════════════════════════════════════
          CATALOG
      ════════════════════════════════════════════ */}
      <section className="catalog-section">
        <div className="catalog-header">
          <h2 className="section-title">Каталог</h2>
          <span className="catalog-count">{filteredApps.length} apps</span>
        </div>
        
        {filteredApps.length === 0 ? (
          <div className="empty-state">
            <p>Ничего не найдено</p>
            <button 
              onClick={() => { setCategory('all'); setSearch(''); }}
              className="reset-btn"
            >
              Сбросить фильтры
            </button>
          </div>
        ) : (
          <div className="catalog-grid">
            {filteredApps.map((app, index) => (
              <AppCard
                key={app.id}
                app={app}
                isLead={index === 0}
                onOpen={() => onOpenDemo(app.id)}
              />
            ))}
          </div>
        )}
      </section>
      
      {/* ════════════════════════════════════════════
          CTA
      ════════════════════════════════════════════ */}
      <section className="cta-section">
        <div className="cta-box">
          <span className="cta-overline">Разработка под ключ</span>
          <p className="cta-price">от 9 990 ₽</p>
          <p className="cta-desc">Дизайн, разработка, интеграция и запуск</p>
          <button 
            className="btn-cta"
            onClick={() => window.location.hash = '#/constructor'}
            data-testid="button-order-cta"
          >
            Заказать приложение
          </button>
        </div>
      </section>
      
      {/* Bottom space */}
      <div className="bottom-space" />

      <style>{`
        .projects-page {
          min-height: 100vh;
          background: #0B0B0D;
          color: #F5F5F0;
          padding-bottom: 100px;
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif;
        }
        
        /* ═══ HERO ═══ */
        .hero-section {
          padding: 56px 24px 40px;
          border-bottom: 1px solid #1A1A1F;
        }
        
        .overline {
          display: block;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #8D9DFF;
          margin-bottom: 16px;
        }
        
        .hero-title {
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
          font-size: 36px;
          font-weight: 600;
          letter-spacing: -0.025em;
          line-height: 1.1;
          color: #F5F5F0;
          margin-bottom: 16px;
        }
        
        .hero-subtitle {
          font-size: 15px;
          line-height: 1.5;
          color: rgba(245, 245, 240, 0.5);
          max-width: 280px;
          margin-bottom: 32px;
        }
        
        .hero-actions {
          display: flex;
          gap: 12px;
        }
        
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 12px 20px;
          font-size: 14px;
          font-weight: 600;
          color: #0B0B0D;
          background: #F5F5F0;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .btn-primary:hover {
          background: #FFFFFF;
          transform: translateY(-1px);
        }
        
        .btn-primary:active {
          transform: translateY(0);
        }
        
        .btn-secondary {
          padding: 12px 20px;
          font-size: 14px;
          font-weight: 500;
          color: rgba(245, 245, 240, 0.7);
          background: transparent;
          border: 1px solid #2A2A30;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .btn-secondary:hover {
          border-color: #3A3A40;
          color: #F5F5F0;
        }
        
        /* ═══ STATS ═══ */
        .stats-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px;
          border-bottom: 1px solid #1A1A1F;
        }
        
        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
        }
        
        .stat-value {
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
          font-size: 24px;
          font-weight: 600;
          letter-spacing: -0.02em;
          color: #F5F5F0;
        }
        
        .stat-label {
          font-size: 11px;
          color: rgba(245, 245, 240, 0.4);
          margin-top: 4px;
        }
        
        .stat-divider {
          width: 1px;
          height: 32px;
          background: #2A2A30;
        }
        
        /* ═══ FILTERS ═══ */
        .filters-section {
          padding: 24px;
          border-bottom: 1px solid #1A1A1F;
        }
        
        .category-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        
        .category-tabs::-webkit-scrollbar {
          display: none;
        }
        
        .category-tab {
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 500;
          color: rgba(245, 245, 240, 0.5);
          background: transparent;
          border: 1px solid #2A2A30;
          border-radius: 100px;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .category-tab:hover {
          border-color: #3A3A40;
          color: rgba(245, 245, 240, 0.8);
        }
        
        .category-tab.active {
          background: rgba(141, 157, 255, 0.1);
          border-color: rgba(141, 157, 255, 0.3);
          color: #8D9DFF;
        }
        
        .search-row {
          margin-bottom: 16px;
        }
        
        .search-input-wrap {
          position: relative;
        }
        
        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          color: rgba(245, 245, 240, 0.3);
        }
        
        .search-input {
          width: 100%;
          padding: 12px 12px 12px 40px;
          font-size: 14px;
          color: #F5F5F0;
          background: #151518;
          border: 1px solid #2A2A30;
          border-radius: 8px;
          outline: none;
          transition: all 0.2s ease;
        }
        
        .search-input::placeholder {
          color: rgba(245, 245, 240, 0.3);
        }
        
        .search-input:focus {
          border-color: rgba(141, 157, 255, 0.5);
          background: #1A1A1F;
        }
        
        .sort-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .sort-label {
          font-size: 12px;
          color: rgba(245, 245, 240, 0.4);
          flex-shrink: 0;
        }
        
        .sort-tabs {
          display: flex;
          gap: 4px;
        }
        
        .sort-tab {
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 500;
          color: rgba(245, 245, 240, 0.4);
          background: transparent;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .sort-tab:hover {
          color: rgba(245, 245, 240, 0.7);
        }
        
        .sort-tab.active {
          background: #1A1A1F;
          color: #F5F5F0;
        }
        
        /* ═══ CATALOG ═══ */
        .catalog-section {
          padding: 24px;
        }
        
        .catalog-header {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        
        .section-title {
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(245, 245, 240, 0.5);
        }
        
        .catalog-count {
          font-size: 12px;
          color: rgba(245, 245, 240, 0.3);
        }
        
        .catalog-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .app-card {
          display: flex;
          flex-direction: column;
          padding: 20px;
          background: #151518;
          border: 1px solid #1A1A1F;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        .app-card:hover {
          background: #1A1A1F;
          border-color: #2A2A30;
          transform: translateY(-2px);
        }
        
        .app-card:active {
          transform: translateY(0);
        }
        
        .card-tag {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #8D9DFF;
          margin-bottom: 8px;
        }
        
        .card-title {
          font-size: 17px;
          font-weight: 600;
          letter-spacing: -0.01em;
          color: #F5F5F0;
          margin-bottom: 12px;
        }
        
        .card-title-lead {
          font-size: 20px;
          font-weight: 600;
          letter-spacing: -0.02em;
          color: #F5F5F0;
          margin-bottom: 8px;
        }
        
        .card-desc {
          font-size: 14px;
          line-height: 1.5;
          color: rgba(245, 245, 240, 0.45);
          margin-bottom: 16px;
        }
        
        .card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: auto;
        }
        
        .card-kpi {
          font-size: 12px;
          font-weight: 600;
          color: rgba(141, 157, 255, 0.8);
        }
        
        .card-action {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          font-weight: 500;
          color: rgba(245, 245, 240, 0.5);
          transition: color 0.2s ease;
        }
        
        .app-card:hover .card-action {
          color: #F5F5F0;
        }
        
        .empty-state {
          text-align: center;
          padding: 48px 24px;
          color: rgba(245, 245, 240, 0.4);
        }
        
        .reset-btn {
          margin-top: 16px;
          font-size: 14px;
          font-weight: 500;
          color: #8D9DFF;
          background: transparent;
          border: none;
          cursor: pointer;
        }
        
        /* ═══ CTA ═══ */
        .cta-section {
          padding: 24px;
        }
        
        .cta-box {
          padding: 32px 24px;
          text-align: center;
          border: 1px solid #2A2A30;
          border-radius: 16px;
        }
        
        .cta-overline {
          display: block;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(245, 245, 240, 0.4);
          margin-bottom: 12px;
        }
        
        .cta-price {
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
          font-size: 32px;
          font-weight: 600;
          letter-spacing: -0.02em;
          color: #F5F5F0;
          margin-bottom: 8px;
        }
        
        .cta-desc {
          font-size: 14px;
          color: rgba(245, 245, 240, 0.4);
          margin-bottom: 24px;
        }
        
        .btn-cta {
          width: 100%;
          padding: 16px 24px;
          font-size: 15px;
          font-weight: 600;
          color: #0B0B0D;
          background: #F5F5F0;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .btn-cta:hover {
          background: #FFFFFF;
          transform: translateY(-1px);
        }
        
        .btn-cta:active {
          transform: translateY(0);
        }
        
        .bottom-space {
          height: 24px;
        }
      `}</style>
    </div>
  );
}
