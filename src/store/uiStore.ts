import { create } from 'zustand';
import type { SourceCitation } from '@/src/types/api';

type UiState = {
  selectedSource: SourceCitation | null;
  setSelectedSource: (source: SourceCitation | null) => void;
  demoMode: boolean;
  setDemoMode: (enabled: boolean) => void;
  activeTripTab: string;
  setActiveTripTab: (tab: string) => void;
  uploadDocumentId: string | null;
  setUploadDocumentId: (id: string | null) => void;
};

export const useUiStore = create<UiState>((set) => ({
  selectedSource: null,
  setSelectedSource: (selectedSource) => set({ selectedSource }),
  demoMode: false,
  setDemoMode: (demoMode) => set({ demoMode }),
  activeTripTab: 'overview',
  setActiveTripTab: (activeTripTab) => set({ activeTripTab }),
  uploadDocumentId: null,
  setUploadDocumentId: (uploadDocumentId) => set({ uploadDocumentId }),
}));
