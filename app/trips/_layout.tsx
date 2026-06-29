import { Stack } from 'expo-router';

export default function TripsLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen name="index" options={{ title: 'My Trips' }} />
      <Stack.Screen name="create" options={{ title: 'Create Trip' }} />
      <Stack.Screen name="[tripId]" options={{ headerShown: false }} />
    </Stack>
  );
}
