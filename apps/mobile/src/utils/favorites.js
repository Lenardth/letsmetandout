import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'safemeet:saved-items';
let cached = {};
const listeners = new Set();

function notify() {
  listeners.forEach((listener) => listener({ ...cached }));
}

export function useFavorites() {
  const [saved, setSaved] = useState(cached);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      if (!active || !value) return;
      try {
        cached = JSON.parse(value);
        setSaved({ ...cached });
      } catch {
        // Ignore malformed local state and start with an empty collection.
      }
    });
    const listener = (next) => setSaved(next);
    listeners.add(listener);
    return () => {
      active = false;
      listeners.delete(listener);
    };
  }, []);

  const toggle = useCallback(async (id, item) => {
    const key = String(id);
    if (cached[key]) delete cached[key];
    else cached[key] = item;
    setSaved({ ...cached });
    notify();
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cached));
  }, []);

  return { saved, toggle, isSaved: (id) => !!saved[String(id)] };
}
