const AUTH_SERVICE = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL!;

interface SafeFetchOptions extends RequestInit {
  skipAuth?: boolean;
}

let isRefreshing = false;
let refreshQueue: Array<() => void> = [];

async function tryRefresh(): Promise<boolean> {
  if (isRefreshing) {
    // wait for ongoing refresh to complete
    return new Promise(resolve => {
      refreshQueue.push(() => resolve(true));
    });
  }

  isRefreshing = true;

  try {
    const res = await fetch(`${AUTH_SERVICE}/auth/refresh`, {
      method:      "POST",
      credentials: "include",
    });

    const success = res.ok;

    // resolve all queued requests
    refreshQueue.forEach(resolve => resolve());
    refreshQueue = [];

    return success;
  } catch {
    return false;
  } finally {
    isRefreshing = false;
  }
}

export async function safeFetch(
  url: string,
  options: SafeFetchOptions = {}
): Promise<Response> {
  const { skipAuth = false, ...fetchOptions } = options;

  // always include cookies
  const opts: RequestInit = {
    ...fetchOptions,
    credentials: "include",
  };

  if (skipAuth) {
    return fetch(url, opts);
  }

  // first attempt
  const res = await fetch(url, opts);

  // if 401 — try token rotation
  if (res.status === 401) {
    const refreshed = await tryRefresh();

    if (!refreshed) {
      // refresh failed — redirect to login
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return res;
    }

    // retry original request with new cookie
    return fetch(url, opts);
  }

  return res;
}