import Constants from 'expo-constants';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Avatar as PaperAvatar, Divider, List, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

export default function SettingsScreen() {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          Settings
        </Text>

        <View style={styles.profileRow}>
          <PaperAvatar.Text
            size={56}
            label={(user?.full_name ?? '?').slice(0, 2).toUpperCase()}
            style={{ backgroundColor: theme.colors.primary }}
          />
          <View style={styles.profileText}>
            <Text variant="titleMedium">{user?.full_name}</Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {user?.email}
            </Text>
          </View>
        </View>

        <Divider style={styles.divider} />

        <List.Section>
          <List.Subheader>Appearance</List.Subheader>
          <List.Item
            title="Theme"
            description="Follows your device's light/dark setting"
            left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
          />
        </List.Section>

        <List.Section>
          <List.Subheader>About</List.Subheader>
          <List.Item
            title="Version"
            description={Constants.expoConfig?.version ?? '1.0.0'}
            left={(props) => <List.Icon {...props} icon="information-outline" />}
          />
        </List.Section>

        <Button
          label="Log out"
          mode="outlined"
          icon="logout"
          onPress={handleLogout}
          loading={isLoggingOut}
          disabled={isLoggingOut}
          textColor={theme.colors.error}
          style={styles.logoutButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  headerTitle: {
    fontWeight: '700',
    marginBottom: 20,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileText: {
    marginLeft: 16,
  },
  divider: {
    marginVertical: 20,
  },
  logoutButton: {
    marginTop: 12,
  },
});
