import { useState, useMemo, useRef, useCallback } from 'react';
import {
  Info, ChevronDown, ChevronUp, ChevronRight, Upload, Download, Trash2,
  FileJson, FileText, SlidersHorizontal, X, NotebookPen,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useImplementation } from '@/store/useImplementation';
import { AWS_SERVICES, AZURE_SERVICES } from '@/store/useStore';
import type { ImplementationStatus, Control } from '@/types';
import type { ImplScope } from '@/store/useImplementation';
import { Badge } from '@/components/ui/Badge';
import { COVERAGE_COLOURS } from '@/lib/utils';

const STATUSES: ImplementationStatus[] = ['Not Started', 'In Progress', 'Implemented', 'Accepted Risk'];

const STATUS_STYLES: Record<ImplementationStatus, { bg: string; text: string; ring: string }> = {
  'Not Started':   { bg: '#f1f5f9', text: '#475569', ring: '#cbd5e1' },
  'In Progress':   { bg: '#fef3c7', text: '#b45309', ring: '#fcd34d' },
  'Implemented':   { bg: '#dcfce7', text: '#15803d', ring: '#86efac' },
  'Accepted Risk': { bg: '#f3e8ff', text: '#7e22ce', ring: '#d8b4fe' },
};

const STATUS_BADGE: Record<ImplementationStatus, string> = {
  'Not Started':   'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  'In Progress':   'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  'Implemented':   'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  'Accepted Risk': 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
};

const PAGE_SIZE = 25;

// ── Services multi-select ─────────────────────────────────────────────────────
const AWS_SET = new Set(AWS_SERVICES);
const AZURE_SET = new Set(AZURE_SERVICES);

function CloudTag({ service }: { service: string }) {
  const isAws = AWS_SET.has(service);
  const isAzure = AZURE_SET.has(service);
  if (isAws && isAzure) return null;
  if (isAws) return <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 shrink-0">AWS</span>;
  return <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 shrink-0">Azure</span>;
}

function ServicesMultiSelect({
  available,
  selected,
  onChange,
  showCloudTags,
}: {
  available: string[];
  selected: string[];
  onChange: (v: string[]) => void;
  showCloudTags?: boolean;
}) {
  const [search, setSearch] = useState('');
  const filtered = useMemo(
    () => available.filter((s) => s.toLowerCase().includes(search.toLowerCase())),
    [available, search]
  );

  function toggle(s: string) {
    onChange(selected.includes(s) ? selected.filter((x) => x !== s) : [...selected, s]);
  }

  return (
    <div className="flex flex-col gap-1">
      <input
        type="text"
        placeholder="Search services…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-base md:text-sm text-slate-800 dark:text-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="max-h-44 overflow-y-auto rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700">
        {filtered.length === 0 && (
          <p className="text-xs text-slate-400 px-3 py-2">No services match.</p>
        )}
        {filtered.map((s) => (
          <label
            key={s}
            className="flex items-center gap-2.5 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50"
          >
            <input
              type="checkbox"
              checked={selected.includes(s)}
              onChange={() => toggle(s)}
              className="accent-blue-600"
            />
            <span className="flex-1">{s}</span>
            {showCloudTags && <CloudTag service={s} />}
          </label>
        ))}
      </div>
      <div className="flex gap-2 text-xs">
        <button
          onClick={() => onChange(filtered)}
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Select all ({filtered.length})
        </button>
        <span className="text-slate-300 dark:text-slate-600">·</span>
        <button
          onClick={() => onChange([])}
          className="text-slate-500 dark:text-slate-400 hover:underline"
        >
          Clear
        </button>
        {selected.length > 0 && (
          <span className="ml-auto text-slate-500 dark:text-slate-400">
            {selected.length} selected
          </span>
        )}
      </div>
    </div>
  );
}

