import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { toast } from 'react-hot-toast';

export interface GeolocationState {
  position: GeolocationPosition | null;
  error: GeolocationPositionError | null;
  loading: boolean;
  supported: boolean;
}

export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  when?: boolean;
  enableToasts?: boolean;
}

export interface GeolocationReturn extends GeolocationState {
  getCurrentPosition: () => Promise<GeolocationPosition | null>;
  watchPosition: () => number | null;
  clearWatch: () => void;
  refresh: () => void;
}

const getPositionErrorMessage = (error: GeolocationPositionError): string => {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'Location access denied by user';
    case error.POSITION_UNAVAILABLE:
      return 'Location information is unavailable';
    case error.TIMEOUT:
      return 'Location request timed out';
    default:
      return 'An unknown error occurred while retrieving location';
  }
};

export const useGeolocation = (options: GeolocationOptions = {}): GeolocationReturn => {
  const {
    enableHighAccuracy = false,
    timeout = 10000,
    maximumAge = 300000, // 5 minutes
    when = true,
    enableToasts = false,
  } = options;

  const [state, setState] = useState<GeolocationState>({
    position: null,
    error: null,
    loading: false,
    supported: 'geolocation' in navigator,
  });

  const watchIdRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const safeSetState = useCallback((newState: Partial<GeolocationState>) => {
    if (mountedRef.current) {
      setState(prev => ({ ...prev, ...newState }));
    }
  }, []);

  const positionOptions = useMemo((): PositionOptions => ({
    enableHighAccuracy,
    timeout,
    maximumAge,
  }), [enableHighAccuracy, timeout, maximumAge]);

  // Get current position once
  const getCurrentPosition = useCallback((): Promise<GeolocationPosition | null> => {
    return new Promise((resolve) => {
      if (!state.supported) {
        const error = {
          code: 0,
          message: 'Geolocation is not supported',
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        } as GeolocationPositionError;
        
        safeSetState({ error, loading: false });
        
        if (enableToasts) {
          toast.error('Geolocation is not supported in this browser');
        }
        
        resolve(null);
        return;
      }

      safeSetState({ loading: true, error: null });

      const successCallback = (position: GeolocationPosition) => {
        safeSetState({
          position,
          loading: false,
          error: null,
        });
        
        if (enableToasts) {
          toast.success('Location retrieved successfully');
        }
        
        resolve(position);
      };

      const errorCallback = (error: GeolocationPositionError) => {
        safeSetState({
          error,
          loading: false,
        });
        
        if (enableToasts) {
          toast.error(getPositionErrorMessage(error));
        }
        
        resolve(null);
      };

      navigator.geolocation.getCurrentPosition(
        successCallback,
        errorCallback,
        positionOptions
      );
    });
  }, [state.supported, safeSetState, enableToasts, positionOptions]);

  // Start watching position
  const watchPosition = useCallback((): number | null => {
    if (!state.supported) {
      if (enableToasts) {
        toast.error('Geolocation is not supported in this browser');
      }
      return null;
    }

    // Clear existing watch
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    safeSetState({ loading: true, error: null });

    const successCallback = (position: GeolocationPosition) => {
      safeSetState({
        position,
        loading: false,
        error: null,
      });
    };

    const errorCallback = (error: GeolocationPositionError) => {
      safeSetState({
        error,
        loading: false,
      });
      
      if (enableToasts) {
        toast.error(getPositionErrorMessage(error));
      }
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      successCallback,
      errorCallback,
      positionOptions
    );

    return watchIdRef.current;
  }, [state.supported, safeSetState, enableToasts, positionOptions]);

  // Clear position watch
  const clearWatch = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      safeSetState({ loading: false });
    }
  }, [safeSetState]);

  // Refresh current position
  const refresh = useCallback(() => {
    getCurrentPosition();
  }, [getCurrentPosition]);

  // Auto-get position on mount if enabled
  useEffect(() => {
    if (when && state.supported && !state.position && !state.loading) {
      getCurrentPosition();
    }
  }, [when, state.supported, state.position, state.loading, getCurrentPosition]);

  return {
    ...state,
    getCurrentPosition,
    watchPosition,
    clearWatch,
    refresh,
  };
};

// Helper hook for distance calculation
export const useGeolocationDistance = () => {
  const calculateDistance = useCallback(
    (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 6371; // Earth's radius in kilometers
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
          Math.cos(lat2 * (Math.PI / 180)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    },
    []
  );

  const getDistanceFromPosition = useCallback(
    (position: GeolocationPosition, targetLat: number, targetLon: number): number => {
      return calculateDistance(
        position.coords.latitude,
        position.coords.longitude,
        targetLat,
        targetLon
      );
    },
    [calculateDistance]
  );

  return {
    calculateDistance,
    getDistanceFromPosition,
  };
};

// Simple position hook
export const usePosition = (options: GeolocationOptions = {}) => {
  const { position, error, loading, getCurrentPosition } = useGeolocation(options);
  
  return {
    latitude: position?.coords.latitude,
    longitude: position?.coords.longitude,
    accuracy: position?.coords.accuracy,
    error,
    loading,
    getCurrentPosition,
  };
};

export default useGeolocation;