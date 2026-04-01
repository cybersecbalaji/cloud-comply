import { create } from 'zustand';
import type { ImplementationStatus, ImplementationState } from '@/types';

const STORAGE_KEY = 'cloudcomply-impl';
const SCOPE_KEY = 'cloudcomply-impl-scope';

export interface ImplScope {
  framework: 'ISM' | 'ISO 27001' | 'Both';
  csp: 'AWS' | 'Azure' | 'Both';
  services: string[];
}

function loadStatuses(): ImplementationState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStatuses(state: ImplementationState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadScope(): ImplScope {
  try {
    const raw = localStorage.getItem(SCOPE_KEY);
    return raw ? JSON.parse(raw) : { framework: 'Both', csp: 'Both', services: [] };
  } catch {
    return { framework: 'Both', csp: 'Both', services: [] };
  }
}

interface ImplStore {
  statuses: ImplementationState;
  scope: ImplScope;
  setStatus: (controlId: string, status: ImplementationStatus, notes?: string) => void;
  setNotes: (controlId: string, notes: string) => void;
  setScope: (scope: ImplScope) => void;
  importJSON: (json: string) => { ok: boolean; error?: string };
  exportJSON: () => string;
  exportCSV: (controls: { control_id: string; ism_guideline: string; ism_section: string; ism_description: string; service_category: string; coverage_status: string }[]) => void;
  clearAll: () => void;
}

export const useImplementation = create<ImplStore>((set, get) => ({
  statuses: loadStatuses(),
  scope: loadScope(),

  setStatus: (controlId, status, notes) => {
    set((state) => {
      const existing = state.statuses[controlId];
      const updated: ImplementationState = {
        ...state.statuses,
        [controlId]: {
          status,
          notes: notes ?? existing?.notes ?? '',
          updatedAt: new Date().toISOString(),
        },
      };
      saveStatuses(updated);
      return { statuses: updated };
    });
  },

  setNotes: (controlId, notes) => {
    set((state) => {
      const existing = state.statuses[controlId];
      if (!existing) return state;
      const updated: ImplementationState = {
        ...state.statuses,
        [controlId]: { ...existing, notes, updatedAt: new Date().toISOString() },
      };
      saveStatuses(updated);
      return { statuses: updated };
    });
  },

  setScope: (scope) => {
    localStorage.setItem(SCOPE_KEY, JSON.stringify(scope));
    set({ scope });
  },

  importJSON: (json) => {
    try {
      const parsed = JSON.parse(json);
      const data: ImplementationState = parsed.controls ?? parsed;
      // Basic validation: must be a plain object
      if (typeof data !== 'object' || Array.isArray(data)) {
        return { ok: false, error: 'Invalid format: expected an object with control statuses.' };
      }
      saveStatuses(data);
      const importedScope: ImplScope | undefined = parsed.scope;
      if (importedScope) {
        localStorage.setItem(SCOPE_KEY, JSON.stringify(importedScope));
      }
      set({ statuses: data, ...(importedScope ? { scope: importedScope } : {}) });
      return { ok: true };
    } catch {
      return { ok: false, error: 'Could not parse JSON file.' };
    }
  },

  exportJSON: () => {
    const { statuses, scope } = get();
    return JSON.stringify(
      {
        exported_at: new Date().toISOString(),
        version: '1',
        scope,
        controls: statuses,
      },
      null,
      2
    );
  },

  exportCSV: (controls) => {
    const { statuses } = get();
    const escape = (v: string) => {
      let s = String(v);
      if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
      s = s.replace(/"/g, '""');
      return s.includes(',') || s.includes('\n') || s.includes('"') ? `"${s}"` : s;
    };
    const headers = ['control_id', 'ism_guideline', 'ism_section', 'description', 'category', 'coverage_status', 'impl_status', 'impl_notes', 'last_updated'];
    const rows = controls.map((c) => {
      const rec = statuses[c.control_id];
      return [
        c.control_id,
        c.ism_guideline,
        c.ism_section,
        c.ism_description,
        c.service_category,
        c.coverage_status,
        rec?.status ?? 'Not Started',
        rec?.notes ?? '',
        rec?.updatedAt ? new Date(rec.updatedAt).toLocaleDateString() : '',
      ].map(escape).join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cloudcomply-implementation-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },

  clearAll: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ statuses: {} });
  },
}));
