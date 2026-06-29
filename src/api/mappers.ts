import type {
  Booking,
  BookingCandidateResponse,
  ItineraryItem,
  ItineraryProposal,
  ItineraryProposalItem,
  ItineraryVersion,
  Place,
  SourceCitation,
  ToolResultCard,
  TravelDocument,
  TravelPreference,
} from '@/src/types/api';

/** Backend PreferenceRead / PreferenceUpdate shapes */
export type PreferenceApi = {
  id?: string;
  trip_id: string;
  budget_level: string;
  pace: string;
  interests: string | null;
  food_preferences: string | null;
  nightlife_interest: number;
  hiking_interest: number;
  skiing_interest: number;
  max_walking_minutes: number;
  preferred_start_time?: string | null;
  notes?: string | null;
};

/** Backend BookingRead */
export type BookingApi = {
  id: string;
  trip_id: string;
  type: string;
  provider?: string | null;
  title: string;
  confirmation_code?: string | null;
  start_at: string;
  end_at: string;
  timezone: string;
  latitude?: number | null;
  longitude?: number | null;
  cost_amount?: number | null;
  currency?: string | null;
  status: string;
  source_document_id?: string | null;
  source_page?: number | null;
  source_excerpt?: string | null;
  confidence?: number | null;
  uncertainty_notes?: string | null;
  created_at: string;
  updated_at: string;
};

export type BookingCandidateApi = {
  booking: BookingApi | null;
  document_id: string;
  extraction?: {
    type: string;
    provider?: string | null;
    title: string;
    confirmation_code?: string | null;
    start_at: string;
    end_at: string;
    timezone: string;
    source_evidence?: { excerpt: string; page?: number | null }[];
    confidence: number;
    uncertainty_notes?: string[];
  } | null;
  is_duplicate: boolean;
  duplicate_booking_id?: string | null;
};

export type ItineraryItemApi = {
  id: string;
  trip_id: string;
  date: string;
  start_time?: string | null;
  end_time?: string | null;
  title: string;
  description?: string | null;
  place_id?: string | null;
  booking_id?: string | null;
  is_confirmed: boolean;
  is_locked: boolean;
  is_outdoor?: boolean;
  warnings?: string | null;
  source_refs?: string | null;
};

export type ItineraryProposalItemApi = {
  date: string;
  start_time?: string | null;
  end_time?: string | null;
  title: string;
  description?: string | null;
  is_confirmed: boolean;
  is_locked: boolean;
  is_outdoor: boolean;
  booking_id?: string | null;
  place_id?: string | null;
  warnings?: string[];
};

export type ItineraryProposalApi = {
  id: string;
  trip_id: string;
  status: string;
  mode: string;
  target_date?: string | null;
  items: ItineraryProposalItemApi[];
  warnings: string[];
  before_items?: ItineraryProposalItemApi[] | null;
  created_at: string;
  updated_at?: string;
};

export type ItineraryVersionApi = {
  id: string;
  trip_id: string;
  version_number: number;
  is_active: boolean;
  items: ItineraryItemApi[];
  created_at: string;
  updated_at: string;
};

export type PlaceApi = {
  id: string;
  trip_id: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  address?: string | null;
  source: string;
  user_saved: boolean;
  created_at?: string;
  updated_at?: string;
};

export type PlaceSearchResultApi = {
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  address?: string | null;
  source: string;
};

export type DocumentApi = {
  id: string;
  trip_id: string;
  file_name: string;
  file_type: string;
  mime_type: string;
  document_type?: string | null;
  processing_status: string;
  error_message?: string | null;
  uploaded_at?: string;
  processed_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export function splitCommaList(value: string | null | undefined): string[] {
  if (!value?.trim()) return [];
  return value.split(',').map((s) => s.trim()).filter(Boolean);
}

export function joinCommaList(values: string[] | undefined): string | undefined {
  if (!values?.length) return undefined;
  return values.join(', ');
}

export function parseJsonStringArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return value ? [value] : [];
  }
}

export function mapPreferenceFromApi(raw: PreferenceApi): TravelPreference {
  return {
    trip_id: raw.trip_id,
    budget_level: raw.budget_level as TravelPreference['budget_level'],
    pace: raw.pace as TravelPreference['pace'],
    interests: splitCommaList(raw.interests),
    food_preferences: splitCommaList(raw.food_preferences),
    nightlife_interest: raw.nightlife_interest,
    hiking_interest: raw.hiking_interest,
    skiing_interest: raw.skiing_interest,
    max_walking_minutes: raw.max_walking_minutes,
    preferred_start_time: raw.preferred_start_time ?? undefined,
    notes: raw.notes ?? undefined,
  };
}

