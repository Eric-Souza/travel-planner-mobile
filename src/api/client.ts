import type { ApiErrorBody, ApiSuccessBody } from '@/src/types/api';

const DEFAULT_BASE_URL = 'http://localhost:8000/v1';

export function getApiBaseUrl(): string {
  const url = process.env.EXPO_PUBLIC_API_BASE_URL ?? DEFAULT_BASE_URL;
  return url.replace(/\/$/, '');
}

export function getApiRootUrl(): string {
  const base = getApiBaseUrl();
  return base.endsWith('/v1') ? base.slice(0, -3) : base;
}

export class ApiError extends Error {
  readonly code: string;
  readonly details: ApiErrorBody['error']['details'];
  readonly requestId?: string;
  readonly status: number;

  constructor(status: number, body: ApiErrorBody) {
    super(body.error.message);
    this.name = 'ApiError';
    this.status = status;
    this.code = body.error.code;
    this.details = body.error.details;
    this.requestId = body.request_id;
  }
}

function isErrorBody(value: unknown): value is ApiErrorBody {
  return (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    typeof (value as ApiErrorBody).error?.message === 'string'
  );
}

function isSuccessBody<T>(value: unknown): value is ApiSuccessBody<T> {
  return typeof value === 'object' && value !== null && 'data' in value;
}

export type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<{ data: T; requestId?: string }> {
  const { method = 'GET', body, headers = {}, signal } = options;
  const url = path.startsWith('http') ? path : `${getApiBaseUrl()}${path}`;

  const response = await fetch(url, {
    method,
    headers: {
      Accept: 'application/json',
      ...(body !== undefined && !(body instanceof FormData)
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...headers,
    },
    body:
      body === undefined
        ? undefined
        : body instanceof FormData
          ? body
          : JSON.stringify(body),
    signal,
  });

  const text = await response.text();
  let parsed: unknown = {};
  if (text) {
    try {
      parsed = JSON.parse(text) as unknown;
    } catch {
      throw new ApiError(response.status, {
        error: {
          code: 'PARSE_ERROR',
          message: 'The server returned an invalid response.',
        },
      });
    }
  }

  if (!response.ok) {
    if (isErrorBody(parsed)) {
      throw new ApiError(response.status, parsed);
    }
    throw new ApiError(response.status, {
      error: {
        code: 'HTTP_ERROR',
        message: `Request failed with status ${response.status}.`,
      },
    });
  }

  if (isSuccessBody<T>(parsed)) {
    return { data: parsed.data, requestId: parsed.request_id };
  }

  return { data: parsed as T };
}

export async function apiRequestRoot<T>(
  path: string,
  options?: RequestOptions,
): Promise<{ data: T; requestId?: string }> {
  const root = getApiRootUrl();
  return apiRequest<T>(`${root}${path}`, options);
}
