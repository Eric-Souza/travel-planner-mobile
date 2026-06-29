import { ApiError } from '@/src/api/client';
import type { ApiErrorBody } from '@/src/types/api';

export function parseApiError(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}

export function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    typeof (value as ApiErrorBody).error.message === 'string'
  );
}

export function getNetworkErrorMessage(error: unknown): string {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return 'Cannot reach the API. Check EXPO_PUBLIC_API_BASE_URL and that the backend is running.';
  }
  return parseApiError(error);
}
