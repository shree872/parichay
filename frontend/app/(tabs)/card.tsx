import { useRouter } from 'expo-router';
import { RefreshControl, Share, ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { ActivityIndicator, Icon, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DigitalCard } from '@/components/DigitalCard';
import { QRCodeDisplay } from '@/components/QRCodeDisplay';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useMyProfile } from '@/hooks/useProfile';

export default function MyCardScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { data: profile, isLoading, isError, error, refetch, isRefetching } = useMyProfile();

  const hasNoCardYet = isError && (error as any)?.response?.status === 404;

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (hasNoCardYet) {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: theme.colors.background }]}>
        <EmptyState
          icon="card-account-details-outline"
          title="Create your digital card"
          description="Build your card once and share it instantly with a QR code."
        />
        <View style={styles.createButtonWrap}>
          <Button label="Create my card" onPress={() => router.push('/profile/edit')} />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !profile) {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: theme.colors.background }]}>
        <EmptyState
          icon="alert-circle-outline"
          title="Couldn't load your card"
          description="Pull down to try again."
        />
      </SafeAreaView>
    );
  }

  const handleShare = async () => {
    if (!profile.qr_payload) return;
    await Share.share({
      message: `Here's my digital business card on Parichay: ${profile.qr_payload}`,
      url: profile.qr_payload,
    });
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        <View style={styles.headerRow}>
          <Text variant="headlineSmall" style={styles.headerTitle}>
            My Card
          </Text>
          <Pressable onPress={() => router.push('/profile/edit')} hitSlop={12}>
            <Icon source="pencil-outline" size={24} color={theme.colors.primary} />
          </Pressable>
        </View>

        <DigitalCard
          displayName={profile.display_name}
          title={profile.title}
          company={profile.company}
          avatarUrl={profile.avatar_url}
          theme={profile.theme}
        />

        <View style={styles.qrSection}>
          <Text variant="titleMedium" style={styles.qrTitle}>
            Scan to connect
          </Text>
          {profile.qr_payload ? <QRCodeDisplay value={profile.qr_payload} /> : null}
          <Text
            variant="bodySmall"
            style={[styles.slugText, { color: theme.colors.onSurfaceVariant }]}
          >
            parichay.app/c/{profile.slug}
          </Text>
        </View>

        <Button
          label="Share my card"
          icon="share-variant"
          mode="outlined"
          onPress={handleShare}
          style={styles.shareButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontWeight: '700',
  },
  qrSection: {
    alignItems: 'center',
    marginTop: 32,
  },
  qrTitle: {
    marginBottom: 16,
    fontWeight: '600',
  },
  slugText: {
    marginTop: 12,
  },
  shareButton: {
    marginTop: 32,
  },
  createButtonWrap: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
});
