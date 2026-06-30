import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { useState } from 'react';
import { View } from 'react-native';
import { HelperText, TextInput } from 'react-native-paper';
import { DatePickerModal, TimePickerModal } from 'react-native-paper-dates';
import {
  combineDateAndTime,
  formatTimeLabel,
  getTimeParts,
  parseDateOnly,
  parseIsoDateTime,
  toDateOnlyString,
} from '@/src/utils/datetime';
import { ensureDatePickerTranslations } from '@/src/utils/paperDates';

ensureDatePickerTranslations();

type FormDateFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  error?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
};

export function FormDateField<T extends FieldValues>({
  control,
  name,
  label,
  error,
  disabled,
  minDate,
  maxDate,
}: FormDateFieldProps<T>) {
  const [open, setOpen] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <View>
          <TextInput
            mode="outlined"
            label={label}
            value={value ?? ''}
            editable={false}
            disabled={disabled}
            error={!!error}
            right={
              <TextInput.Icon
                icon="calendar"
                onPress={() => !disabled && setOpen(true)}
                forceTextInputFocus={false}
              />
            }
            onPressIn={() => !disabled && setOpen(true)}
            showSoftInputOnFocus={false}
          />
          <DatePickerModal
            locale="en"
            mode="single"
            visible={open}
            onDismiss={() => setOpen(false)}
            date={parseDateOnly(value) ?? new Date()}
            validRange={{ startDate: minDate, endDate: maxDate }}
            onConfirm={({ date }) => {
              setOpen(false);
              if (date) onChange(toDateOnlyString(date));
            }}
          />
          {error ? <HelperText type="error">{error}</HelperText> : null}
        </View>
      )}
    />
  );
}

type FormDateTimeFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  error?: string;
  disabled?: boolean;
};

export function FormDateTimeField<T extends FieldValues>({
  control,
  name,
  label,
  error,
  disabled,
}: FormDateTimeFieldProps<T>) {
  const [dateOpen, setDateOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => {
        const parsed = parseIsoDateTime(value);
        const dateLabel = parsed ? toDateOnlyString(parsed) : 'Pick date';
        const { hours, minutes } = getTimeParts(value);
        const timeLabel = parsed ? formatTimeLabel(hours, minutes) : 'Pick time';

        return (
          <View>
            <TextInput
              mode="outlined"
              label={label}
              value={parsed ? `${dateLabel} · ${timeLabel}` : ''}
              editable={false}
              disabled={disabled}
              error={!!error}
              right={
                <TextInput.Icon
                  icon="calendar-clock"
                  onPress={() => !disabled && setDateOpen(true)}
                  forceTextInputFocus={false}
                />
              }
              onPressIn={() => !disabled && setDateOpen(true)}
              showSoftInputOnFocus={false}
            />
            <DatePickerModal
              locale="en"
              mode="single"
              visible={dateOpen}
              onDismiss={() => setDateOpen(false)}
              date={parsed ?? new Date()}
              onConfirm={({ date }) => {
                setDateOpen(false);
                if (!date) return;
                const { hours: h, minutes: m } = getTimeParts(value);
                onChange(combineDateAndTime(date, parsed ? h : 12, parsed ? m : 0));
                if (!parsed) setTimeOpen(true);
              }}
            />
            <TimePickerModal
              visible={timeOpen}
              onDismiss={() => setTimeOpen(false)}
              onConfirm={({ hours: h, minutes: m }) => {
                setTimeOpen(false);
                const base = parsed ?? new Date();
                onChange(combineDateAndTime(base, h, m));
              }}
              hours={hours}
              minutes={minutes}
              use24HourClock={false}
            />
            {error ? <HelperText type="error">{error}</HelperText> : null}
          </View>
        );
      }}
    />
  );
}
