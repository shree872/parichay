import { useState } from 'react';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { HelperText, TextInput, type TextInputProps } from 'react-native-paper';

interface TextFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  secureTextEntry?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  multiline?: boolean;
  numberOfLines?: number;
  left?: TextInputProps['left'];
  placeholder?: string;
}

export function TextField<T extends FieldValues>({
  control,
  name,
  label,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  multiline = false,
  numberOfLines,
  left,
  placeholder,
}: TextFieldProps<T>) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPasswordField = Boolean(secureTextEntry);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <View style={styles.container}>
          <TextInput
            mode="outlined"
            label={label}
            placeholder={placeholder}
            value={(value as string) ?? ''}
            onChangeText={onChange}
            onBlur={onBlur}
            error={Boolean(error)}
            secureTextEntry={isPasswordField && !isPasswordVisible}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            multiline={multiline}
            numberOfLines={numberOfLines}
            left={left}
            right={
              isPasswordField ? (
                <TextInput.Icon
                  icon={isPasswordVisible ? 'eye-off' : 'eye'}
                  onPress={() => setIsPasswordVisible((prev) => !prev)}
                  forceTextInputFocus={false}
                />
              ) : undefined
            }
          />
          <HelperText type="error" visible={Boolean(error)}>
            {error?.message ?? ' '}
          </HelperText>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
});
