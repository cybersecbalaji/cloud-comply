import { useMemo, useState } from 'react';
import { Download, Search, X, Info } from 'lucide-react';
import { downloadCSV } from '@/lib/utils';
import { useStore, useFilteredControls, AWS_SERVICES, AZURE_SERVICES } from '@/store/useStore';
import { Badge } from '@/components/ui/Badge';
import { ServiceChip } from '@/components/ServiceChip';
import { EmptyState } from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/TableSkeleton';
import { COVERAGE_COLOURS } from '@/lib/utils';
import type { Control } from '@/types';

const ISM_DOMAINS = [
  'All', 'Access Control', 'Cryptography', 'Audit and Accountability',
  'Incident Management', 'Configuration Management', 'System Monitoring',
  'Personnel Security', 'Physical Security', 'Communications Security',
  'AI Security', 'Container Security', 'Data Management', 'Supply Chain Security',
  'Application Security', 'System Hardening',
];

const SERVICE_CATS = ['All', 'Compute', 'Containers', 'AI/ML', 'Security', 'Storage', 'Network'];
const ISO_THEMES = ['All', 'Organisational', 'People', 'Physical', 'Technological'];

function FilterSelect({
  label, value, options, onChange,
}: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
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

export function MappingTable() {
  const { filters, setFilter, resetFilters } = useStore();
  const filtered = useFilteredControls();
  const { setSelectedControl } = useStore();
  const [loading] = useState(false);

  const csvData = useMemo(() => filtered.map((c: Control) => ({
    control_id: c.control_id,
    ism_domain: c.ism_domain,
    iso_control_id: c.iso_control_id,
    iso_control_name: c.iso_control_name,
    service_category: c.service_category,
    aws_services: c.aws_services.join(', '),
    azure_services: c.azure_services.join(', '),
    responsibility: c.responsibility,
    coverage_status: c.coverage_status,
    notes: c.notes,
  })), [filtered]);

  const hasActiveFilters =
    filters.search ||
    filters.framework !== 'All' ||
    filters.coverageStatus !== 'All' ||
    filters.serviceCategory !== 'All' ||
    filters.ismDomain !== 'All' ||
    filters.isoTheme !== 'All' ||
    filters.cloud !== 'All' ||
    filters.service !== 'All';

  return (
    <div className="space-y-4 max-w-full">
      {/* Page overview */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-xl px-4 py-3 flex gap-3 items-start">
        <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Full list of all {useStore.getState().controls.length} compliance controls mapped across ISM and ISO 27001:2022. Use the filters to narrow by framework, cloud provider, service, coverage status, or ISM domain. Click any row to open the control detail panel. Export the current filtered view to CSV.
        </p>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Mapping Table</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {filtered.length} control{filtered.length !== 1 ? 's' : ''} shown
          </p>
        </div>
        <button
          onClick={() => downloadCSV(csvData, 'cloudcomply-controls.csv')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-3">
          {/* Framework: changes sort order, not row count (all controls map to both) */}
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-1">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Framework</label>
              <span title="All controls are dual-mapped to ISM and ISO 27001. Selecting a framework re-sorts results by that framework's structure." className="cursor-help">
                <Info className="w-3 h-3 text-slate-400" />
              </span>
            </div>
            <select
              value={filters.framework}
              onChange={(e) => setFilter('framework', e.target.value as 'All' | 'ISM' | 'ISO 27001')}
              className="text-sm border border-slate-200 dark:border-slate-600 rounded-md px-2 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {['All', 'ISM', 'ISO 27001'].map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            {filters.framework !== 'All' && (
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Sorted by {filters.framework === 'ISM' ? 'ISM domain' : 'ISO control ID'}
              </p>
            )}
          </div>
          <FilterSelect label="Cloud" value={filters.cloud} options={['All', 'AWS', 'Azure']} onChange={(v) => setFilter('cloud', v as 'All' | 'AWS' | 'Azure')} />
          <FilterSelect label="Coverage" value={filters.coverageStatus} options={['All', 'Covered', 'Partial', 'Gap']} onChange={(v) => setFilter('coverageStatus', v as 'All' | 'Covered' | 'Partial' | 'Gap')} />
          <FilterSelect label="Category" value={filters.serviceCategory} options={SERVICE_CATS} onChange={(v) => setFilter('serviceCategory', v)} />
          <FilterSelect label="ISM Domain" value={filters.ismDomain} options={ISM_DOMAINS} onChange={(v) => setFilter('ismDomain', v)} />
          <FilterSelect label="ISO Theme" value={filters.isoTheme} options={ISO_THEMES} onChange={(v) => setFilter('isoTheme', v)} />
          {/* Individual service filter */}
          <div className="flex flex-col gap-1 min-w-0">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Service</label>
            <select
              value={filters.service}
              onChange={(e) => setFilter('service', e.target.value)}
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
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Search</label>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilter('search', e.target.value)}
                placeholder="Search..."
                className="w-full text-sm border border-slate-200 dark:border-slate-600 rounded-md pl-7 pr-2 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400"
          >
            <X className="w-3.5 h-3.5" /> Clear all filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-4"><TableSkeleton /></div>
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                  {['Control ID', 'ISM Domain', 'ISO Control', 'Category', 'AWS Services', 'Azure Services', 'Responsibility', 'Coverage'].map((h) => (
                    <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filtered.map((c: Control, idx: number) => (
                  <tr
                    key={`${c.control_id}-${idx}`}
                    className="hover:bg-blue-50/50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedControl(c)}
                  >
                    <td className="px-3 py-2.5 font-mono text-xs font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {c.control_id}
                    </td>
                    <td className="px-3 py-2.5 text-slate-600 dark:text-slate-400 max-w-[140px] truncate" title={c.ism_domain}>
                      {c.ism_domain}
                    </td>
                    <td className="px-3 py-2.5 max-w-[160px]">
                      <div className="font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">{c.iso_control_id}</div>
                      <div className="text-xs text-slate-400 dark:text-slate-500 truncate">{c.iso_control_name}</div>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                        {c.service_category}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5 max-w-[200px]">
                      <div className="flex flex-wrap gap-1">
                        {c.aws_services.slice(0, 2).map((s) => (
                          <ServiceChip key={s} name={s} category={c.service_category} />
                        ))}
                        {c.aws_services.length > 2 && (
                          <span className="text-xs text-slate-400">+{c.aws_services.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 max-w-[200px]">
                      <div className="flex flex-wrap gap-1">
                        {c.azure_services.slice(0, 2).map((s) => (
                          <ServiceChip key={s} name={s} category={c.service_category} />
                        ))}
                        {c.azure_services.length > 2 && (
                          <span className="text-xs text-slate-400">+{c.azure_services.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <Badge className={
                        c.responsibility === 'Customer' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' :
                        c.responsibility === 'Provider' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' :
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300'
                      }>
                        {c.responsibility}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <Badge className={COVERAGE_COLOURS[c.coverage_status]}>{c.coverage_status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
