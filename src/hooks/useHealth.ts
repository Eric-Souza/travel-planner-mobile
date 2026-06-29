import { useQuery } from '@tanstack/react-query';
import * as healthApi from '@/src/api/health';
import { getNetworkErrorMessage } from '@/src/utils/errors';

export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const { data } = await healthApi.getHealth();
      return data;
    },
    retry: 1,
    meta: { errorMessage: (e: unknown) => getNetworkErrorMessage(e) },
  });
}
