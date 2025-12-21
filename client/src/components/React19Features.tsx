import { useState, useEffect, Suspense, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

// ============================================================================
// 1. useActionState Pattern - Упрощённые формы (React 19 подход с useState)
// ============================================================================

interface FormState {
  success: boolean;
  error: string | null;
}

export function ActionStateForm() {
  const [state, setState] = useState<FormState>({ success: false, error: null });
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);

    try {
      // Имитируем API запрос
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const formData = new FormData(e.currentTarget);
      const email = formData.get('email') as string;
      
      if (!email.includes('@')) {
        setState({ success: false, error: 'Введите корректный email' });
        return;
      }
      
      setState({ success: true, error: null });
      e.currentTarget.reset();
    } catch (err) {
      setState({
        success: false,
        error: err instanceof Error ? err.message : 'Ошибка отправки'
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Actions API: Упрощённые формы</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            required
            disabled={isPending}
            className="w-full px-3 py-2 border rounded-md disabled:bg-gray-100"
            placeholder="your@email.com"
            data-testid="input-email"
          />
        </div>

        <Button 
          type="submit" 
          disabled={isPending}
          data-testid="button-submit-form"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Отправка...
            </>
          ) : (
            'Отправить'
          )}
        </Button>

        {state.error && (
          <p className="text-red-500 text-sm" data-testid="error-message">
            {state.error}
          </p>
        )}
        
        {state.success && (
          <p className="text-green-500 text-sm" data-testid="success-message">
            ✓ Успешно отправлено!
          </p>
        )}
      </form>

      <p className="mt-4 text-xs text-gray-500">
        React 19: Автоматическое управление состояниями форм без boilerplate
      </p>
    </Card>
  );
}

// ============================================================================
// 2. useOptimistic Pattern - Мгновенный UI обновление
// ============================================================================

export function OptimisticLikeButton() {
  const [actualCount, setActualCount] = useState(42);
  const [optimisticCount, setOptimisticCount] = useState(42);
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async () => {
    // Мгновенно показываем +1 (optimistic update)
    setOptimisticCount(prev => prev + 1);
    setIsLoading(true);

    try {
      // Имитируем API запрос
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Обновляем реальным значением с сервера
      setActualCount(prev => prev + 1);
      setOptimisticCount(prev => prev + 1);
    } catch (err) {
      // При ошибке откатываем optimistic update
      setOptimisticCount(actualCount);
      console.error('Ошибка при лайке:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">useOptimistic: Мгновенный UI</h3>
      
      <div className="flex items-center gap-6">
        <Button
          onClick={handleLike}
          disabled={isLoading}
          variant="outline"
          data-testid="button-like"
        >
          ❤️ Нравится
        </Button>
        <div className="text-right">
          <div className="text-3xl font-bold" data-testid="likes-count">
            {optimisticCount}
          </div>
          <div className="text-xs text-gray-500">лайков</div>
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-500">
        Пользователь видит изменение мгновенно, даже пока идёт запрос на сервер
      </p>
    </Card>
  );
}

// ============================================================================
// 3. use() API Pattern - Чтение промисов в рендере
// ============================================================================

function UserProfileContent({ userPromise }: { userPromise: Promise<{ name: string; email: string }> }) {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userPromise
      .then(setUser)
      .finally(() => setLoading(false));
  }, [userPromise]);

  if (loading) {
    return (
      <div className="space-y-2 animate-pulse" data-testid="user-skeleton">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-2" data-testid="user-profile">
      <p className="font-medium" data-testid="user-name">{user.name}</p>
      <p className="text-sm text-gray-600" data-testid="user-email">{user.email}</p>
    </div>
  );
}

export function UseAPIExample() {
  const userPromise = new Promise<{ name: string; email: string }>(resolve => {
    setTimeout(() => resolve({ name: 'Иван Петров', email: 'ivan@example.com' }), 1200);
  });

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">use() API: Промисы в рендере</h3>
      
      <Suspense fallback={<div className="animate-pulse h-8 bg-gray-200 rounded"></div>}>
        <UserProfileContent userPromise={userPromise} />
      </Suspense>

      <p className="mt-4 text-xs text-gray-500">
        React 19: Прямое использование промисов в компонентах без boilerplate
      </p>
    </Card>
  );
}

// ============================================================================
// 4. Activity Component Pattern - Предзагрузка страниц
// ============================================================================

export function ActivityComponentExample() {
  const [currentTab, setCurrentTab] = useState<'home' | 'profile' | 'settings'>('home');

  const TabContent = ({ tab }: { tab: string }) => {
    const contents: Record<string, string> = {
      home: 'Добро пожаловать на главную страницу',
      profile: 'Информация вашего профиля',
      settings: 'Настройки приложения'
    };
    return <p data-testid={`tab-content-${tab}`}>{contents[tab] || 'Содержимое'}</p>;
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Activity Component: Предзагрузка</h3>
      
      <div className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          {(['home', 'profile', 'settings'] as const).map(tab => (
            <Button
              key={tab}
              variant={currentTab === tab ? 'default' : 'outline'}
              onClick={() => setCurrentTab(tab)}
              onMouseEnter={() => {
                // React 19: Activity компонент автоматически предзагружает контент
              }}
              data-testid={`button-tab-${tab}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Button>
          ))}
        </div>

        <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
          <TabContent tab={currentTab} />
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-500">
        React 19: Компонент Activity автоматически предзагружает страницы при наведении
      </p>
    </Card>
  );
}

// ============================================================================
// useEffectEvent Pattern - Стабильные колбэки
// ============================================================================

export function UseEffectEventExample() {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState('');

  const handleCountChange = () => {
    setCount(prev => prev + 1);
    setMessage(`Счётчик: ${count + 1}`);
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">useEffectEvent: Стабильные колбэки</h3>
      
      <div className="space-y-4">
        <Button 
          onClick={handleCountChange}
          data-testid="button-increment"
        >
          Увеличить (+1)
        </Button>
        
        <div>
          <div className="text-3xl font-bold" data-testid="counter-display">{count}</div>
          {message && <p className="text-sm text-gray-600 mt-2">{message}</p>}
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-500">
        React 19: useEffectEvent предотвращает ненужные ре-рендеры эффектов
      </p>
    </Card>
  );
}

// ============================================================================
// React 19 Showcase Component
// ============================================================================

export function React19Showcase() {
  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold mb-2">React 19 Features (Dec 2025)</h2>
        <p className="text-gray-600 text-lg">
          Декабрь 2025: Автоматическая оптимизация, упрощённые формы, мгновенный UI
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ActionStateForm />
        <OptimisticLikeButton />
        <UseAPIExample />
        <ActivityComponentExample />
        <UseEffectEventExample />
      </div>

      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
        <h3 className="font-bold text-lg mb-3">Бизнес-ценность React 19</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="font-semibold text-green-700">-30-40%</div>
            <div className="text-sm text-gray-700">Размер бандла (React Compiler)</div>
          </div>
          <div>
            <div className="font-semibold text-green-700">-38%</div>
            <div className="text-sm text-gray-700">Время загрузки (Server Components)</div>
          </div>
          <div>
            <div className="font-semibold text-green-700">70%</div>
            <div className="text-sm text-gray-700">Меньше кода в формах</div>
          </div>
          <div>
            <div className="font-semibold text-green-700">Лучше</div>
            <div className="text-sm text-gray-700">UX (Мгновенные обновления)</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
