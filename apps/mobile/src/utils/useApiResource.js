import { useCallback, useEffect, useState } from "react";

import apiClient from "./api";

export function useApiResource(path, options = {}) {
  const [data, setData] = useState(options.initialData ?? null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get(path, { params: options.params });
      setData(response.data);
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
