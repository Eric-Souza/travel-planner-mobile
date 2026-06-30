import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';
import { Alert } from 'react-native';
import { z } from 'zod';
import { PrimaryButton } from '@/src/components/Card';
import { FormDateField } from '@/src/components/FormDateField';
import { FormField } from '@/src/components/FormField';
import { FormSelect } from '@/src/components/FormSelect';
import { Screen } from '@/src/components/Screen';
import { CURRENCIES, TIMEZONES } from '@/src/constants/formOptions';
import { useCreateTrip } from '@/src/hooks/useTrips';

const tripSchema = z
  .object({
    name: z.string().min(1, 'Trip name is required'),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Pick a start date'),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Pick an end date'),
    base_currency: z.string().length(3, 'Select a currency'),
    home_timezone: z.string().min(1, 'Select a timezone'),
  })
  .refine((d) => d.end_date >= d.start_date, {
    message: 'End date must be on or after start date',
    path: ['end_date'],
  });

type TripForm = z.infer<typeof tripSchema>;

export default function CreateTripScreen() {
  const createTrip = useCreateTrip();
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TripForm>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      name: '',
      start_date: '',
      end_date: '',
      base_currency: 'USD',
      home_timezone: 'America/New_York',
    },
  });

  const startDate = watch('start_date');
  const minEndDate = startDate ? new Date(`${startDate}T12:00:00`) : undefined;

  const onSubmit = handleSubmit(async (values) => {
    try {
      const trip = await createTrip.mutateAsync(values);
      router.replace(`/trips/${trip.id}`);
    } catch (e) {
      Alert.alert('Could not create trip', (e as Error).message);
    }
  });

  return (
    <Screen title="New trip" subtitle="Set the basics — you can add bookings and preferences later." scroll>
      <FormField
        control={control}
        name="name"
        label="Trip name"
        autoCapitalize="words"
        error={errors.name?.message}
      />

      <FormDateField
        control={control}
        name="start_date"
        label="Start date"
        error={errors.start_date?.message}
      />

      <FormDateField
        control={control}
        name="end_date"
        label="End date"
        error={errors.end_date?.message}
        minDate={minEndDate}
      />

      <FormSelect
        control={control}
        name="base_currency"
        label="Base currency"
        options={CURRENCIES}
        error={errors.base_currency?.message}
      />

      <FormSelect
        control={control}
        name="home_timezone"
        label="Home timezone"
        options={TIMEZONES}
        searchable
        error={errors.home_timezone?.message}
      />

      <PrimaryButton
        label={createTrip.isPending ? 'Creating…' : 'Create trip'}
        onPress={() => void onSubmit()}
        disabled={createTrip.isPending}
        loading={createTrip.isPending}
        icon="check"
      />
    </Screen>
  );
}
