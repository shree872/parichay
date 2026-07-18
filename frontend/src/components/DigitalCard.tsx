import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';

import { Avatar } from '@/components/ui/Avatar';
import { cardThemePalettes } from '@/theme/theme';
import type { CardTheme } from '@/types';

interface DigitalCardProps {
  displayName: string;
  title?: string | null;
  company?: string | null;
  avatarUrl?: string | null;
  theme?: CardTheme;
  compact?: boolean;
}

export function DigitalCard({
  displayName,
  title,
  company,
  avatarUrl,
  theme = 'classic',
  compact = false,
}: DigitalCardProps) {
  const palette = cardThemePalettes[theme];

  return (
    <LinearGradient
      colors={[palette.gradientStart, palette.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, compact && styles.cardCompact]}
    >
      <View style={styles.headerRow}>
        <Avatar uri={avatarUrl} name={displayName} size={compact ? 48 : 64} />
        <View style={styles.brandMark}>
          <Icon source="card-account-details" size={20} color={palette.accent} />
        </View>
      </View>

      <View style={styles.info}>
        <Text
          variant={compact ? 'titleMedium' : 'headlineSmall'}
          style={[styles.name, { color: palette.textColor }]}
          numberOfLines={1}
        >
          {displayName}
        </Text>
        {title ? (
          <Text variant="bodyMedium" style={[styles.subtitle, { color: palette.accent }]} numberOfLines={1}>
            {title}
          </Text>
        ) : null}
        {company ? (
          <Text
            variant="bodySmall"
            style={[styles.subtitle, { color: palette.textColor, opacity: 0.85 }]}
            numberOfLines={1}
          >
            {company}
          </Text>
        ) : null}
      </View>

      <Text style={[styles.watermark, { color: palette.textColor }]}>Parichay</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 24,
    minHeight: 200,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  cardCompact: {
    minHeight: 140,
    padding: 16,
    borderRadius: 18,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  brandMark: {
    opacity: 0.8,
  },
  info: {
    marginTop: 16,
  },
  name: {
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 2,
  },
  watermark: {
    position: 'absolute',
    bottom: 12,
    right: 16,
    fontSize: 11,
    fontWeight: '600',
    opacity: 0.55,
    letterSpacing: 1,
  },
});
