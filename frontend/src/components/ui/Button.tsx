import { StyleSheet } from 'react-native';
import { Button as PaperButton, type ButtonProps } from 'react-native-paper';

interface AppButtonProps extends Omit<ButtonProps, 'children'> {
  label: string;
}

export function Button({ label, mode = 'contained', style, ...rest }: AppButtonProps) {
  return (
    <PaperButton mode={mode} style={[styles.button, style]} contentStyle={styles.content} {...rest}>
      {label}
    </PaperButton>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
  },
  content: {
    height: 48,
  },
});
