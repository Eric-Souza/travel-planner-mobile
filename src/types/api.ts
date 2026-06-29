export type ApiSuccessBody<T> = {
  data: T;
  request_id?: string;
};

export type ApiErrorDetail = {
  field?: string;
  message: string;
};

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
  };
  request_id?: string;
};

export type HealthResponse = {
  status: string;
  app_env?: string;
  database?: string;
};

export type TripStatus = 'planning' | 'active' | 'completed';

export type Trip = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  base_currency: string;
  home_timezone: string;
  status: TripStatus;
  created_at: string;
  updated_at: string;
};

export type TripSummary = Trip & {
  booking_count?: number;
  document_count?: number;
  itinerary_summary?: string;
};

export type TravelPreference = {
  trip_id: string;
  budget_level: 'budget' | 'moderate' | 'luxury';
  pace: 'relaxed' | 'moderate' | 'packed';
  interests: string[];
  food_preferences: string[];
  nightlife_interest: number;
  hiking_interest: number;
  skiing_interest: number;
  max_walking_minutes: number;
  preferred_start_time?: string;
  notes?: string;
};

export type BookingStatus = 'extracted' | 'confirmed' | 'rejected' | 'conflict';

export type BookingType =
  | 'flight'
  | 'hotel'
  | 'train'
  | 'bus'
  | 'activity'
  | 'restaurant'
  | 'custom';

export type Booking = {
  id: string;
  trip_id: string;
  type: BookingType;
  provider?: string;
  title: string;
  confirmation_code?: string;
  start_at: string;
  end_at: string;
  timezone: string;
  latitude?: number;
  longitude?: number;
  cost_amount?: number;
  currency?: string;
  status: BookingStatus;
  source_document_id?: string;
  source_page?: number;
  source_excerpt?: string;
  confidence?: number;
  uncertainty_notes?: string[];
  created_at: string;
  updated_at: string;
};

export type DocumentProcessingStatus =
  | 'uploaded'
  | 'parsing'
  | 'parsed'
  | 'extracting'
  | 'extracted'
  | 'embedding'
  | 'ready'
  | 'failed';

export type TravelDocument = {
  id: string;
  trip_id: string;
  file_name: string;
  file_type: string;
  mime_type: string;
  document_type?: string;
  processing_status: DocumentProcessingStatus;
  error_message?: string;
  uploaded_at: string;
  processed_at?: string;
};

export type DocumentProcessingStatusResponse = {
  document_id: string;
  processing_status: DocumentProcessingStatus;
  stage?: string;
  error_message?: string;
};

export type BookingCandidateResponse = {
  booking: Booking;
  document_id?: string;
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
  };
  is_duplicate?: boolean;
  duplicate_booking_id?: string;
  source_document_title?: string;
};

export type SourceCitation = {
  type: 'document' | 'booking' | 'tool' | 'user';
  title: string;
  page?: number;
  excerpt: string;
  source_id: string;
  fetched_at?: string;
};

export type ItineraryItemStatus = 'confirmed' | 'suggested' | 'locked';

export type ItineraryItem = {
  id: string;
  trip_id: string;
  date: string;
  start_time?: string;
  end_time?: string;
  title: string;
  description?: string;
  status: ItineraryItemStatus;
  place_id?: string;
  booking_id?: string;
  latitude?: number;
  longitude?: number;
  cost_amount?: number;
  currency?: string;
  weather_note?: string;
  warnings?: string[];
  source_refs?: SourceCitation[];
};

export type ItineraryVersion = {
  id: string;
  trip_id: string;
  version_number: number;
  items: ItineraryItem[];
  created_at: string;
};

export type ItineraryProposalItem = ItineraryItem & {
  replaces_item_id?: string;
};

export type ItineraryProposal = {
  id: string;
  trip_id: string;
  mode: 'standard' | 'rainy_day';
  target_date?: string;
  items: ItineraryProposalItem[];
  warnings: string[];
  sources: SourceCitation[];
  before_items?: ItineraryItem[];
  created_at: string;
};

export type ChatMessage = {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: SourceCitation[];
  status: 'complete' | 'streaming' | 'error';
  created_at: string;
};

export type Conversation = {
  id: string;
  trip_id: string;
  created_at: string;
};

export type PlaceCategory =
  | 'food'
  | 'hotel'
  | 'attraction'
  | 'ski'
  | 'nightlife'
  | 'transport';

export type Place = {
  id: string;
  trip_id: string;
  name: string;
  category: PlaceCategory;
  latitude: number;
  longitude: number;
  address?: string;
  source: 'user_saved' | 'search';
  user_saved: boolean;
};

export type ToolResultCard = {
  tool: string;
  title: string;
  summary: string;
  data: Record<string, unknown>;
  fetched_at?: string;
};

export type CreateTripInput = {
  name: string;
  start_date: string;
  end_date: string;
  base_currency: string;
  home_timezone: string;
};

export type UpdateTripInput = Partial<CreateTripInput & { status: TripStatus }>;

export type CreateBookingInput = {
  type: BookingType;
  title: string;
  provider?: string;
  confirmation_code?: string;
  start_at: string;
  end_at: string;
  timezone: string;
  latitude?: number;
  longitude?: number;
  cost_amount?: number;
  currency?: string;
};

export type PlaceSearchResult = {
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  address?: string;
  source: string;
};

export type GroundedAnswer = {
  question: string;
  answer: string;
  found: boolean;
  sources: SourceCitation[];
  not_found_reason?: string;
};

export type UpdateBookingInput = Partial<CreateBookingInput>;
