import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Icon, SegmentedButtons, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { extractErrorMessage } from '@/api/client';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { useCreateProfile, useMyProfile, useUpdateProfile, useUploadAvatar } from '@/hooks/useProfile';
import { cardThemeOptions } from '@/theme/theme';
import type { CardTheme } from '@/types';
import { profileFormSchema, type ProfileFormValues } from '@/utils/validation';

export default function EditProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { data: existingProfile } = useMyProfile();
  const createProfile = useCreateProfile();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();

  const [cardTheme, setCardTheme] = useState<CardTheme>('classic');
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, reset, watch } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      display_name: '',
      title: '',
      company: '',
      bio: '',
      phone: '',
      public_email: '',
      website: '',
      address: '',
      linkedin: '',
      twitter: '',
      instagram: '',
      facebook: '',
    },
  });

  // Populate the form once the existing card (if any) has loaded.
  useEffect(() => {
    if (!existingProfile) return;
    reset({
      display_name: existingProfile.display_name,
      title: existingProfile.title ?? '',
      company: existingProfile.company ?? '',
      bio: existingProfile.bio ?? '',
      phone: existingProfile.phone ?? '',
      public_email: existingProfile.public_email ?? '',
      website: existingProfile.website ?? '',
      address: existingProfile.address ?? '',
      linkedin: existingProfile.social_links.linkedin ?? '',
      twitter: existingProfile.social_links.twitter ?? '',
      instagram: existingProfile.social_links.instagram ?? '',
      facebook: existingProfile.social_links.facebook ?? '',
    });
    setCardTheme(existingProfile.theme);
  }, [existingProfile, reset]);

  const displayNamePreview = watch('display_name');

  const handlePickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    try {
      await uploadAvatar.mutateAsync({
        uri: asset.uri,
        fileName: asset.fileName,
        mimeType: asset.mimeType,
      });
    } catch (error) {
      setServerError(extractErrorMessage(error));
    }
  };

  const onSubmit = async (values: ProfileFormValues) => {
    setServerError(null);
    setIsSubmitting(true);

    const payload = {
      display_name: values.display_name,
      title: values.title || null,
      company: values.company || null,
      bio: values.bio || null,
      phone: values.phone || null,
      public_email: values.public_email || null,
      website: values.website || null,
      address: values.address || null,
      social_links: {
        linkedin: values.linkedin || null,
        twitter: values.twitter || null,
        instagram: values.instagram || null,
        facebook: values.facebook || null,
      },
      theme: cardTheme,
    };

    try {
      if (existingProfile) {
        await updateProfile.mutateAsync(payload);
      } else {
        await createProfile.mutateAsync({ ...payload, is_public: true });
      }
      router.back();
    } catch (error) {
      setServerError(extractErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Pressable style={styles.avatarWrap} onPress={handlePickAvatar}>
          <Avatar uri={existingProfile?.avatar_url} name={displayNamePreview || '?'} size={88} />
          <View style={[styles.avatarBadge, { backgroundColor: theme.colors.primary }]}>
            <Icon source="camera" size={16} color={theme.colors.onPrimary} />
          </View>
        </Pressable>
        <Text variant="bodySmall" style={[styles.avatarHint, { color: theme.colors.onSurfaceVariant }]}>
          Tap to change photo
        </Text>

        <Text variant="titleSmall" style={styles.sectionLabel}>
          Card theme
        </Text>
        <SegmentedButtons
          value={cardTheme}
          onValueChange={(value) => setCardTheme(value as CardTheme)}
          buttons={cardThemeOptions.map((opt) => ({ value: opt.key, label: opt.label }))}
          style={styles.themeSelector}
        />

        <Text variant="titleSmall" style={styles.sectionLabel}>
          Basic info
        </Text>
        <TextField control={control} name="display_name" label="Full name" />
        <TextField control={control} name="title" label="Job title" />
        <TextField control={control} name="company" label="Company" />
        <TextField control={control} name="bio" label="Bio" multiline numberOfLines={3} />

        <Text variant="titleSmall" style={styles.sectionLabel}>
          Contact
        </Text>
        <TextField control={control} name="phone" label="Phone" keyboardType="phone-pad" />
        <TextField
          control={control}
          name="public_email"
          label="Public email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextField control={control} name="website" label="Website" autoCapitalize="none" />
        <TextField control={control} name="address" label="Address" />

        <Text variant="titleSmall" style={styles.sectionLabel}>
          Social links
        </Text>
        <TextField control={control} name="linkedin" label="LinkedIn URL" autoCapitalize="none" />
        <TextField control={control} name="twitter" label="Twitter / X URL" autoCapitalize="none" />
        <TextField control={control} name="instagram" label="Instagram URL" autoCapitalize="none" />
        <TextField control={control} name="facebook" label="Facebook URL" autoCapitalize="none" />

        {serverError ? (
          <Text style={[styles.serverError, { color: theme.colors.error }]}>{serverError}</Text>
        ) : null}

        <Button
          label={existingProfile ? 'Save changes' : 'Create card'}
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
          disabled={isSubmitting}
          style={styles.submitButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    padding: 20,
    paddingBottom: 48,
  },
  avatarWrap: {
    alignSelf: 'center',
  },
  avatarBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarHint: {
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  sectionLabel: {
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  themeSelector: {
    marginBottom: 8,
  },
  serverError: {
    marginTop: 8,
  },
  submitButton: {
    marginTop: 24,
  },
});
