import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Booking, ItineraryVersion, Place, Trip } from '@/src/types/api';
import type { ChatMessage } from '@/src/types/api';

const PREFIX = '@travel_planner/';

export type CachedTripData = {
  trip: Trip;
  bookings: Booking[];
  itinerary?: ItineraryVersion;
  places: Place[];
  messages: ChatMessage[];
  syncedAt: string;
};

export async function cacheTripData(tripId: string, data: CachedTripData): Promise<void> {
  await AsyncStorage.setItem(`${PREFIX}trip/${tripId}`, JSON.stringify(data));
}

export async function getCachedTripData(tripId: string): Promise<CachedTripData | null> {
  const raw = await AsyncStorage.getItem(`${PREFIX}trip/${tripId}`);
  if (!raw) return null;
  return JSON.parse(raw) as CachedTripData;
}

export async function cacheTripsList(trips: Trip[]): Promise<void> {
  await AsyncStorage.setItem(`${PREFIX}trips`, JSON.stringify({ trips, syncedAt: new Date().toISOString() }));
}

export async function getCachedTripsList(): Promise<{ trips: Trip[]; syncedAt: string } | null> {
  const raw = await AsyncStorage.getItem(`${PREFIX}trips`);
  if (!raw) return null;
  return JSON.parse(raw) as { trips: Trip[]; syncedAt: string };
}

export async function clearCache(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const appKeys = keys.filter((k) => k.startsWith(PREFIX));
  await Promise.all(appKeys.map((k) => AsyncStorage.removeItem(k)));
}
