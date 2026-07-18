import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { connectionsApi, type ConfirmScanPayload, type ConnectionListParams } from '@/api/connections.api';
import type { LocalImageAsset } from '@/api/profile.api';
import type { Connection, ConnectionManualInput } from '@/types';

export const connectionKeys = {
  all: ['connections'] as const,
  list: (params?: ConnectionListParams) => ['connections', 'list', params ?? {}] as const,
  detail: (id: number) => ['connections', 'detail', id] as const,
};

export function useConnections(params?: ConnectionListParams) {
  return useQuery({
    queryKey: connectionKeys.list(params),
    queryFn: () => connectionsApi.list(params),
  });
}

export function useConnection(id: number) {
  return useQuery({
    queryKey: connectionKeys.detail(id),
    queryFn: () => connectionsApi.getById(id),
    enabled: Number.isFinite(id),
  });
}

export function useCreateManualConnection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ConnectionManualInput) => connectionsApi.createManual(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: connectionKeys.all }),
  });
}

export function useSaveConnectionFromProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, notes, tags }: { slug: string; notes?: string; tags?: string[] }) =>
      connectionsApi.saveFromProfile(slug, notes, tags),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: connectionKeys.all }),
  });
}

export function useScanCard() {
  return useMutation({
    mutationFn: (asset: LocalImageAsset) => connectionsApi.scanCard(asset),
  });
}

export function useConfirmScan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ConfirmScanPayload) => connectionsApi.confirmScan(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: connectionKeys.all }),
  });
}

export function useUpdateConnection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<ConnectionManualInput> }) =>
      connectionsApi.update(id, payload),
    onSuccess: (updated: Connection) => {
      queryClient.invalidateQueries({ queryKey: connectionKeys.all });
      queryClient.setQueryData(connectionKeys.detail(updated.id), updated);
    },
  });
}

export function useDeleteConnection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => connectionsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: connectionKeys.all }),
  });
}
