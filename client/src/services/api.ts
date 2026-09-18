// Native Fetch-based API client with automatic token injection and silent 401 refresh

let inMemoryToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  inMemoryToken = token;
};

export const getAccessToken = (): string | null => {
  return inMemoryToken;
};

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  params?: Record<string, any>;
  responseType?: 'json' | 'blob' | 'text';
  _retry?: boolean;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  headers: Headers;
  success?: boolean;
}

export class ApiError extends Error {
  response?: {
    status: number;
    data: any;
  };

  constructor(message: string, status?: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    if (status !== undefined) {
      this.response = { status, data };
    }
  }
}

// Queue for handling multiple concurrent requests during silent refresh
let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

const processRefreshQueue = (error: any, token: string | null = null) => {
  refreshQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  refreshQueue = [];
};

async function executeFetch<T = any>(
  url: string,
  options: RequestOptions & { method: string; body?: any } = { method: 'GET' }
): Promise<ApiResponse<T>> {
  // Normalize URL with baseURL '/api'
  let targetUrl = url.startsWith('http') ? url : `/api${url.startsWith('/') ? url : `/${url}`}`;

  // Serialize query parameters
  if (options.params) {
    const searchParams = new URLSearchParams();
    Object.entries(options.params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        if (Array.isArray(val)) {
          val.forEach((item) => searchParams.append(key, String(item)));
        } else {
          searchParams.append(key, String(val));
        }
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      targetUrl += (targetUrl.includes('?') ? '&' : '?') + queryString;
    }
  }

  // Construct headers
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Inject Bearer token
  if (inMemoryToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${inMemoryToken}`);
  }

  const fetchConfig: RequestInit = {
    method: options.method,
    headers,
    credentials: 'include', // sends httpOnly refreshToken cookie
    signal: options.signal,
  };

  if (options.body !== undefined) {
    fetchConfig.body =
      typeof options.body === 'object' && !(options.body instanceof FormData)
        ? JSON.stringify(options.body)
        : options.body;
  }

  let response: Response;
  try {
    response = await fetch(targetUrl, fetchConfig);
  } catch (networkError: any) {
    if (networkError.name === 'AbortError') {
      throw networkError;
    }
    throw new ApiError(networkError.message || 'Network request failed');
  }

  // Handle 401 Unauthorized with silent refresh
  if (
    response.status === 401 &&
    !options._retry &&
    !url.includes('/auth/login') &&
    !url.includes('/auth/refresh')
  ) {
    if (isRefreshing) {
      try {
        const refreshedToken = await new Promise<string>((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        });
        const retryHeaders = new Headers(headers);
        retryHeaders.set('Authorization', `Bearer ${refreshedToken}`);
        return executeFetch<T>(url, {
          ...options,
          headers: retryHeaders,
          _retry: true,
        });
      } catch (err) {
        throw err;
      }
    }

    isRefreshing = true;
    try {
      const refreshRes = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const refreshJson = await refreshRes.json();
      const newAccessToken = refreshJson?.data?.accessToken;

      if (refreshRes.ok && newAccessToken) {
        setAccessToken(newAccessToken);
        processRefreshQueue(null, newAccessToken);
        const retryHeaders = new Headers(headers);
        retryHeaders.set('Authorization', `Bearer ${newAccessToken}`);
        return executeFetch<T>(url, {
          ...options,
          headers: retryHeaders,
          _retry: true,
        });
      } else {
        processRefreshQueue(new Error('Refresh session expired'), null);
        setAccessToken(null);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:session-expired'));
        }
      }
    } catch (refreshErr) {
      processRefreshQueue(refreshErr, null);
      setAccessToken(null);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:session-expired'));
      }
    } finally {
      isRefreshing = false;
    }
  }

  if (response.status === 401 && options._retry) {
    setAccessToken(null);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:session-expired'));
    }
  }

  // Parse response body based on expected type
  let data: any;
  const contentType = response.headers.get('content-type') || '';

  if (options.responseType === 'blob') {
    data = await response.blob();
  } else if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMsg = data?.alert?.message || data?.message || `Request failed with status ${response.status}`;
    throw new ApiError(errorMsg, response.status, data);
  }

  return {
    data,
    status: response.status,
    headers: response.headers,
    success: data?.success,
  };
}

export const api = {
  get: <T = any>(url: string, options?: RequestOptions) =>
    executeFetch<T>(url, { ...options, method: 'GET' }),
  post: <T = any>(url: string, body?: any, options?: RequestOptions) =>
    executeFetch<T>(url, { ...options, method: 'POST', body }),
  put: <T = any>(url: string, body?: any, options?: RequestOptions) =>
    executeFetch<T>(url, { ...options, method: 'PUT', body }),
  delete: <T = any>(url: string, options?: RequestOptions) =>
    executeFetch<T>(url, { ...options, method: 'DELETE' }),
};
