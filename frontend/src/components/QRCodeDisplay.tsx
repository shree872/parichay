import { View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  backgroundColor?: string;
  color?: string;
}

export function QRCodeDisplay({
  value,
  size = 220,
  backgroundColor = '#FFFFFF',
  color = '#000000',
}: QRCodeDisplayProps) {
  return (
    <View
      style={{
        padding: 16,
        borderRadius: 20,
        backgroundColor,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <QRCode value={value} size={size} backgroundColor={backgroundColor} color={color} />
    </View>
  );
}
