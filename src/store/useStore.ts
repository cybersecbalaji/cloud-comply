import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import type { Control } from '@/types';
import controlsData from '@/data/controls.json';

interface Filters {
  search: string;
  framework: 'All' | 'ISM' | 'ISO 27001';
  cloud: 'All' | 'AWS' | 'Azure';
  coverageStatus: 'All' | 'Covered' | 'Partial' | 'Gap';
  serviceCategory: string;
  ismGuideline: string;
  isoTheme: string;
  service: string;
  classificationLevel: string;
}

interface AppState {
  controls: Control[];
  filters: Filters;
  selectedControl: Control | null;
  darkMode: boolean;
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  resetFilters: () => void;
  setSelectedControl: (control: Control | null) => void;
  toggleDarkMode: () => void;
}

const defaultFilters: Filters = {
  search: '',
  framework: 'All',
  cloud: 'All',
  coverageStatus: 'All',
  serviceCategory: 'All',
  ismGuideline: 'All',
  isoTheme: 'All',
  service: 'All',
  classificationLevel: 'All',
};

// Restore dark mode from localStorage on initial load
const _savedDark = localStorage.getItem('cloudcomply-dark') === 'true';
if (_savedDark) document.documentElement.classList.add('dark');

export const useStore = create<AppState>((set) => ({
  controls: controlsData as Control[],
  filters: { ...defaultFilters },
  selectedControl: null,
  darkMode: _savedDark,

  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),

  resetFilters: () => set({ filters: { ...defaultFilters } }),

  setSelectedControl: (control) => set({ selectedControl: control }),

  toggleDarkMode: () =>
    set((state) => {
      const next = !state.darkMode;
      document.documentElement.classList.toggle('dark', next);
      localStorage.setItem('cloudcomply-dark', String(next));
      return { darkMode: next };
    }),
}));

export function useFilteredControls() {
  return useStore(useShallow((state) => {
    const { controls, filters } = state;
    const filtered = controls.filter((c) => {
      if (filters.coverageStatus !== 'All' && c.coverage_status !== filters.coverageStatus) return false;
      if (filters.serviceCategory !== 'All' && c.service_category !== filters.serviceCategory) return false;
      if (filters.ismGuideline !== 'All' && c.ism_guideline !== filters.ismGuideline) return false;
      if (filters.isoTheme !== 'All' && c.iso_theme !== filters.isoTheme) return false;
      if (filters.cloud === 'AWS' && c.aws_services.length === 0) return false;
      if (filters.cloud === 'Azure' && c.azure_services.length === 0) return false;
      if (filters.classificationLevel !== 'All' && !c.classification_levels.includes(filters.classificationLevel)) return false;
      if (filters.service !== 'All') {
        if (!c.aws_services.includes(filters.service) && !c.azure_services.includes(filters.service)) return false;
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (
          !c.control_id.toLowerCase().includes(q) &&
          !c.ism_description.toLowerCase().includes(q) &&
          !c.ism_guideline.toLowerCase().includes(q) &&
          !c.ism_section.toLowerCase().includes(q) &&
          !c.ism_topic.toLowerCase().includes(q) &&
          !c.iso_control_id.toLowerCase().includes(q) &&
          !c.iso_control_name.toLowerCase().includes(q) &&
          !c.aws_services.join(' ').toLowerCase().includes(q) &&
          !c.azure_services.join(' ').toLowerCase().includes(q) &&
          !c.notes.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });

    // Framework selection changes sort order so results are grouped by that
    // framework's structure. All controls in this dataset satisfy both frameworks,
    // so the filter does not reduce rows — it reorganises them.
    if (filters.framework === 'ISM') {
      return [...filtered].sort((a, b) =>
        a.ism_guideline.localeCompare(b.ism_guideline) ||
        a.ism_section.localeCompare(b.ism_section) ||
        a.control_id.localeCompare(b.control_id)
      );
    }
    if (filters.framework === 'ISO 27001') {
      return [...filtered].sort((a, b) =>
        a.iso_control_id.localeCompare(b.iso_control_id, undefined, { numeric: true })
      );
    }
    return filtered;
  }));
}

// Derive sorted, deduplicated service lists from the data
const _controls = controlsData as Control[];
const _awsSet = new Set<string>();
const _azureSet = new Set<string>();
_controls.forEach((c) => {
  c.aws_services.forEach((s) => _awsSet.add(s));
  c.azure_services.forEach((s) => _azureSet.add(s));
});

export const AWS_SERVICES = Array.from(_awsSet).sort();
export const AZURE_SERVICES = Array.from(_azureSet).sort();

// Derive sorted unique guideline names
export const ISM_GUIDELINES = ['All', ...Array.from(new Set(_controls.map((c) => c.ism_guideline))).sort()];

// Derive sorted unique service categories
export const SERVICE_CATEGORIES = ['All', ...Array.from(new Set(_controls.map((c) => c.service_category))).sort()];
