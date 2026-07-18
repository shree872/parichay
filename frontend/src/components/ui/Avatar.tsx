import { Avatar as PaperAvatar, useTheme } from 'react-native-paper';

interface AvatarProps {
  uri?: string | null;
  name: string;
  size?: number;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}

export function Avatar({ uri, name, size = 64 }: AvatarProps) {
  const theme = useTheme();

  if (uri) {
    return <PaperAvatar.Image size={size} source={{ uri }} />;
  }

  return (
    <PaperAvatar.Text
      size={size}
      label={getInitials(name)}
      style={{ backgroundColor: theme.colors.primary }}
      labelStyle={{ color: theme.colors.onPrimary }}
    />
  );
}
