import { useState, useEffect, useCallback } from 'react';
import { AnalyticsSummary } from '../types/index.js';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';

export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const { showAlert } = useToast();

  const fetchAnalytics = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get('/analytics/summary');
      if (res.data?.success) {
        setAnalytics(res.data.data);
      }
    } catch (err: any) {
      const msg = err.response?.data?.alert?.message || err.message || 'Failed to load analytics.';
      setError(msg);
      showAlert({
        type: 'error',
        title: 'Analytics Load Error',
        message: msg,
      });
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, showAlert]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    isLoading,
    error,
    refreshAnalytics: fetchAnalytics,
  };
};
