import { useEffect, useRef, useState } from 'react';

const PREFIX = 'aurelia:';

export function readStorage(key, fallback) {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeStorage(key, value) {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage may be unavailable (private mode / quota) — state still works in memory */
  }
}

/** useState that persists to localStorage and stays in sync across tabs. */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => readStorage(key, initialValue));
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    writeStorage(key, value);
  }, [key, value]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === PREFIX + key) setValue(readStorage(key, initialValue));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [value, setValue];
}
