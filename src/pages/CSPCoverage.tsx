import { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FileDown, AlertTriangle, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore, SERVICE_CATEGORIES } from '@/store/useStore';
import { Badge } from '@/components/ui/Badge';
import { ServiceChip } from '@/components/ServiceChip';
import { EmptyState } from '@/components/ui/EmptyState';
import { COVERAGE_COLOURS, CHART_COLOURS } from '@/lib/utils';
import type { Control } from '@/types';

const PAGE_SIZE = 50;

export function CSPCoverage() {
  const { controls, setSelectedControl } = useStore();
  const [page, setPage] = useState(1);

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
          CSP Coverage shows controls that are <strong>Partial</strong> (cloud services exist but require significant customer configuration) or have a <strong>Gap</strong> (no native cloud service covers the requirement — customer must build or procure). Use this page to prioritise remediation. Export the full list as a PDF report for stakeholders.
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
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
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

      {/* Gap/Partial table with pagination */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Gap &amp; Partial Controls</h3>
        </div>
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
