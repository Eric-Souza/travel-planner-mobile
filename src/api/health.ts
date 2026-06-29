import { apiRequestRoot } from './client';
import type { HealthResponse } from '@/src/types/api';

export async function getHealth() {
  return apiRequestRoot<HealthResponse>('/health');
}
