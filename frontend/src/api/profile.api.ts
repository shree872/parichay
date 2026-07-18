import { apiClient } from '@/api/client';
import type { Profile, ProfileInput, PublicProfile } from '@/types';

export interface LocalImageAsset {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
}

export const profileApi = {
  async getMine(): Promise<Profile> {
    const { data } = await apiClient.get<Profile>('/profiles/me');
    return data;
  },

  async create(payload: ProfileInput): Promise<Profile> {
    const { data } = await apiClient.post<Profile>('/profiles/me', payload);
    return data;
  },

  async update(payload: Partial<ProfileInput>): Promise<Profile> {
    const { data } = await apiClient.put<Profile>('/profiles/me', payload);
    return data;
  },

  async uploadAvatar(asset: LocalImageAsset): Promise<Profile> {
    const formData = new FormData();
    const mimeType = asset.mimeType ?? 'image/jpeg';
    const extension = mimeType.split('/')[1] ?? 'jpg';

    // React Native's FormData accepts this shape even though it doesn't
    // match the DOM File type exactly.
    formData.append('file', {
      uri: asset.uri,
      name: asset.fileName ?? `avatar.${extension}`,
      type: mimeType,
    } as unknown as Blob);

    const { data } = await apiClient.post<Profile>('/profiles/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async getBySlug(slug: string): Promise<PublicProfile> {
    const { data } = await apiClient.get<PublicProfile>(`/profiles/slug/${slug}`);
    return data;
  },
};