export function mapPreferenceToApi(
  pref: Partial<Omit<TravelPreference, 'trip_id'>>,
): Partial<PreferenceApi> {
  return {
    budget_level: pref.budget_level,
    pace: pref.pace,
    interests: pref.interests ? joinCommaList(pref.interests) ?? null : undefined,
    food_preferences: pref.food_preferences
      ? joinCommaList(pref.food_preferences) ?? null
      : undefined,
    nightlife_interest: pref.nightlife_interest,
    hiking_interest: pref.hiking_interest,
    skiing_interest: pref.skiing_interest,
    max_walking_minutes: pref.max_walking_minutes,
    preferred_start_time: pref.preferred_start_time ?? null,
    notes: pref.notes ?? null,
  };
}

export function mapBookingFromApi(raw: BookingApi): Booking {
  return {
    id: raw.id,
    trip_id: raw.trip_id,
    type: raw.type as Booking['type'],
    provider: raw.provider ?? undefined,
    title: raw.title,
    confirmation_code: raw.confirmation_code ?? undefined,
    start_at: raw.start_at,
    end_at: raw.end_at,
    timezone: raw.timezone,
    latitude: raw.latitude ?? undefined,
    longitude: raw.longitude ?? undefined,
    cost_amount: raw.cost_amount ?? undefined,
    currency: raw.currency ?? undefined,
    status: raw.status as Booking['status'],
    source_document_id: raw.source_document_id ?? undefined,
    source_page: raw.source_page ?? undefined,
    source_excerpt: raw.source_excerpt ?? undefined,
    confidence: raw.confidence ?? undefined,
    uncertainty_notes: parseJsonStringArray(raw.uncertainty_notes),
    created_at: raw.created_at,
    updated_at: raw.updated_at,
  };
}

export function mapDocumentFromApi(raw: DocumentApi): TravelDocument {
  return {
    id: raw.id,
    trip_id: raw.trip_id,
    file_name: raw.file_name,
    file_type: raw.file_type,
    mime_type: raw.mime_type,
    document_type: raw.document_type ?? undefined,
    processing_status: raw.processing_status as TravelDocument['processing_status'],
    error_message: raw.error_message ?? undefined,
    uploaded_at: raw.uploaded_at ?? raw.created_at ?? new Date().toISOString(),
    processed_at: raw.processed_at ?? undefined,
  };
}

