import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Linking, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, IconButton, Text, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { extractErrorMessage } from '@/api/client';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { TextField } from '@/components/ui/TextField';
import { useConnection, useDeleteConnection, useUpdateConnection } from '@/hooks/useConnections';
import { manualConnectionSchema, type ManualConnectionFormValues } from '@/utils/validation';

const SOURCE_LABELS: Record<string, string> = {
  qr: 'Added via QR scan',
  scan: 'Added via card scan',
  manual: 'Added manually',
};

export default function ConnectionDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const connectionId = Number(id);

  const { data: connection, isLoading } = useConnection(connectionId);
  const updateConnection = useUpdateConnection();
  const deleteConnection = useDeleteConnection();

  const [tagDraft, setTagDraft] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { control, handleSubmit, reset } = useForm<ManualConnectionFormValues>({
    resolver: zodResolver(manualConnectionSchema),
    defaultValues: { full_name: '', title: '', company: '', email: '', phone: '', website: '', notes: '' },
  });

  useEffect(() => {
    if (!connection) return;
    reset({
      full_name: connection.full_name,
      title: connection.title ?? '',
      company: connection.company ?? '',
      email: connection.email ?? '',
      phone: connection.phone ?? '',
      website: connection.website ?? '',
      notes: connection.notes ?? '',
    });
    setTags(connection.tags);
  }, [connection, reset]);

  if (isLoading || !connection) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  const addTag = () => {
    const trimmed = tagDraft.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
    }
    setTagDraft('');
  };

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  const onSubmit = async (values: ManualConnectionFormValues) => {
    setServerError(null);
    try {
      await updateConnection.mutateAsync({
        id: connectionId,
        payload: {
          full_name: values.full_name,
          title: values.title || null,
          company: values.company || null,
          email: values.email || null,
          phone: values.phone || null,
          website: values.website || null,
          notes: values.notes || null,
          tags,
        },
      });
      setIsEditing(false);
    } catch (error) {
      setServerError(extractErrorMessage(error));
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete contact', `Remove ${connection.full_name} from your contacts?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteConnection.mutateAsync(connectionId);
          router.back();
        },
      },
    ]);
  };

  if (isEditing) {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
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

          <View style={styles.editActions}>
            <Button
              label="Cancel"
              mode="outlined"
              onPress={() => setIsEditing(false)}
              style={styles.flexButton}
            />
            <Button
              label="Save"
              onPress={handleSubmit(onSubmit)}
              loading={updateConnection.isPending}
              style={styles.flexButton}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileHeader}>
          <Avatar name={connection.full_name} size={80} />
          <Text variant="headlineSmall" style={styles.name}>
            {connection.full_name}
          </Text>
          {connection.title || connection.company ? (
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              {[connection.title, connection.company].filter(Boolean).join(' · ')}
            </Text>
          ) : null}
          <Text
            variant="labelSmall"
            style={[styles.sourceLabel, { color: theme.colors.onSurfaceVariant }]}
          >
            {SOURCE_LABELS[connection.source] ?? connection.source}
          </Text>
        </View>

        <View style={styles.quickActions}>
          {connection.phone ? (
            <QuickAction
              icon="phone"
              label="Call"
              onPress={() => Linking.openURL(`tel:${connection.phone}`)}
            />
          ) : null}
          {connection.email ? (
            <QuickAction
              icon="email-outline"
              label="Email"
              onPress={() => Linking.openURL(`mailto:${connection.email}`)}
            />
          ) : null}
          {connection.website ? (
            <QuickAction
              icon="web"
              label="Website"
              onPress={() =>
                Linking.openURL(
                  connection.website!.startsWith('http')
                    ? connection.website!
                    : `https://${connection.website}`
                )
              }
            />
          ) : null}
        </View>

        {connection.tags.length > 0 ? (
          <View style={styles.tagRow}>
            {connection.tags.map((tag) => (
              <Chip key={tag} label={tag} />
            ))}
          </View>
        ) : null}

        {connection.notes ? (
          <View style={styles.notesBlock}>
            <Text variant="titleSmall" style={styles.sectionLabel}>
              Notes
            </Text>
            <Text variant="bodyMedium">{connection.notes}</Text>
          </View>
        ) : null}

        <View style={styles.editActions}>
          <Button
            label="Edit"
            mode="outlined"
            icon="pencil-outline"
            onPress={() => setIsEditing(true)}
            style={styles.flexButton}
          />
          <IconButton icon="delete-outline" iconColor={theme.colors.error} onPress={handleDelete} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickAction({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  const theme = useTheme();
  return (
    <View style={styles.quickActionItem}>
      <IconButton
        icon={icon}
        mode="contained-tonal"
        size={24}
        onPress={onPress}
        containerColor={theme.colors.primaryContainer}
        iconColor={theme.colors.primary}
      />
      <Text variant="labelSmall">{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: {
    padding: 20,
    paddingBottom: 48,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  name: {
    marginTop: 12,
    fontWeight: '700',
  },
  sourceLabel: {
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 20,
  },
  quickActionItem: {
    alignItems: 'center',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tagInput: {
    marginBottom: 8,
  },
  notesBlock: {
    marginTop: 12,
  },
  sectionLabel: {
    fontWeight: '600',
    marginBottom: 8,
  },
  serverError: {
    marginTop: 8,
  },
  editActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 24,
  },
  flexButton: {
    flex: 1,
  },
});
