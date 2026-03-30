import { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FileDown, AlertTriangle, Info, ChevronLeft, ChevronRight, Wrench, ExternalLink } from 'lucide-react';
import { useStore, SERVICE_CATEGORIES } from '@/store/useStore';
import { Badge } from '@/components/ui/Badge';
import { ServiceChip } from '@/components/ServiceChip';
import { EmptyState } from '@/components/ui/EmptyState';
import { COVERAGE_COLOURS, CHART_COLOURS } from '@/lib/utils';
import type { Control, ThirdPartyTool } from '@/types';

const PAGE_SIZE = 50;

type ActiveTab = 'gaps' | 'tooling';

// Tool type badge colour map
const TOOL_TYPE_COLOURS: Record<string, string> = {
  'CSPM':                    'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'SIEM':                    'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  'EDR/CWPP':                'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  'PAM':                     'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  'SAST/DAST':               'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  'SAST/SCA':                'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  'SAST/DAST/SCA':           'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  'SAST/Code Quality':       'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  'Secrets Management':      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  'Key Management':          'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  'Machine Identity':        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  'SASE/ZTNA':               'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
  'SASE':                    'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
  'SASE/CASB':               'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
  'WAF/DDoS':                'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  'WAF/ADC':                 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  'NGFW':                    'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  'DLP':                     'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  'Email Security':          'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
  'GRC/Compliance':          'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  'GRC/Vendor Risk':         'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  'Vendor Risk':             'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  'TPRM':                    'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  'IAM/IGA':                 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  'IGA':                     'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  'DAM':                     'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  'DAM/Encryption':          'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  'Data Access Governance':  'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  'SOAR':                    'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  'Observability/SIEM':      'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  'Incident Management':     'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  'Vulnerability Management':'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  'Configuration Management':'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  'ITAM/Patch':              'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  'Backup/Recovery':         'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  'DNS Security':            'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
  'Documentation':           'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
};

function toolTypeBadge(type: string) {
  return TOOL_TYPE_COLOURS[type] || 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300';
}

