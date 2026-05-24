import { privateEnv } from "$lib/environments/private";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export type FetchOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
};

/**
 * Fetch an endpoint from the backend API with Logto access token authentication.
 * On 401, retries once with a fresh token.
 */
export async function fetchBackend(locals: App.Locals, path: string, options?: FetchOptions): Promise<Response> {
  return _request(locals, path, options, 0);
}

/**
 * Fetch an endpoint from the backend API and parse the response as JSON.
 * On 401, retries once with a fresh token.
 */
export async function fetchBackendJson<T>(locals: App.Locals, path: string, options?: FetchOptions): Promise<T> {
  const response = await _request(locals, path, options, 0);
  return response.json() as Promise<T>;
}

/**
 * Fetch a PUBLIC endpoint from the backend API (no authentication).
 * Parses the response as JSON.
 */
export async function fetchPublicJson<T>(path: string, options?: FetchOptions): Promise<T> {
  const method = options?.method ?? 'GET';
  const url = `${privateEnv.backendApiUrl}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  const response = await fetch(url, {
    method,
    headers,
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    throw new ApiError(response.status, 'API_ERROR', `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

/**
 * Internal request helper with retry logic.
 */
async function _request(locals: App.Locals, path: string, options: FetchOptions | undefined, retryCount: number): Promise<Response> {
  let token: string;
  try {
    token = await locals.logtoClient.getAccessToken(privateEnv.logtoApiResource);
  } catch (cause) {
    throw new ApiError(401, "UNAUTHORIZED", cause instanceof Error ? cause.message : "Not authenticated");
  }

  console.log("[JWT]", token);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options?.headers,
  };

  const method = options?.method ?? "GET";
  const url = `${privateEnv.backendApiUrl}${path}`;
  const start = Date.now();

  const response = await fetch(url, {
    method,
    headers,
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 401 && retryCount < 1) {
    return _request(locals, path, options, retryCount + 1);
  }

  if (!response.ok) {
    throw new ApiError(response.status, "API_ERROR", `Request failed with status ${response.status}`);
  }

  return response;
}
