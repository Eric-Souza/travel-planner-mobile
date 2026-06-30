import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { HelperText, TextInput, type TextInputProps } from 'react-native-paper';

type FormFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  error?: string;
} & Omit<TextInputProps, 'value' | 'onChangeText' | 'onBlur' | 'error'>;

export function FormField<T extends FieldValues>({
  control,
  name,
  label,
  error,
  ...inputProps
}: FormFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <>
          <TextInput
            mode="outlined"
            label={label}
            value={value ?? ''}
            onChangeText={onChange}
            onBlur={onBlur}
            error={!!error}
            {...inputProps}
          />
          {error ? <HelperText type="error">{error}</HelperText> : null}
        </>
      )}
    />
  );
}
