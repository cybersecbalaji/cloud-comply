import { useState } from 'react';
import { Info, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore, useFilteredControls, AWS_SERVICES, AZURE_SERVICES, ISM_GUIDELINES, SERVICE_CATEGORIES } from '@/store/useStore';
import { Badge } from '@/components/ui/Badge';
import { ServiceChip } from '@/components/ServiceChip';
import { EmptyState } from '@/components/ui/EmptyState';
import { COVERAGE_COLOURS, ISO_THEME_COLOURS, SERVICE_COLOURS } from '@/lib/utils';
import type { Control } from '@/types';

const PAGE_SIZE = 50;
const ISO_THEMES = ['All', 'Organisational', 'People', 'Physical', 'Technological'];

function FilterSelect({ label, value, options, onChange }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm border border-slate-200 dark:border-slate-600 rounded-md px-2 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

export function CrossReference() {
  const { filters, setFilter, resetFilters, setSelectedControl } = useStore();
  const [page, setPage] = useState(1);

  const hasActiveFilters =
    filters.framework !== 'All' ||
    filters.coverageStatus !== 'All' ||
    filters.serviceCategory !== 'All' ||
    filters.ismGuideline !== 'All' ||
    filters.isoTheme !== 'All' ||
    filters.cloud !== 'All' ||
    filters.service !== 'All' ||
    filters.classificationLevel !== 'All' ||
    !!filters.search;

  const filtered = useFilteredControls();
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function handleFilterChange<K extends keyof typeof filters>(key: K, value: (typeof filters)[K]) {
    setFilter(key, value);
    setPage(1);
  }

  return (
    <div className="space-y-4 max-w-full">
      {/* Page overview */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-xl px-4 py-3 flex gap-3 items-start">
        <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Side-by-side view showing how each ISM control maps to its ISO 27001:2022 equivalent. Filter by ISO theme (Organisational, People, Physical, Technological) or ISM guideline area to trace requirements across frameworks. Click any row for full details.
        </p>
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Cross-Reference View</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          ISM ↔ ISO 27001 side-by-side mapping — {filtered.length} controls
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Framework: re-sorts results, does not reduce rows */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Framework</label>
              <span title="All controls are dual-mapped to ISM and ISO 27001. Selecting a framework re-sorts results by that framework's structure." className="cursor-help">
                <Info className="w-3 h-3 text-slate-400" />
              </span>
            </div>
            <select
              value={filters.framework}
              onChange={(e) => handleFilterChange('framework', e.target.value as 'All' | 'ISM' | 'ISO 27001')}
              className="text-sm border border-slate-200 dark:border-slate-600 rounded-md px-2 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {['All', 'ISM', 'ISO 27001'].map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            {filters.framework !== 'All' && (
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Sorted by {filters.framework === 'ISM' ? 'ISM guideline' : 'ISO control ID'}
              </p>
            )}
          </div>
          <FilterSelect label="ISO Theme" value={filters.isoTheme} options={ISO_THEMES} onChange={(v) => handleFilterChange('isoTheme', v)} />
          <FilterSelect label="ISM Guideline" value={filters.ismGuideline} options={ISM_GUIDELINES} onChange={(v) => handleFilterChange('ismGuideline', v)} />
          <FilterSelect label="Service Category" value={filters.serviceCategory} options={SERVICE_CATEGORIES} onChange={(v) => handleFilterChange('serviceCategory', v)} />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Service</label>
            <select
              value={filters.service}
              onChange={(e) => handleFilterChange('service', e.target.value)}
              className="text-sm border border-slate-200 dark:border-slate-600 rounded-md px-2 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Services</option>
              <optgroup label="── AWS ──">
                {AWS_SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
              </optgroup>
              <optgroup label="── Azure ──">
                {AZURE_SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
              </optgroup>
            </select>
          </div>
        </div>
        {hasActiveFilters && (
          <button
            onClick={() => { resetFilters(); setPage(1); }}
            className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 mt-3"
          >
            <X className="w-3.5 h-3.5" /> Clear all filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                    {[
                      'ISM Control ID',
                      'ISM Guideline / Section',
                      'ISM Description',
                      'ISO 27001 Control',
                      'ISO Theme',
                      'AWS Service(s)',
                      'Azure Service(s)',
                      'Category',
                    ].map((h) => (
                      <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {pageRows.map((c: Control, idx: number) => (
                    <tr
                      key={`${c.control_id}-${idx}`}
                      className="hover:bg-blue-50/50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedControl(c)}
                    >
                      {/* ISM Control ID */}
                      <td className="px-3 py-3">
                        <div className="flex flex-col gap-1">
                          <span className="font-mono text-xs font-medium text-slate-700 dark:text-slate-300">{c.control_id}</span>
                          <Badge className={COVERAGE_COLOURS[c.coverage_status]}>{c.coverage_status}</Badge>
                        </div>
                      </td>
                      {/* ISM Guideline / Section */}
                      <td className="px-3 py-3 text-xs max-w-[120px]">
                        <div className="text-slate-600 dark:text-slate-400 truncate" title={c.ism_guideline}>
                          {c.ism_guideline.replace('Guidelines for ', '')}
                        </div>
                        <div className="text-slate-400 dark:text-slate-500 truncate text-xs" title={c.ism_section}>
                          {c.ism_section}
                        </div>
                      </td>
                      {/* ISM Description */}
                      <td className="px-3 py-3 text-xs text-slate-600 dark:text-slate-400 max-w-xs">
                        <p className="line-clamp-3">{c.ism_description}</p>
                      </td>
                      {/* ISO 27001 */}
                      <td className="px-3 py-3 max-w-[140px]">
                        <div className="font-medium text-xs text-slate-700 dark:text-slate-300 whitespace-nowrap">{c.iso_control_id}</div>
                        <div className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2">{c.iso_control_name}</div>
                      </td>
                      {/* ISO Theme */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <Badge className={ISO_THEME_COLOURS[c.iso_theme]}>{c.iso_theme}</Badge>
                      </td>
                      {/* AWS Services */}
                      <td className="px-3 py-3 max-w-[160px]">
                        <div className="flex flex-wrap gap-1">
                          {c.aws_services.slice(0, 2).map((s) => (
                            <ServiceChip key={s} name={s} category={c.service_category} />
                          ))}
                          {c.aws_services.length > 2 && (
                            <span className="text-xs text-slate-400">+{c.aws_services.length - 2}</span>
                          )}
                        </div>
                      </td>
                      {/* Azure Services */}
                      <td className="px-3 py-3 max-w-[160px]">
                        <div className="flex flex-wrap gap-1">
                          {c.azure_services.slice(0, 2).map((s) => (
                            <ServiceChip key={s} name={s} category={c.service_category} />
                          ))}
                          {c.azure_services.length > 2 && (
                            <span className="text-xs text-slate-400">+{c.azure_services.length - 2}</span>
                          )}
                        </div>
                      </td>
                      {/* Category */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <Badge className={SERVICE_COLOURS[c.service_category] || 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}>
                          {c.service_category}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="p-1.5 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-slate-600 dark:text-slate-400 px-2">
                  Page {safePage} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="p-1.5 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
