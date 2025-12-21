import { useGeolocation } from '@/hooks/useGeolocation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapPin, Navigation, AlertCircle, Loader2, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export function GeolocationDemo() {
  const {
    coordinates,
    loading,
    error,
    timestamp,
    watching,
    getCurrentPosition,
    startWatching,
    stopWatching,
    reset,
  } = useGeolocation();

  const [copied, setCopied] = useState(false);

  const handleCopyCoordinates = () => {
    if (coordinates) {
      const text = `${coordinates.latitude}, ${coordinates.longitude}`;
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getMapsUrl = () => {
    if (!coordinates) return null;
    return `https://www.google.com/maps?q=${coordinates.latitude},${coordinates.longitude}`;
  };

  return (
    <div className="space-y-6 p-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold mb-2">Геолокация пользователя</h2>
        <p className="text-gray-600">Доступ к геолокации через браузер</p>
      </div>

      {/* Контрольные кнопки */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Управление</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={getCurrentPosition}
            disabled={loading || watching}
            data-testid="button-get-location"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Получение...
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4 mr-2" />
                Получить локацию
              </>
            )}
          </Button>

          <Button
            onClick={watching ? stopWatching : startWatching}
            variant={watching ? 'destructive' : 'outline'}
            data-testid={watching ? 'button-stop-watching' : 'button-start-watching'}
          >
            {watching ? (
              <>
                <Navigation className="w-4 h-4 mr-2" />
                Остановить отслеживание
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4 mr-2" />
                Начать отслеживание
              </>
            )}
          </Button>

          <Button
            onClick={reset}
            variant="outline"
            disabled={!coordinates && !error}
            data-testid="button-reset"
          >
            Очистить
          </Button>
        </div>
      </Card>

      {/* Ошибки */}
      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-900">Ошибка</h4>
              <p className="text-sm text-red-800" data-testid="error-message">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Данные геолокации */}
      {coordinates && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Ваша локация</h3>
          
          <div className="space-y-4">
            {/* Координаты */}
            <div>
              <label className="text-sm text-gray-600">Координаты</label>
              <div className="flex gap-2 mt-1">
                <div className="flex-1 p-3 bg-gray-50 rounded-md border font-mono text-sm" data-testid="coordinates-display">
                  {coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleCopyCoordinates}
                  data-testid="button-copy"
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Google Maps ссылка */}
            {getMapsUrl() && (
              <div>
                <a
                  href={getMapsUrl() || ''}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  data-testid="link-google-maps"
                >
                  🗺️ Открыть в Google Maps
                </a>
              </div>
            )}

            {/* Детали */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <label className="text-xs text-gray-600">Точность</label>
                <p className="font-semibold" data-testid="accuracy">
                  {coordinates.accuracy.toFixed(1)} м
                </p>
              </div>

              {coordinates.speed !== null && (
                <div>
                  <label className="text-xs text-gray-600">Скорость</label>
                  <p className="font-semibold" data-testid="speed">
                    {(coordinates.speed * 3.6).toFixed(1)} км/ч
                  </p>
                </div>
              )}

              {coordinates.altitude !== null && (
                <div>
                  <label className="text-xs text-gray-600">Высота</label>
                  <p className="font-semibold" data-testid="altitude">
                    {coordinates.altitude.toFixed(1)} м
                  </p>
                </div>
              )}

              {coordinates.heading !== null && (
                <div>
                  <label className="text-xs text-gray-600">Направление</label>
                  <p className="font-semibold" data-testid="heading">
                    {coordinates.heading.toFixed(0)}°
                  </p>
                </div>
              )}
            </div>

            {/* Время */}
            {timestamp && (
              <div className="text-xs text-gray-500 pt-2 border-t">
                Обновлено: {new Date(timestamp).toLocaleTimeString()}
              </div>
            )}
          </div>
        </Card>
      )}

      {watching && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-900">
            📍 Отслеживание включено. Данные обновляются в реальном времени.
          </p>
        </Card>
      )}

      {/* Информация */}
      <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50">
        <h3 className="font-semibold mb-3">Что можно делать с геолокацией</h3>
        <ul className="space-y-2 text-sm">
          <li>✅ Отправить на карту (Google Maps, Yandex Maps)</li>
          <li>✅ Найти ближайшие магазины/места</li>
          <li>✅ Отследить маршрут движения</li>
          <li>✅ Заказать доставку с автоматической адресацией</li>
          <li>✅ Сохранить локацию в профиль пользователя</li>
          <li>✅ Показать погоду для региона</li>
          <li>✅ Найти друзей рядом (если разрешено)</li>
          <li>✅ Аналитика: откуда заходят пользователи</li>
        </ul>
      </Card>

      {/* Безопасность */}
      <Card className="p-6 bg-yellow-50 border-yellow-200">
        <h3 className="font-semibold mb-2">🔒 Безопасность</h3>
        <ul className="text-sm space-y-1 text-gray-700">
          <li>• Пользователь должен дать разрешение</li>
          <li>• Работает только на HTTPS (или localhost)</li>
          <li>• Браузер покажет запрос доступа</li>
          <li>• Данные не отправляются автоматически</li>
          <li>• Пользователь может отозвать доступ</li>
        </ul>
      </Card>
    </div>
  );
}
