import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TravelDocument } from '@/src/types/api';

const KEY_PREFIX = '@travel_planner/documents/';

export async function getTripDocuments(tripId: string): Promise<TravelDocument[]> {
  const raw = await AsyncStorage.getItem(`${KEY_PREFIX}${tripId}`);
  if (!raw) return [];
  return JSON.parse(raw) as TravelDocument[];
}

export async function addTripDocument(doc: TravelDocument): Promise<void> {
  const existing = await getTripDocuments(doc.trip_id);
  const updated = [doc, ...existing.filter((d) => d.id !== doc.id)];
  await AsyncStorage.setItem(`${KEY_PREFIX}${doc.trip_id}`, JSON.stringify(updated));
}

export async function updateTripDocument(doc: TravelDocument): Promise<void> {
  const existing = await getTripDocuments(doc.trip_id);
  const updated = existing.map((d) => (d.id === doc.id ? doc : d));
  if (!updated.some((d) => d.id === doc.id)) {
    updated.unshift(doc);
  }
  await AsyncStorage.setItem(`${KEY_PREFIX}${doc.trip_id}`, JSON.stringify(updated));
}
