import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { HelperText, Menu, TextInput } from 'react-native-paper';

export type SelectOption = {
  value: string;
  label: string;
};

type FormSelectProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  options: readonly SelectOption[];
  error?: string;
  disabled?: boolean;
  searchable?: boolean;
};

export function FormSelect<T extends FieldValues>({
  control,
  name,
  label,
  options,
  error,
  disabled,
  searchable = false,
}: FormSelectProps<T>) {
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState('');

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => {
        const selected = options.find((o) => o.value === value);
        const filtered = searchable && query
          ? options.filter(
              (o) =>
                o.label.toLowerCase().includes(query.toLowerCase())
                || o.value.toLowerCase().includes(query.toLowerCase()),
            )
          : options;

        return (
          <View style={styles.wrap}>
            <Menu
              visible={visible}
              onDismiss={() => {
                setVisible(false);
                setQuery('');
              }}
              anchor={
                <TextInput
                  mode="outlined"
                  label={label}
                  value={selected?.label ?? ''}
                  editable={false}
                  disabled={disabled}
                  error={!!error}
                  right={
                    <TextInput.Icon
                      icon={visible ? 'menu-up' : 'menu-down'}
                      onPress={() => !disabled && setVisible(true)}
                      forceTextInputFocus={false}
                    />
                  }
                  onPressIn={() => !disabled && setVisible(true)}
                  showSoftInputOnFocus={false}
                />
              }
              contentStyle={styles.menu}
            >
              {searchable ? (
                <View style={styles.searchWrap}>
                  <TextInput
                    mode="flat"
                    placeholder="Search…"
                    value={query}
                    onChangeText={setQuery}
                    dense
                    left={<TextInput.Icon icon="magnify" />}
                  />
                </View>
              ) : null}
              <ScrollView style={styles.menuScroll}>
                {filtered.map((option) => (
                  <Menu.Item
                    key={option.value}
                    title={option.label}
                    onPress={() => {
                      onChange(option.value);
                      setVisible(false);
                      setQuery('');
                    }}
                  />
                ))}
              </ScrollView>
            </Menu>
            {error ? <HelperText type="error">{error}</HelperText> : null}
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 4,
  },
  menu: {
    maxHeight: 320,
  },
  menuScroll: {
    maxHeight: 260,
  },
  searchWrap: {
    paddingHorizontal: 8,
    paddingTop: 4,
  },
});
