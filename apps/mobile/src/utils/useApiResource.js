import { useCallback, useEffect, useState } from "react";

import { loadFirebaseResource } from "./firebaseData";

export function useApiResource(path, options = {}) {
  const [data, setData] = useState(options.initialData ?? null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setData(await loadFirebaseResource(path, options.params));
    } catch (requestError) {
      setError(requestError.response?.data?.detail || requestError.message);
    } finally {
      setLoading(false);
    }
  }, [path, JSON.stringify(options.params || {})]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refetch: load };
}
