import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, FAB, Searchbar, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConnectionListItem } from '@/components/ConnectionListItem';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { useConnections } from '@/hooks/useConnections';

export default function ContactsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const { data: connections, isLoading, isRefetching, refetch } = useConnections({
    search: searchQuery || undefined,
    tag: activeTag ?? undefined,
  });

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    connections?.forEach((c) => c.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [connections]);

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          Contacts
        </Text>
        <Searchbar
          placeholder="Search by name or company"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchbar}
        />
        {allTags.length > 0 ? (
          <FlatList
            data={allTags}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(tag) => tag}
            contentContainerStyle={styles.tagList}
            renderItem={({ item: tag }) => (
              <Chip
                label={tag}
                selected={activeTag === tag}
                onPress={() => setActiveTag((prev) => (prev === tag ? null : tag))}
              />
            )}
          />
        ) : null}
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : connections && connections.length > 0 ? (
        <FlatList
          data={connections}
          keyExtractor={(item) => String(item.id)}
          refreshing={isRefetching}
          onRefresh={refetch}
          renderItem={({ item }) => (
            <ConnectionListItem
              connection={item}
              onPress={() => router.push(`/connection/${item.id}`)}
            />
          )}
        />
      ) : (
        <EmptyState
          icon="account-multiple-outline"
          title="No contacts yet"
          description="Scan someone's QR code or a paper business card to add them here."
        />
      )}

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color={theme.colors.onPrimary}
        onPress={() => router.push('/connection/add')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerTitle: {
    fontWeight: '700',
    marginBottom: 12,
  },
  searchbar: {
    marginBottom: 8,
  },
  tagList: {
    paddingVertical: 4,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    borderRadius: 16,
  },
});