// ── Posture progress bar ──────────────────────────────────────────────────────
function PostureBar({ controls, statuses, keyFn }: {
  controls: Control[];
  statuses: Record<string, { status: ImplementationStatus; notes: string; updatedAt: string }>;
  keyFn: (c: Control) => string;
}) {
  const counts: Record<ImplementationStatus, number> = {
    'Not Started': 0, 'In Progress': 0, 'Implemented': 0, 'Accepted Risk': 0,
  };
  controls.forEach((c) => {
    const s: ImplementationStatus = statuses[keyFn(c)]?.status ?? 'Not Started';
    counts[s]++;
  });
  const total = controls.length;
  const pct = (n: number) => total ? Math.round((n / total) * 100) : 0;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Implementation Posture — {total} controls in scope
        </h3>
        <span className="text-sm font-bold text-green-600 dark:text-green-400">
          {pct(counts['Implemented'])}% implemented
        </span>
      </div>

      {/* Stacked progress bar */}
      <div className="flex h-3 rounded-full overflow-hidden w-full bg-slate-100 dark:bg-slate-700 gap-px">
        {counts['Implemented'] > 0 && (
          <div style={{ width: `${pct(counts['Implemented'])}%` }} className="bg-green-500 transition-all" />
        )}
        {counts['Accepted Risk'] > 0 && (
          <div style={{ width: `${pct(counts['Accepted Risk'])}%` }} className="bg-violet-400 transition-all" />
        )}
        {counts['In Progress'] > 0 && (
          <div style={{ width: `${pct(counts['In Progress'])}%` }} className="bg-amber-400 transition-all" />
        )}
        {counts['Not Started'] > 0 && (
          <div style={{ width: `${pct(counts['Not Started'])}%` }} className="bg-slate-300 dark:bg-slate-600 transition-all" />
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {STATUSES.map((s) => (
          <div key={s} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: STATUS_STYLES[s].bg, border: `1.5px solid ${STATUS_STYLES[s].ring}` }}
            />
            {s} <span className="font-semibold">{counts[s]}</span>
            <span className="text-slate-400 dark:text-slate-500">({pct(counts[s])}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Notes inline editor ───────────────────────────────────────────────────────
function NotesCell({ controlId, notes, onSave }: {
  controlId: string;
  notes: string;
  onSave: (controlId: string, notes: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(notes);

  function handleSave() {
    onSave(controlId, draft);
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => { setDraft(notes); setOpen(true); }}
        title={notes || 'Add notes'}
        className={`p-1.5 rounded-md transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center ${
          notes
            ? 'text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
            : 'text-slate-300 dark:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'
        }`}
      >
        <NotebookPen className="w-3.5 h-3.5" />
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 min-w-[220px]">
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={3}
        placeholder="Add your implementation notes…"
        className="w-full text-xs rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-2 py-1.5 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="flex gap-1.5">
        <button
          onClick={handleSave}
          className="px-2 py-0.5 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save
        </button>
        <button
          onClick={() => setOpen(false)}
          className="px-2 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-600"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function ImplementationTracker() {
  const { controls, setSelectedControl } = useStore();
  const { statuses, scope, setStatus, setNotes, setScope, importJSON, exportJSON, exportCSV, clearAll } =
    useImplementation();

  // Scope panel state (local draft before Apply)
  const [scopeDraft, setScopeDraft] = useState<ImplScope>({
    framework: scope.framework ?? 'Both',
    csp: scope.csp,
    services: scope.services,
  });
  const [scopeOpen, setScopeOpen] = useState(Object.keys(statuses).length === 0);

  // Available services based on CSP selection
  const availableServices = useMemo(() => {
    if (scopeDraft.csp === 'AWS') return AWS_SERVICES;
    if (scopeDraft.csp === 'Azure') return AZURE_SERVICES;
    return [...new Set([...AWS_SERVICES, ...AZURE_SERVICES])].sort();
  }, [scopeDraft.csp]);

  // Scoped controls (based on committed scope, not draft)
  const scopedControls = useMemo(() => {
    let result = controls;
    if (scope.csp === 'AWS') result = result.filter((c) => c.aws_services.length > 0);
    else if (scope.csp === 'Azure') result = result.filter((c) => c.azure_services.length > 0);

    if (scope.services.length > 0) {
      result = result.filter((c) =>
        [...c.aws_services, ...c.azure_services].some((s) => scope.services.includes(s))
      );
    }

    const fw = scope.framework ?? 'Both';
    if (fw === 'ISO 27001') {
      const sorted = [...result].sort((a, b) =>
        a.iso_control_id.localeCompare(b.iso_control_id, undefined, { numeric: true })
      );
      // Deduplicate: one representative row per unique ISO control
      const seen = new Set<string>();
      return sorted.filter((c) => {
        if (seen.has(c.iso_control_id)) return false;
        seen.add(c.iso_control_id);
        return true;
      });
    }
    // ISM or Both: sort by guideline → section → control_id (no dedup — every ISM control is unique)
    return [...result].sort((a, b) =>
      a.ism_guideline.localeCompare(b.ism_guideline) ||
      a.ism_section.localeCompare(b.ism_section) ||
      a.control_id.localeCompare(b.control_id)
    );
  }, [controls, scope]);

  // Which ID to use as the status tracking key depends on the active framework
  const fw = scope.framework ?? 'Both';
  function trackingKey(c: Control): string {
    return fw === 'ISO 27001' ? c.iso_control_id : c.control_id;
  }

  // Count how many ISM controls fall under each ISO control (for the ISO row sub-label)
  const isoToIsmCount = useMemo(() => {
    if (fw !== 'ISO 27001') return {} as Record<string, number>;
    let base = controls;
    if (scope.csp === 'AWS') base = base.filter((c) => c.aws_services.length > 0);
    else if (scope.csp === 'Azure') base = base.filter((c) => c.azure_services.length > 0);
    if (scope.services.length > 0) {
      base = base.filter((c) =>
        [...c.aws_services, ...c.azure_services].some((s) => scope.services.includes(s))
      );
    }
    const map: Record<string, number> = {};
    base.forEach((c) => { map[c.iso_control_id] = (map[c.iso_control_id] ?? 0) + 1; });
    return map;
  }, [controls, scope, fw]);

  // Toolbar filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | ImplementationStatus>('All');
  const [coverageFilter, setCoverageFilter] = useState<'All' | string>('All');
  const [page, setPage] = useState(1);

  // Filter applied to scoped controls
  const filteredControls = useMemo(() => {
    return scopedControls.filter((c) => {
      if (statusFilter !== 'All') {
        const k = fw === 'ISO 27001' ? c.iso_control_id : c.control_id;
        const s = statuses[k]?.status ?? 'Not Started';
        if (s !== statusFilter) return false;
      }
      if (coverageFilter !== 'All' && c.coverage_status !== coverageFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !c.control_id.toLowerCase().includes(q) &&
          !c.ism_description.toLowerCase().includes(q) &&
          !c.ism_guideline.toLowerCase().includes(q) &&
          !c.ism_section.toLowerCase().includes(q) &&
          !c.iso_control_id.toLowerCase().includes(q) &&
          !c.iso_control_name.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [scopedControls, statuses, statusFilter, coverageFilter, search, fw]);

  const totalPages = Math.max(1, Math.ceil(filteredControls.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageControls = filteredControls.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function applyScope() {
    setScope(scopeDraft);
    setScopeOpen(false);
    setPage(1);
  }

  // Import
  const fileRef = useRef<HTMLInputElement>(null);
  const [importMsg, setImportMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = importJSON(ev.target?.result as string);
      setImportMsg({ ok: result.ok, text: result.ok ? 'Imported successfully.' : (result.error ?? 'Import failed.') });
      setTimeout(() => setImportMsg(null), 4000);
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function handleExportJSON() {
    const json = exportJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cloudcomply-implementation-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleExportCSV() {
    if (fw !== 'ISO 27001') {
      // ISM / Both: use the store helper (keys on control_id)
      exportCSV(scopedControls);
      return;
    }
    // ISO 27001: keys on iso_control_id — inline export
    const escape = (v: string) => {
      let s = String(v);
      if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
      s = s.replace(/"/g, '""');
      return s.includes(',') || s.includes('\n') || s.includes('"') ? `"${s}"` : s;
    };
    const headers = ['iso_control_id', 'iso_control_name', 'iso_theme', 'ism_controls_count', 'service_category', 'coverage_status', 'impl_status', 'impl_notes', 'last_updated'];
    const rows = scopedControls.map((c) => {
      const rec = statuses[c.iso_control_id];
      return [
        c.iso_control_id,
        c.iso_control_name,
        c.iso_theme,
        String(isoToIsmCount[c.iso_control_id] ?? 1),
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
    a.download = `cloudcomply-implementation-iso-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const [confirmClear, setConfirmClear] = useState(false);

  const selectClass =
    'rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-base md:text-sm text-slate-800 dark:text-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500';

  const handleStatusChange = useCallback(
    (controlId: string, status: ImplementationStatus) => setStatus(controlId, status),
    [setStatus]
  );
  const handleNotesSave = useCallback(
    (controlId: string, notes: string) => setNotes(controlId, notes),
    [setNotes]
  );

  const trackedCount = Object.keys(statuses).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Info banner */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-xl px-4 py-3 flex gap-3 items-start">
        <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Choose your compliance framework (ISM / ISO 27001), cloud provider, and the services you actually deploy.
          Then mark each applicable control as{' '}
          <span className="font-semibold">Not Started → In Progress → Implemented</span> (or{' '}
          <span className="font-semibold">Accepted Risk</span>). Progress is saved automatically in your browser.
          Export as JSON to back up or share, or as CSV for spreadsheets.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Implementation Tracker</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Your active compliance workbook — scoped to your infrastructure
        </p>
      </div>

      {/* ── Scope panel ────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <button
          onClick={() => setScopeOpen((o) => !o)}
          className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-500" />
            Scope — {scope.framework ?? 'Both'} · {scope.csp} · {scope.services.length > 0 ? `${scope.services.length} services selected` : 'All services'}
          </div>
          {scopeOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {scopeOpen && (
          <div className="px-5 pb-5 border-t border-slate-100 dark:border-slate-700 space-y-4 pt-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Framework */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1.5">
                  Compliance Framework
                </label>
                <div className="flex gap-2 flex-wrap">
                  {(['ISM', 'ISO 27001', 'Both'] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setScopeDraft((d) => ({ ...d, framework: opt }))}
                      className={`px-4 py-2 min-h-[44px] rounded-lg text-sm font-medium border transition-colors ${
                        scopeDraft.framework === opt
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-blue-400'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* CSP */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1.5">
                  Cloud Provider
                </label>
                <div className="flex gap-2">
                  {(['Both', 'AWS', 'Azure'] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setScopeDraft((d) => ({ ...d, csp: opt, services: [] }))}
                      className={`px-4 py-2 min-h-[44px] rounded-lg text-sm font-medium border transition-colors ${
                        scopeDraft.csp === opt
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-blue-400'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Scope summary */}
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {scopedControls.length} {(scope.framework ?? 'Both') === 'ISO 27001' ? 'unique ISO 27001 controls' : (scope.framework ?? 'Both') === 'Both' ? 'ISM + ISO 27001 controls' : 'ISM controls'} in scope.
              {(scope.framework ?? 'Both') === 'ISO 27001' && (
                <> Each row represents one ISO control (multiple ISM controls may be mapped beneath it).</>
              )}
              {scope.services.length > 0 && (
                <> Filtered to {scope.services.length} selected service{scope.services.length !== 1 ? 's' : ''}.</>
              )}
            </p>

            {/* Services */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1.5">
                Services in your infrastructure
                <span className="ml-1 font-normal normal-case">(leave empty to include all)</span>
              </label>
              <ServicesMultiSelect
                available={availableServices}
                selected={scopeDraft.services}
                onChange={(services) => setScopeDraft((d) => ({ ...d, services }))}
                showCloudTags={scopeDraft.csp === 'Both'}
              />
            </div>

            <button
              onClick={applyScope}
              className="px-5 py-2.5 min-h-[44px] bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply Scope
            </button>
          </div>
        )}
      </div>

      {/* ── Posture bar ─────────────────────────────────────────────────────── */}
      {scopedControls.length > 0 && (
        <PostureBar controls={scopedControls} statuses={statuses} keyFn={trackingKey} />
      )}

      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
        <div className="flex flex-wrap gap-2 items-center">
          {/* Search */}
          <input
            type="text"
            placeholder="Search controls…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className={`flex-1 min-w-[180px] ${selectClass}`}
          />

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as typeof statusFilter); setPage(1); }}
            className={selectClass}
            aria-label="Filter by implementation status"
          >
            <option value="All">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* Coverage filter */}
          <select
            value={coverageFilter}
            onChange={(e) => { setCoverageFilter(e.target.value); setPage(1); }}
            className={selectClass}
            aria-label="Filter by coverage status"
          >
            <option value="All">All coverage</option>
            <option value="Covered">Covered</option>
            <option value="Partial">Partial</option>
            <option value="Gap">Gap</option>
          </select>
        </div>

        {/* Actions row */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-slate-400 dark:text-slate-500 mr-auto">
            {filteredControls.length} control{filteredControls.length !== 1 ? 's' : ''} shown
            {trackedCount > 0 && <> · {trackedCount} tracked</>} · Click → or control ID to view details
          </span>

          {/* Import */}
          <input ref={fileRef} type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 min-h-[44px] text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            Import JSON
          </button>

          {/* Export JSON */}
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-2 min-h-[44px] text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
          >
            <FileJson className="w-3.5 h-3.5" />
            Export JSON
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 min-h-[44px] text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            Export CSV
          </button>

          {/* Clear */}
          {!confirmClear ? (
            <button
              onClick={() => setConfirmClear(true)}
              className="flex items-center gap-1.5 px-3 py-2 min-h-[44px] text-xs font-medium rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Reset
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-red-600 dark:text-red-400 font-medium">Clear all data?</span>
              <button
                onClick={() => { clearAll(); setConfirmClear(false); }}
                className="px-2.5 py-1.5 min-h-[36px] text-xs font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Yes, clear
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                className="px-2.5 py-1.5 min-h-[36px] text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Import result message */}
        {importMsg && (
          <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${
            importMsg.ok
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
          }`}>
            {importMsg.ok
              ? <Download className="w-3.5 h-3.5 shrink-0" />
              : <X className="w-3.5 h-3.5 shrink-0" />}
            {importMsg.text}
          </div>
        )}
      </div>

      {/* ── Controls table ──────────────────────────────────────────────────── */}
      {scopedControls.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-10 text-center">
          <SlidersHorizontal className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No controls in scope yet.</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Open the Scope panel above and choose your CSP and services.</p>
          <button
            onClick={() => setScopeOpen(true)}
            className="mt-4 px-4 py-2 min-h-[44px] bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            Configure Scope
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide w-44">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide w-32">
                    {fw === 'ISO 27001' ? 'ISO Control' : 'ISM ID'}
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    {fw === 'ISO 27001' ? 'ISO Control Name / Description' : 'Section / Description'}
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide w-24">
                    Coverage
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide w-16">
                    Notes
                  </th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {pageControls.map((c) => {
                  const key = trackingKey(c);
                  const rec = statuses[key];
                  const status: ImplementationStatus = rec?.status ?? 'Not Started';
                  const style = STATUS_STYLES[status];

                  return (
                    <tr
                      key={key}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group cursor-pointer"
                      onClick={() => setSelectedControl(c)}
                    >
                      {/* Status select */}
                      <td className="px-4 py-3 align-top" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={status}
                          onChange={(e) => handleStatusChange(key, e.target.value as ImplementationStatus)}
                          style={{
                            backgroundColor: style.bg,
                            color: style.text,
                            borderColor: style.ring,
                          }}
                          className="w-full text-xs font-semibold rounded-md border py-1.5 px-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                          aria-label={`Status for ${key}`}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        {rec?.updatedAt && (
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                            {new Date(rec.updatedAt).toLocaleDateString()}
                          </p>
                        )}
                      </td>

                      {/* Control ID — adapts to framework */}
                      <td className="px-4 py-3 align-top">
                        {fw === 'ISO 27001' ? (
                          <>
                            <button
                              onClick={() => setSelectedControl(c)}
                              className="inline-flex items-center font-mono text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700/50 rounded px-1.5 py-0.5 hover:bg-indigo-100 dark:hover:bg-indigo-800/40 transition-colors"
                            >
                              {c.iso_control_id}
                            </button>
                            {(isoToIsmCount[c.iso_control_id] ?? 1) > 1 && (
                              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                                {isoToIsmCount[c.iso_control_id]} ISM controls
                              </p>
                            )}
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => setSelectedControl(c)}
                              className="inline-flex items-center font-mono text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700/50 rounded px-1.5 py-0.5 hover:bg-blue-100 dark:hover:bg-blue-800/40 transition-colors"
                            >
                              {c.control_id}
                            </button>
                            {fw === 'Both' && (
                              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 font-mono">
                                {c.iso_control_id}
                              </p>
                            )}
                          </>
                        )}
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate max-w-[100px]">
                          {c.service_category}
                        </p>
                      </td>

                      {/* Section / Description — adapts to framework */}
                      <td className="px-4 py-3 align-top max-w-xs">
                        {fw === 'ISO 27001' ? (
                          <>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-0.5 truncate">
                              {c.iso_control_name}
                              <span className="ml-1.5 text-slate-400 dark:text-slate-500 font-normal italic">{c.iso_theme}</span>
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                              {c.ism_description}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-0.5 truncate">
                              {c.ism_section}
                              {c.ism_topic && c.ism_topic !== 'General' && (
                                <span className="text-slate-400 dark:text-slate-500"> · {c.ism_topic}</span>
                              )}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                              {c.ism_description}
                            </p>
                            {fw === 'Both' && (
                              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate italic">
                                {c.iso_control_name}
                              </p>
                            )}
                          </>
                        )}
                      </td>

                      {/* Coverage */}
                      <td className="px-4 py-3 align-top">
                        <Badge className={COVERAGE_COLOURS[c.coverage_status]}>{c.coverage_status}</Badge>
                      </td>

                      {/* Notes */}
                      <td className="px-4 py-3 align-top text-center" onClick={(e) => e.stopPropagation()}>
                        <NotesCell
                          controlId={key}
                          notes={rec?.notes ?? ''}
                          onSave={handleNotesSave}
                        />
                      </td>
                      <td className="px-3 py-3 w-8 text-right align-top">
                        <button
                          onClick={() => setSelectedControl(c)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="View control details"
                        >
                          <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filteredControls.length)} of{' '}
                {filteredControls.length}
              </p>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="px-3 py-1.5 min-w-[44px] min-h-[44px] text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous page"
                >
                  ‹ Prev
                </button>
                <span className="flex items-center px-3 text-xs text-slate-500 dark:text-slate-400">
                  {safePage} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="px-3 py-1.5 min-w-[44px] min-h-[44px] text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page"
                >
                  Next ›
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Status legend */}
      <div className="flex flex-wrap gap-3">
        {STATUSES.map((s) => (
          <div
            key={s}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{ backgroundColor: STATUS_STYLES[s].bg, color: STATUS_STYLES[s].text, border: `1px solid ${STATUS_STYLES[s].ring}` }}
          >
            <span className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded text-xs font-medium ${STATUS_BADGE[s]}`}>
              {s}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
