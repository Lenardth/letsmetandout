import { useCallback, useEffect, useRef, useState } from "react";

import { withDeadline } from './auth/request';
import { useAuthStore } from './auth/store';
import { loadFirebaseResource } from "./firebaseData";

export function useApiResource(path, options = {}) {
  const uid = useAuthStore((state) => state.auth?.user?.id);
  const revision = useRef(0);
  const [data, setData] = useState(options.initialData ?? null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    const current = ++revision.current;
    setLoading(true);
    setError(null);

    try {
      const result = await withDeadline(loadFirebaseResource(path, options.params), 'This screen could not be loaded. Check your connection and refresh.');
      if (current === revision.current) setData(result);
    } catch (requestError) {
      if (current === revision.current) { setData(null); setError(requestError.response?.data?.detail || requestError.message); }
    } finally {
      if (current === revision.current) setLoading(false);
    }
  }, [uid, path, JSON.stringify(options.params || {})]);

  useEffect(() => {
    load();
    return () => { revision.current += 1; };
  }, [load]);

  return { data, loading, error, refetch: load };
}
