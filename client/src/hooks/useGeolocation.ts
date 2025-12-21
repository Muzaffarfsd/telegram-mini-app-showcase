import { useState, useEffect, useCallback } from 'react';

export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
}

export interface GeolocationState {
  coordinates: GeolocationCoordinates | null;
  loading: boolean;
  error: string | null;
  timestamp: number | null;
}

const defaultState: GeolocationState = {
  coordinates: null,
  loading: false,
  error: null,
  timestamp: null,
};

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>(defaultState);
  const [watching, setWatching] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  // Получить текущую позицию один раз
  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation API not supported in this browser'
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      position => {
        setState({
          coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
          },
          loading: false,
          error: null,
          timestamp: position.timestamp,
        });
      },
      error => {
        let errorMessage = 'Unknown error';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permission denied. Allow location access in browser settings';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Position unavailable. Check your connection';
            break;
          case error.TIMEOUT:
            errorMessage = 'Request timeout. Try again';
            break;
        }

        setState(prev => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  // Отслеживать позицию в реальном времени
  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation API not supported'
      }));
      return;
    }

    const id = navigator.geolocation.watchPosition(
      position => {
        setState({
          coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
          },
          loading: false,
          error: null,
          timestamp: position.timestamp,
        });
      },
      error => {
        let errorMessage = 'Unknown error';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permission denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Position unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Request timeout';
            break;
        }

        setState(prev => ({
          ...prev,
          error: errorMessage,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    setWatchId(id);
    setWatching(true);
  }, []);

  // Остановить отслеживание
  const stopWatching = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setWatching(false);
    }
  }, [watchId]);

  // Очистить состояние
  const reset = useCallback(() => {
    stopWatching();
    setState(defaultState);
  }, [stopWatching]);

  // Очистить при размонтировании
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return {
    ...state,
    getCurrentPosition,
    startWatching,
    stopWatching,
    watching,
    reset,
  };
}