export function mapBookingCandidateFromApi(raw: BookingCandidateApi): BookingCandidateResponse {
  if (raw.booking) {
    return {
      booking: mapBookingFromApi(raw.booking),
      document_id: raw.document_id,
      extraction: raw.extraction ?? undefined,
      is_duplicate: raw.is_duplicate,
      duplicate_booking_id: raw.duplicate_booking_id ?? undefined,
    };
  }

  if (raw.extraction) {
    const excerpt = raw.extraction.source_evidence?.[0]?.excerpt;
    return {
      booking: {
        id: '',
        trip_id: '',
        type: raw.extraction.type as Booking['type'],
        provider: raw.extraction.provider ?? undefined,
        title: raw.extraction.title,
        confirmation_code: raw.extraction.confirmation_code ?? undefined,
        start_at: raw.extraction.start_at,
        end_at: raw.extraction.end_at,
        timezone: raw.extraction.timezone,
        status: 'extracted',
        source_excerpt: excerpt,
        confidence: raw.extraction.confidence,
        uncertainty_notes: raw.extraction.uncertainty_notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      document_id: raw.document_id,
      extraction: raw.extraction,
      is_duplicate: raw.is_duplicate,
      duplicate_booking_id: raw.duplicate_booking_id ?? undefined,
    };
  }

  throw new Error('No booking candidate in response');
}

function mapItineraryItemFromApi(raw: ItineraryItemApi): ItineraryItem {
  const dateOnly = raw.date.includes('T') ? raw.date.slice(0, 10) : raw.date;
  let status: ItineraryItem['status'] = 'suggested';
  if (raw.is_locked || raw.is_confirmed) status = raw.is_locked ? 'locked' : 'confirmed';

  return {
    id: raw.id,
    trip_id: raw.trip_id,
    date: dateOnly,
    start_time: raw.start_time ?? undefined,
    end_time: raw.end_time ?? undefined,
    title: raw.title,
    description: raw.description ?? undefined,
    status,
    place_id: raw.place_id ?? undefined,
    booking_id: raw.booking_id ?? undefined,
    warnings: parseJsonStringArray(raw.warnings),
  };
}

function mapProposalItemFromApi(
  raw: ItineraryProposalItemApi,
  tripId: string,
  index: number,
): ItineraryProposalItem {
  let status: ItineraryItem['status'] = 'suggested';
  if (raw.is_locked || raw.is_confirmed) status = raw.is_locked ? 'locked' : 'confirmed';

  return {
    id: `proposal-item-${index}-${raw.date}-${raw.title}`,
    trip_id: tripId,
    date: raw.date,
    start_time: raw.start_time ?? undefined,
    end_time: raw.end_time ?? undefined,
    title: raw.title,
    description: raw.description ?? undefined,
    status,
    place_id: raw.place_id ?? undefined,
    booking_id: raw.booking_id ?? undefined,
    warnings: raw.warnings,
  };
}

export function mapItineraryVersionFromApi(raw: ItineraryVersionApi): ItineraryVersion {
  return {
    id: raw.id,
    trip_id: raw.trip_id,
    version_number: raw.version_number,
    items: raw.items.map(mapItineraryItemFromApi),
    created_at: raw.created_at,
  };
}

export function mapItineraryProposalFromApi(raw: ItineraryProposalApi): ItineraryProposal {
  return {
    id: raw.id,
    trip_id: raw.trip_id,
    mode: raw.mode as ItineraryProposal['mode'],
    target_date: raw.target_date ?? undefined,
    items: raw.items.map((item, i) => mapProposalItemFromApi(item, raw.trip_id, i)),
    warnings: raw.warnings,
    sources: [],
    before_items: raw.before_items?.map((item, i) =>
      mapProposalItemFromApi(item, raw.trip_id, i),
    ),
    created_at: raw.created_at,
  };
}

export function mapPlaceFromApi(raw: PlaceApi): Place {
  return {
    id: raw.id,
    trip_id: raw.trip_id,
    name: raw.name,
    category: raw.category as Place['category'],
    latitude: raw.latitude,
    longitude: raw.longitude,
    address: raw.address ?? undefined,
    source: raw.user_saved ? 'user_saved' : 'search',
    user_saved: raw.user_saved,
  };
}

export function mapPlaceSearchToCreate(
  result: PlaceSearchResultApi,
): {
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  address?: string;
  user_saved: boolean;
} {
  return {
    name: result.name,
    category: result.category,
    latitude: result.latitude,
    longitude: result.longitude,
    address: result.address ?? undefined,
    user_saved: true,
  };
}

export function mapToolResultFromSse(data: {
  tool: string;
  result: Record<string, unknown>;
}): ToolResultCard {
  const { tool, result } = data;
  if (tool === 'get_weather') {
    return {
      tool,
      title: 'Weather',
      summary: `${result.condition} — ${result.temperature_low}° to ${result.temperature_high}°`,
      data: result,
      fetched_at: result.fetched_at as string | undefined,
    };
  }
  if (tool === 'get_exchange_rate') {
    return {
      tool,
      title: 'Exchange rate',
      summary: `1 ${result.from_currency} = ${result.rate} ${result.to_currency}`,
      data: result,
      fetched_at: result.fetched_at as string | undefined,
    };
  }
  return {
    tool,
    title: tool,
    summary: JSON.stringify(result),
    data: result,
  };
}

export function toTripDatetime(dateOnly: string): string {
  if (dateOnly.includes('T')) return dateOnly;
  return `${dateOnly}T00:00:00Z`;
}

export function normalizeChatStreamEvent(
  eventType: string,
  data: Record<string, unknown>,
): import('@/src/api/chat').ChatStreamEvent | null {
  switch (eventType) {
    case 'status':
      return { event: 'status', data: { message: String(data.message ?? '') } };
    case 'sources':
      return {
        event: 'sources',
        data: { sources: (data.sources as SourceCitation[]) ?? [] },
      };
    case 'token':
      return { event: 'token', data: { text: String(data.text ?? '') } };
    case 'tool_result':
      return {
        event: 'tool_result',
        data: mapToolResultFromSse({
          tool: String(data.tool ?? ''),
          result: (data.result as Record<string, unknown>) ?? {},
        }),
      };
    case 'error':
      return { event: 'error', data: { message: String(data.message ?? 'Unknown error') } };
    case 'done':
      return {
        event: 'done',
        data: {
          message_id: String(data.message_id ?? ''),
          sources: data.sources as SourceCitation[] | undefined,
        },
      };
    default:
      return null;
  }
}
