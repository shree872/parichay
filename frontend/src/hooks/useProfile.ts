import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { profileApi, type LocalImageAsset } from '@/api/profile.api';
import type { Profile, ProfileInput } from '@/types';

export const profileKeys = {
  mine: ['profile', 'me'] as const,
  bySlug: (slug: string) => ['profile', 'slug', slug] as const,
};

export function useMyProfile() {
  return useQuery({
    queryKey: profileKeys.mine,
    queryFn: profileApi.getMine,
    retry: (failureCount, error: any) => {
      // A 404 means "no card yet" - not worth retrying.
      if (error?.response?.status === 404) return false;
      return failureCount < 2;
    },
  });
}

export function useCreateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProfileInput) => profileApi.create(payload),
    onSuccess: (profile: Profile) => {
      queryClient.setQueryData(profileKeys.mine, profile);
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<ProfileInput>) => profileApi.update(payload),
    onSuccess: (profile: Profile) => {
      queryClient.setQueryData(profileKeys.mine, profile);
    },
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (asset: LocalImageAsset) => profileApi.uploadAvatar(asset),
    onSuccess: (profile: Profile) => {
      queryClient.setQueryData(profileKeys.mine, profile);
    },
  });
}

export function usePublicProfile(slug: string | null) {
  return useQuery({
    queryKey: profileKeys.bySlug(slug ?? ''),
    queryFn: () => profileApi.getBySlug(slug as string),
    enabled: Boolean(slug),
  });
}
