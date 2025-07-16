import { useState, useCallback, useEffect } from 'react';

interface ScreenEffects {
  shake: boolean;
  flash: boolean;
  bloodOverlay: boolean;
}

export const useScreenEffects = () => {
  const [effects, setEffects] = useState<ScreenEffects>({
    shake: false,
    flash: false,
    bloodOverlay: false,
  });

  const triggerShake = useCallback((duration: number = 300) => {
    setEffects(prev => ({ ...prev, shake: true }));
    setTimeout(() => {
      setEffects(prev => ({ ...prev, shake: false }));
    }, duration);
  }, []);

  const triggerFlash = useCallback((duration: number = 200) => {
    setEffects(prev => ({ ...prev, flash: true }));
    setTimeout(() => {
      setEffects(prev => ({ ...prev, flash: false }));
    }, duration);
  }, []);

  const triggerBloodOverlay = useCallback((duration: number = 500) => {
    setEffects(prev => ({ ...prev, bloodOverlay: true }));
    setTimeout(() => {
      setEffects(prev => ({ ...prev, bloodOverlay: false }));
    }, duration);
  }, []);

  return {
    effects,
    triggerShake,
    triggerFlash,
    triggerBloodOverlay,
  };
};