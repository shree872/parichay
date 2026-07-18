import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { IconButton, Text, useTheme } from 'react-native-paper';

import { Avatar } from '@/components/ui/Avatar';
import { Chip } from '@/components/ui/Chip';
import type { Connection } from '@/types';

interface ConnectionListItemProps {
  connection: Connection;
  onPress: () => void;
}

export function ConnectionListItem({ connection, onPress }: ConnectionListItemProps) {
  const theme = useTheme();

  const subtitle = [connection.title, connection.company].filter(Boolean).join(' · ');

  return (
    <View style={[styles.row, { borderBottomColor: theme.colors.outlineVariant }]}>
      <Pressable style={styles.pressableRow} onPress={onPress}>
        <Avatar name={connection.full_name} size={48} />
        <View style={styles.textBlock}>
          <Text variant="titleSmall" numberOfLines={1}>
            {connection.full_name}
          </Text>
          {subtitle ? (
            <Text
              variant="bodySmall"
              numberOfLines={1}
              style={{ color: theme.colors.onSurfaceVariant }}
            >
              {subtitle}
            </Text>
          ) : null}
          {connection.tags.length > 0 ? (
            <View style={styles.tagRow}>
              {connection.tags.slice(0, 3).map((tag) => (
                <Chip key={tag} label={tag} />
              ))}
            </View>
          ) : null}
        </View>
      </Pressable>

      <View style={styles.actions}>
        {connection.phone ? (
          <IconButton
            icon="phone"
            size={20}
            onPress={() => Linking.openURL(`tel:${connection.phone}`)}
          />
        ) : null}
        {connection.email ? (
          <IconButton
            icon="email-outline"
            size={20}
            onPress={() => Linking.openURL(`mailto:${connection.email}`)}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  pressableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textBlock: {
    marginLeft: 12,
    flex: 1,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
  },
});
