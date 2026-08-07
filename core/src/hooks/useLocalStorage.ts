import { useState, useEffect, useRef } from "react";
import {
  getStorageItem,
  setStorageItem,
  subscribeToCrossTabSync,
} from "../utils/storage";

export function useLocalStorage<T>(key: string, fallback: T) {
  const fallbackRef = useRef(fallback);

  const [value, setValue] = useState<T>(() => {
    return getStorageItem<T>(key, fallback);
  });

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setStorageItem<T>(key, value);
  }, [key, value]);

  useEffect(() => {
    const unsubscribe = subscribeToCrossTabSync((updatedKey: string, newValue: unknown) => {
      if (updatedKey === key) {
        setValue(newValue !== null ? (newValue as T) : fallbackRef.current);
      }
    });
    return unsubscribe;
  }, [key]);

  return [value, setValue] as const;
}