export function CSPCoverage() {
  const { controls, setSelectedControl } = useStore();
  const [activeTab, setActiveTab] = useState<ActiveTab>('gaps');
  const [page, setPage] = useState(1);
  const [toolTypeFilter, setToolTypeFilter] = useState('All');
  const [toolGuidelineFilter, setToolGuidelineFilter] = useState('All');

  const gaps = useMemo(
    () => controls.filter((c) => c.coverage_status === 'Gap' || c.coverage_status === 'Partial'),
    [controls]
  );

  const totalPages = Math.max(1, Math.ceil(gaps.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = gaps.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Category counts from actual data (excluding 'All')
  const catList = SERVICE_CATEGORIES.filter((c) => c !== 'All');
  const catCounts = useMemo(() =>
    catList
      .map((cat) => ({
        category: cat,
        Partial: gaps.filter((c) => c.service_category === cat && c.coverage_status === 'Partial').length,
        Gap: gaps.filter((c) => c.service_category === cat && c.coverage_status === 'Gap').length,
      }))
      .filter((d) => d.Partial + d.Gap > 0)
      .sort((a, b) => (b.Partial + b.Gap) - (a.Partial + a.Gap)),
    [gaps, catList]
  );

  // Chart: grouped by guideline (top 15)
  const chartData = useMemo(() => {
    const map: Record<string, { Partial: number; Gap: number }> = {};
    gaps.forEach((c) => {
      const key = c.ism_guideline.replace('Guidelines for ', '');
      if (!map[key]) map[key] = { Partial: 0, Gap: 0 };
      if (c.coverage_status === 'Partial') map[key].Partial++;
      if (c.coverage_status === 'Gap') map[key].Gap++;
    });
    return Object.entries(map)
      .map(([key, v]) => ({ key, ...v }))
      .sort((a, b) => (b.Partial + b.Gap) - (a.Partial + a.Gap))
      .slice(0, 15);
  }, [gaps]);

  // ── Tooling tab data ──────────────────────────────────────────────────────
  // Deduplicate tools globally, grouped by guideline (only from gap/partial controls)
  const toolingByGuideline = useMemo(() => {
    const guidelineMap: Record<string, { tools: ThirdPartyTool[]; gap: number; partial: number }> = {};
    gaps.forEach((c) => {
      if (!c.third_party_tools || c.third_party_tools.length === 0) return;
      if (!guidelineMap[c.ism_guideline]) {
        guidelineMap[c.ism_guideline] = { tools: [], gap: 0, partial: 0 };
      }
      if (c.coverage_status === 'Gap') guidelineMap[c.ism_guideline].gap++;
      else guidelineMap[c.ism_guideline].partial++;
      // Deduplicate tools within the guideline
      c.third_party_tools.forEach((t) => {
        const existing = guidelineMap[c.ism_guideline].tools.find((x) => x.name === t.name);
        if (!existing) guidelineMap[c.ism_guideline].tools.push(t);
      });
    });
    return Object.entries(guidelineMap)
      .map(([guideline, data]) => ({ guideline, ...data }))
      .sort((a, b) => (b.gap + b.partial) - (a.gap + a.partial));
  }, [gaps]);

  // All unique tool types for filter
  const allToolTypes = useMemo(() => {
    const types = new Set<string>();
    toolingByGuideline.forEach(({ tools }) => tools.forEach((t) => types.add(t.type)));
    return ['All', ...Array.from(types).sort()];
  }, [toolingByGuideline]);

  // All guidelines for filter
  const allGuidelines = useMemo(() => [
    'All',
    ...toolingByGuideline.map((g) => g.guideline),
  ], [toolingByGuideline]);

  // Filtered tooling view
  const filteredTooling = useMemo(() => {
    return toolingByGuideline
      .filter((g) => toolGuidelineFilter === 'All' || g.guideline === toolGuidelineFilter)
      .map((g) => ({
        ...g,
        tools: toolTypeFilter === 'All'
          ? g.tools
          : g.tools.filter((t) => t.type === toolTypeFilter),
      }))
      .filter((g) => g.tools.length > 0);
  }, [toolingByGuideline, toolTypeFilter, toolGuidelineFilter]);

  // Total unique tool count
  const totalUniqueTools = useMemo(() => {
    const seen = new Set<string>();
    toolingByGuideline.forEach(({ tools }) => tools.forEach((t) => seen.add(t.name)));
    return seen.size;
  }, [toolingByGuideline]);

  function exportPDF() {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(16);
    doc.text('CloudComply — CSP Coverage Report', 14, 16);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-AU')} | ISM: March 2026 | ISO 27001:2022`, 14, 24);
    doc.setFontSize(11);
    doc.text(`Total partial/gap controls: ${gaps.length} of ${controls.length} controls`, 14, 32);

    autoTable(doc, {
      startY: 38,
      head: [['Control ID', 'ISM Guideline', 'Section', 'ISO Control', 'Category', 'Status', 'AWS Services', 'Azure Services', 'Notes']],
      body: gaps.map((c) => [
        c.control_id,
        c.ism_guideline.replace('Guidelines for ', ''),
        c.ism_section,
        `${c.iso_control_id} ${c.iso_control_name}`,
        c.service_category,
        c.coverage_status,
        c.aws_services.join(', '),
        c.azure_services.join(', '),
        c.notes.substring(0, 100) + (c.notes.length > 100 ? '…' : ''),
      ]),
      styles: { fontSize: 6, cellPadding: 1.5 },
      headStyles: { fillColor: [30, 64, 175] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    doc.save('cloudcomply-csp-coverage-report.pdf');
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page overview */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 rounded-xl px-4 py-3 flex gap-3 items-start">
        <Info className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
        <p className="text-sm text-amber-700 dark:text-amber-300">
          CSP Coverage shows controls that are <strong>Partial</strong> (cloud services exist but require significant customer configuration) or have a <strong>Gap</strong> (no native cloud service covers the requirement — customer must build or procure). The <strong>Tooling</strong> tab recommends third-party products to close these gaps.
        </p>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">CSP Coverage</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {gaps.length} controls require attention ({controls.filter((c) => c.coverage_status === 'Partial').length} Partial, {controls.filter((c) => c.coverage_status === 'Gap').length} Gap)
          </p>
        </div>
        <button
          onClick={exportPDF}
          className="flex items-center gap-1.5 px-4 min-h-[44px] text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          <FileDown className="w-4 h-4" />
          Export PDF Report
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {catCounts.map((cat) => (
          <div key={cat.category} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 truncate" title={cat.category}>{cat.category}</p>
            <div className="flex flex-wrap gap-1.5">
              {cat.Partial > 0 && (
                <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                  {cat.Partial} Partial
                </span>
              )}
              {cat.Gap > 0 && (
                <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                  {cat.Gap} Gap
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Partial + Gap Controls by ISM Guideline (Top 15)
        </h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Sorted by total count — use this to prioritise remediation effort</p>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-slate-200 dark:stroke-slate-700" />
            <XAxis type="number" tick={{ fontSize: 10 }} className="fill-slate-500 dark:fill-slate-400" />
            <YAxis type="category" dataKey="key" tick={{ fontSize: 9 }} width={140} className="fill-slate-500 dark:fill-slate-400" />
            <Tooltip />
            <Legend />
            <Bar dataKey="Partial" fill={CHART_COLOURS.Partial} stackId="a" />
            <Bar dataKey="Gap" fill={CHART_COLOURS.Gap} stackId="a" radius={[0, 3, 3, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('gaps')}
            className={`flex items-center gap-1.5 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'gaps'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            Gap &amp; Partial Controls
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
              {gaps.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('tooling')}
            className={`flex items-center gap-1.5 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'tooling'
                ? 'border-violet-600 text-violet-600 dark:text-violet-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Wrench className="w-4 h-4" />
            Tooling Recommendations
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
              {totalUniqueTools}
            </span>
          </button>
        </div>

        {/* ── Tab: Gap & Partial Controls ──────────────────────────────────── */}
        {activeTab === 'gaps' && (
          <>
            {gaps.length === 0 ? (
              <EmptyState title="No gaps found" description="All controls are covered." />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                        {['Control ID', 'ISM Guideline / Section', 'Services', 'Status', 'Missing / Remediation', 'Responsibility'].map((h) => (
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
                          className="hover:bg-amber-50/50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                          onClick={() => setSelectedControl(c)}
                        >
                          <td className="px-3 py-3 font-mono text-xs font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                            {c.control_id}
                          </td>
                          <td className="px-3 py-3 text-xs max-w-[140px]">
                            <div className="text-slate-600 dark:text-slate-400 truncate" title={c.ism_guideline}>
                              {c.ism_guideline.replace('Guidelines for ', '')}
                            </div>
                            <div className="text-slate-400 dark:text-slate-500 truncate text-xs" title={c.ism_section}>
                              {c.ism_section}
                            </div>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <div className="flex flex-wrap gap-1">
                              {c.aws_services.slice(0, 1).map((s) => (
                                <ServiceChip key={s} name={s} category={c.service_category} />
                              ))}
                              {c.azure_services.slice(0, 1).map((s) => (
                                <ServiceChip key={s} name={s} category={c.service_category} />
                              ))}
                            </div>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <Badge className={COVERAGE_COLOURS[c.coverage_status]}>{c.coverage_status}</Badge>
                          </td>
                          <td className="px-3 py-3 text-xs text-slate-600 dark:text-slate-400 max-w-sm">
                            <p className="line-clamp-2">{c.notes}</p>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <Badge className={
                              c.responsibility === 'Customer' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' :
                              c.responsibility === 'Provider' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' :
                              'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300'
                            }>
                              {c.responsibility}
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
                    Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, gaps.length)} of {gaps.length}
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={safePage === 1}
                      aria-label="Previous page"
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-slate-600 dark:text-slate-400 px-2">
                      Page {safePage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={safePage === totalPages}
                      aria-label="Next page"
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* ── Tab: Tooling Recommendations ─────────────────────────────────── */}
        {activeTab === 'tooling' && (
          <div className="p-5 space-y-5">
            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total Tools', value: totalUniqueTools, colour: 'text-violet-600 dark:text-violet-400' },
                { label: 'ISM Guidelines Covered', value: toolingByGuideline.length, colour: 'text-blue-600 dark:text-blue-400' },
                { label: 'Gap Controls', value: controls.filter((c) => c.coverage_status === 'Gap').length, colour: 'text-red-600 dark:text-red-400' },
                { label: 'Partial Controls', value: controls.filter((c) => c.coverage_status === 'Partial').length, colour: 'text-amber-600 dark:text-amber-400' },
              ].map((s) => (
                <div key={s.label} className="bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-3">
                  <p className={`text-2xl font-bold ${s.colour}`}>{s.value}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Tool Type</label>
                <select
                  value={toolTypeFilter}
                  onChange={(e) => setToolTypeFilter(e.target.value)}
                  className="text-base md:text-sm border border-slate-200 dark:border-slate-600 rounded-md px-2 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 min-w-[180px]"
                >
                  {allToolTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">ISM Guideline</label>
                <select
                  value={toolGuidelineFilter}
                  onChange={(e) => setToolGuidelineFilter(e.target.value)}
                  className="text-base md:text-sm border border-slate-200 dark:border-slate-600 rounded-md px-2 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 min-w-[240px]"
                >
                  {allGuidelines.map((g) => (
                    <option key={g} value={g}>{g === 'All' ? 'All Guidelines' : g.replace('Guidelines for ', '')}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tool cards grouped by guideline */}
            {filteredTooling.length === 0 ? (
              <EmptyState title="No tools match filters" description="Try clearing the filters above." />
            ) : (
              <div className="space-y-6">
                {filteredTooling.map(({ guideline, tools, gap, partial }) => (
                  <div key={guideline}>
                    {/* Guideline header */}
                    <div className="flex items-center gap-3 mb-3">
                      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        {guideline.replace('Guidelines for ', '')}
                      </h4>
                      <div className="flex gap-1.5">
                        {gap > 0 && (
                          <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                            {gap} Gap
                          </span>
                        )}
                        {partial > 0 && (
                          <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                            {partial} Partial
                          </span>
                        )}
                      </div>
                      <div className="flex-1 h-px bg-slate-100 dark:bg-slate-700" />
                    </div>
                    {/* Tool cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {tools.map((tool) => (
                        <a
                          key={tool.name}
                          href={tool.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex flex-col gap-2 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-sm hover:bg-violet-50/50 dark:hover:bg-violet-950/20 transition-all"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-violet-700 dark:group-hover:text-violet-300 leading-tight">
                              {tool.name}
                            </span>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-violet-400 shrink-0 mt-0.5" />
                          </div>
                          <span className={`self-start px-1.5 py-0.5 rounded text-xs font-medium ${toolTypeBadge(tool.type)}`}>
                            {tool.type}
                          </span>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                            {tool.purpose}
                          </p>
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
