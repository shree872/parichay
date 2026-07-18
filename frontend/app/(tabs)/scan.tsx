import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Icon, SegmentedButtons, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { extractErrorMessage } from '@/api/client';
import { Button } from '@/components/ui/Button';
import { useScanCard } from '@/hooks/useConnections';

type ScanMode = 'qr' | 'card';

/** Extracts a Parichay card slug from a scanned QR value, whatever format it's in. */
function extractSlugFromQrValue(value: string): string | null {
  try {
    const url = new URL(value);
    const parts = url.pathname.split('/').filter(Boolean);
    const cIndex = parts.indexOf('c');
    if (cIndex !== -1 && parts[cIndex + 1]) return parts[cIndex + 1];
    return null;
  } catch {
    // Not a URL - treat the raw scanned value as the slug itself.
    return value.trim() || null;
  }
}

export default function ScanScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [mode, setMode] = useState<ScanMode>('qr');
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessingScan, setIsProcessingScan] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const hasHandledScan = useRef(false);

  const scanCardMutation = useScanCard();

  const handleBarcodeScanned = useCallback(
    ({ data }: { data: string }) => {
      if (hasHandledScan.current) return;
      hasHandledScan.current = true;
      setScanError(null);

      const slug = extractSlugFromQrValue(data);
      if (!slug) {
        setScanError('That QR code is not a Parichay card.');
        setTimeout(() => {
          hasHandledScan.current = false;
        }, 1500);
        return;
      }

      router.push({ pathname: '/connection/preview', params: { slug } });
      setTimeout(() => {
        hasHandledScan.current = false;
      }, 1500);
    },
    [router]
  );

  const handleScanPaperCard = async () => {
    setScanError(null);
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
    });
    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    setIsProcessingScan(true);
    try {
      const extracted = await scanCardMutation.mutateAsync({
        uri: asset.uri,
        fileName: asset.fileName,
        mimeType: asset.mimeType,
      });
      router.push({
        pathname: '/connection/add',
        params: {
          full_name: extracted.full_name ?? '',
          title: extracted.title ?? '',
          company: extracted.company ?? '',
          email: extracted.email ?? '',
          phone: extracted.phone ?? '',
          website: extracted.website ?? '',
          raw_image_url: extracted.raw_image_url,
        },
      });
    } catch (error) {
      setScanError(extractErrorMessage(error));
    } finally {
      setIsProcessingScan(false);
    }
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          Scan
        </Text>
        <SegmentedButtons
          value={mode}
          onValueChange={(value) => setMode(value as ScanMode)}
          buttons={[
            { value: 'qr', label: 'Scan QR', icon: 'qrcode-scan' },
            { value: 'card', label: 'Scan Card', icon: 'card-text-outline' },
          ]}
          style={styles.segmented}
        />
      </View>

      {mode === 'qr' ? (
        <View style={styles.cameraWrap}>
          {!permission ? (
            <ActivityIndicator size="large" style={styles.center} />
          ) : !permission.granted ? (
            <View style={styles.center}>
              <Icon source="camera-off-outline" size={48} color={theme.colors.onSurfaceVariant} />
              <Text style={styles.permissionText}>Camera access is needed to scan QR codes.</Text>
              <Button label="Grant permission" onPress={requestPermission} style={styles.permButton} />
            </View>
          ) : (
            <View style={styles.cameraContainer}>
              <CameraView
                style={StyleSheet.absoluteFill}
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                onBarcodeScanned={handleBarcodeScanned}
              />
              <View style={styles.scanFrame} pointerEvents="none" />
              {scanError ? (
                <View style={[styles.errorBanner, { backgroundColor: theme.colors.errorContainer }]}>
                  <Text style={{ color: theme.colors.onErrorContainer }}>{scanError}</Text>
                </View>
              ) : (
                <Text style={styles.hintText}>Point your camera at a Parichay QR code</Text>
              )}
            </View>
          )}
        </View>
      ) : (
        <View style={styles.cardScanContainer}>
          <Icon source="card-text-outline" size={56} color={theme.colors.primary} />
          <Text variant="titleMedium" style={styles.cardScanTitle}>
            AI Business Card Scanner
          </Text>
          <Text
            variant="bodyMedium"
            style={[styles.cardScanDescription, { color: theme.colors.onSurfaceVariant }]}
          >
            Take a photo of a paper business card. We'll extract the name, title, company, and
            contact details automatically — you can review before saving.
          </Text>
          {scanError ? (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>{scanError}</Text>
          ) : null}
          <Button
            label={isProcessingScan ? 'Reading card…' : 'Take a photo'}
            icon="camera"
            onPress={handleScanPaperCard}
            loading={isProcessingScan}
            disabled={isProcessingScan}
            style={styles.cardScanButton}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: {
    fontWeight: '700',
    marginBottom: 12,
  },
  segmented: {},
  cameraWrap: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  cameraContainer: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  scanFrame: {
    position: 'absolute',
    top: '25%',
    left: '15%',
    right: '15%',
    bottom: '35%',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.85)',
    borderRadius: 20,
  },
  hintText: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  errorBanner: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  permissionText: {
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  permButton: {
    minWidth: 200,
  },
  cardScanContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  cardScanTitle: {
    marginTop: 16,
    fontWeight: '600',
  },
  cardScanDescription: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  cardScanButton: {
    minWidth: 220,
  },
  errorText: {
    marginBottom: 12,
    textAlign: 'center',
  },
});
