export const queryKeys = {
  trips: ['trips'] as const,
  trip: (tripId: string) => ['trips', tripId] as const,
  preferences: (tripId: string) => ['trips', tripId, 'preferences'] as const,
  bookings: (tripId: string, status?: string) =>
    status ? (['trips', tripId, 'bookings', status] as const) : (['trips', tripId, 'bookings'] as const),
  documents: (tripId: string) => ['trips', tripId, 'documents'] as const,
  documentStatus: (documentId: string) => ['documents', documentId, 'status'] as const,
  bookingCandidate: (documentId: string) => ['documents', documentId, 'booking-candidate'] as const,
  itineraries: (tripId: string) => ['trips', tripId, 'itineraries'] as const,
  proposal: (proposalId: string) => ['itinerary-proposals', proposalId] as const,
  conversations: (tripId: string) => ['trips', tripId, 'conversations'] as const,
  messages: (conversationId: string) => ['conversations', conversationId, 'messages'] as const,
  places: (tripId: string, category?: string) =>
    category
      ? (['trips', tripId, 'places', category] as const)
      : (['trips', tripId, 'places'] as const),
  health: ['health'] as const,
};
