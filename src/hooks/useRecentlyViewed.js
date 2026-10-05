import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage.js';

export function useRecentlyViewed(limit = 8) {
  const [ids, setIds] = useLocalStorage('recently-viewed', []);
  const track = useCallback(
    (id) => setIds((prev) => [id, ...prev.filter((x) => x !== id)].slice(0, limit)),
    [setIds, limit],
  );
  return { ids, track };
}
