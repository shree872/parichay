import { apiClient } from '@/api/client';
import type { LocalImageAsset } from '@/api/profile.api';
import type { Connection, ConnectionManualInput, ScanExtractResult } from '@/types';

export interface ConnectionListParams {
  search?: string;
  tag?: string;
}

export interface ConfirmScanPayload extends ConnectionManualInput {
  raw_image_url: string | null;
}

export const connectionsApi = {
  async list(params?: ConnectionListParams): Promise<Connection[]> {
    const { data } = await apiClient.get<Connection[]>('/connections', { params });
    return data;
  },

  async getById(id: number): Promise<Connection> {
    const { data } = await apiClient.get<Connection>(`/connections/${id}`);
    return data;
  },

  async createManual(payload: ConnectionManualInput): Promise<Connection> {
    const { data } = await apiClient.post<Connection>('/connections/manual', payload);
    return data;
  },

  async saveFromProfile(slug: string, notes?: string, tags?: string[]): Promise<Connection> {
    const { data } = await apiClient.post<Connection>('/connections/from-profile', {
      slug,
      notes: notes ?? null,
      tags: tags ?? [],
    });
    return data;
  },

  async scanCard(asset: LocalImageAsset): Promise<ScanExtractResult> {
    const formData = new FormData();
    const mimeType = asset.mimeType ?? 'image/jpeg';
    const extension = mimeType.split('/')[1] ?? 'jpg';

    formData.append('file', {
      uri: asset.uri,
      name: asset.fileName ?? `card.${extension}`,
      type: mimeType,
    } as unknown as Blob);

    const { data } = await apiClient.post<ScanExtractResult>('/connections/scan', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async confirmScan(payload: ConfirmScanPayload): Promise<Connection> {
    const { data } = await apiClient.post<Connection>('/connections/from-scan', payload);
    return data;
  },

  async update(id: number, payload: Partial<ConnectionManualInput>): Promise<Connection> {
    const { data } = await apiClient.patch<Connection>(`/connections/${id}`, payload);
    return data;
  },

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/connections/${id}`);
  },
};
