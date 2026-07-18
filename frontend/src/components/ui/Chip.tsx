import { Chip as PaperChip } from 'react-native-paper';

interface ChipProps {
  label: string;
  onPress?: () => void;
  onClose?: () => void;
  selected?: boolean;
  icon?: string;
}

export function Chip({ label, onPress, onClose, selected, icon }: ChipProps) {
  return (
    <PaperChip
      mode={selected ? 'flat' : 'outlined'}
      selected={selected}
      onPress={onPress}
      onClose={onClose}
      icon={icon}
      style={{ marginRight: 8, marginBottom: 8 }}
    >
      {label}
    </PaperChip>
  );
}
