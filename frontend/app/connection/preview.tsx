import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { extractErrorMessage } from '@/api/client';
import { DigitalCard } from '@/components/DigitalCard';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useSaveConnectionFromProfile } from '@/hooks/useConnections';
import { usePublicProfile } from '@/hooks/useProfile';

export default function ConnectionPreviewScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();

  const { data: profile, isLoading, isError } = usePublicProfile(slug ?? null);
  const saveConnection = useSaveConnectionFromProfile();
  const [serverError, setServerError] = useState<string | null>(null);
  const [didSave, setDidSave] = useState(false);

  const handleSave = async () => {
    if (!slug) return;
    setServerError(null);
    try {
      await saveConnection.mutateAsync({ slug });
      setDidSave(true);
      setTimeout(() => router.replace('/(tabs)/contacts'), 600);
    } catch (error) {
      setServerError(extractErrorMessage(error));
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (isError || !profile) {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: theme.colors.background }]}>
        <EmptyState
          icon="card-off-outline"
          title="Card not found"
          description="This QR code doesn't match an active Parichay card."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.colors.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <DigitalCard
          displayName={profile.display_name}
          title={profile.title}
          company={profile.company}
          avatarUrl={profile.avatar_url}
          theme={profile.theme}
        />

        {profile.bio ? (
          <Text variant="bodyMedium" style={styles.bio}>
            {profile.bio}
          </Text>
        ) : null}

        <View style={styles.detailsBlock}>
          {profile.public_email ? <DetailRow label="Email" value={profile.public_email} /> : null}
          {profile.phone ? <DetailRow label="Phone" value={profile.phone} /> : null}
          {profile.website ? <DetailRow label="Website" value={profile.website} /> : null}
        </View>

        {serverError ? (
          <Text style={[styles.serverError, { color: theme.colors.error }]}>{serverError}</Text>
        ) : null}

        <Button
          label={didSave ? 'Saved!' : 'Save to contacts'}
          icon={didSave ? 'check' : 'account-plus-outline'}
          onPress={handleSave}
          loading={saveConnection.isPending}
          disabled={saveConnection.isPending || didSave}
          style={styles.saveButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={styles.detailRow}>
      <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
        {label}
      </Text>
      <Text variant="bodyMedium">{value}</Text>
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
  bio: {
    marginTop: 20,
  },
  detailsBlock: {
    marginTop: 20,
    gap: 12,
  },
  detailRow: {
    gap: 2,
  },
  serverError: {
    marginTop: 16,
  },
  saveButton: {
    marginTop: 32,
  },
});
