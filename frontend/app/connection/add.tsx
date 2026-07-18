import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Text, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { API_BASE_URL, extractErrorMessage } from '@/api/client';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { TextField } from '@/components/ui/TextField';
import { useConfirmScan, useCreateManualConnection } from '@/hooks/useConnections';
import { manualConnectionSchema, type ManualConnectionFormValues } from '@/utils/validation';

/** API_BASE_URL ends in /api/v1; media is served from the API host root. */
function toAbsoluteMediaUrl(path: string): string {
  const origin = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
  return `${origin}${path}`;
}

export default function AddConnectionScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{
    full_name?: string;
    title?: string;
    company?: string;
    email?: string;
    phone?: string;
    website?: string;
    raw_image_url?: string;
  }>();

  const isFromScan = Boolean(params.raw_image_url);
  const createManual = useCreateManualConnection();
  const confirmScan = useConfirmScan();

  const [tagDraft, setTagDraft] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);

  const { control, handleSubmit } = useForm<ManualConnectionFormValues>({
    resolver: zodResolver(manualConnectionSchema),
    defaultValues: {
      full_name: params.full_name ?? '',
      title: params.title ?? '',
      company: params.company ?? '',
      email: params.email ?? '',
      phone: params.phone ?? '',
      website: params.website ?? '',
      notes: '',
    },
  });

  const addTag = () => {
    const trimmed = tagDraft.trim();
    if (trimmed && !tags.includes(trimmed)) setTags((prev) => [...prev, trimmed]);
    setTagDraft('');
  };
  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  const onSubmit = async (values: ManualConnectionFormValues) => {
    setServerError(null);
    const payload = {
      full_name: values.full_name,
      title: values.title || null,
      company: values.company || null,
      email: values.email || null,
      phone: values.phone || null,
      website: values.website || null,
      notes: values.notes || null,
      tags,
    };

    try {
      if (isFromScan) {
        await confirmScan.mutateAsync({ ...payload, raw_image_url: params.raw_image_url ?? null });
      } else {
        await createManual.mutateAsync(payload);
      }
      router.replace('/(tabs)/contacts');
    } catch (error) {
      setServerError(extractErrorMessage(error));
    }
  };

  const isSubmitting = createManual.isPending || confirmScan.isPending;

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text variant="headlineSmall" style={styles.title}>
          {isFromScan ? 'Review scanned card' : 'Add a contact'}
        </Text>

        {isFromScan && params.raw_image_url ? (
          <Image
            source={{ uri: toAbsoluteMediaUrl(params.raw_image_url) }}
            style={styles.previewImage}
            resizeMode="cover"
          />
        ) : null}

        {isFromScan ? (
          <Text variant="bodySmall" style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
            We pre-filled these fields from the photo. Double-check them before saving.
          </Text>
        ) : null}

        <TextField control={control} name="full_name" label="Full name" />
        <TextField control={control} name="title" label="Job title" />
        <TextField control={control} name="company" label="Company" />
        <TextField control={control} name="email" label="Email" autoCapitalize="none" />
        <TextField control={control} name="phone" label="Phone" keyboardType="phone-pad" />
        <TextField control={control} name="website" label="Website" autoCapitalize="none" />
        <TextField control={control} name="notes" label="Notes" multiline numberOfLines={3} />

        <Text variant="titleSmall" style={styles.sectionLabel}>
          Tags
        </Text>
        <View style={styles.tagRow}>
          {tags.map((tag) => (
            <Chip key={tag} label={tag} onClose={() => removeTag(tag)} />
          ))}
        </View>
        <TextInput
          mode="outlined"
          label="Add a tag"
          value={tagDraft}
          onChangeText={setTagDraft}
          onSubmitEditing={addTag}
          returnKeyType="done"
          right={<TextInput.Icon icon="plus" onPress={addTag} />}
          style={styles.tagInput}
        />

        {serverError ? (
          <Text style={[styles.serverError, { color: theme.colors.error }]}>{serverError}</Text>
        ) : null}

        <Button
          label="Save contact"
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
  title: {
    fontWeight: '700',
    marginBottom: 12,
  },
  previewImage: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    marginBottom: 12,
  },
  hint: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 8,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagInput: {
    marginBottom: 8,
  },
  serverError: {
    marginTop: 8,
  },
  submitButton: {
    marginTop: 24,
  },
});
