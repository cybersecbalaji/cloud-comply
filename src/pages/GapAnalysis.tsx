import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FileDown, AlertTriangle, Info } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Badge } from '@/components/ui/Badge';
import { ServiceChip } from '@/components/ServiceChip';
import { EmptyState } from '@/components/ui/EmptyState';
import { COVERAGE_COLOURS, CHART_COLOURS } from '@/lib/utils';
import type { Control } from '@/types';

const SERVICE_CATEGORIES = ['Compute', 'Containers', 'AI/ML', 'Security', 'Storage', 'Network'];

export function GapAnalysis() {
  const { controls, setSelectedControl } = useStore();

  const gaps = useMemo(
    () => controls.filter((c) => c.coverage_status === 'Gap' || c.coverage_status === 'Partial'),
    [controls]
  );

  const catCounts = useMemo(() =>
    SERVICE_CATEGORIES.map((cat) => ({
      category: cat,
      Partial: gaps.filter((c) => c.service_category === cat && c.coverage_status === 'Partial').length,
      Gap: gaps.filter((c) => c.service_category === cat && c.coverage_status === 'Gap').length,
    })),
    [gaps]
  );

  // Grouped by category + domain
  const chartData = useMemo(() => {
    const map: Record<string, { Partial: number; Gap: number }> = {};
    gaps.forEach((c) => {
      const key = `${c.service_category} / ${c.ism_domain}`;
      if (!map[key]) map[key] = { Partial: 0, Gap: 0 };
      if (c.coverage_status === 'Partial') map[key].Partial++;
      if (c.coverage_status === 'Gap') map[key].Gap++;
    });
    return Object.entries(map).map(([key, v]) => ({ key: key.substring(0, 30), ...v }));
  }, [gaps]);

  function exportPDF() {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(16);
    doc.text('CloudComply — Gap Analysis Report', 14, 16);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-AU')} | ISM: December 2025 | ISO 27001:2022`, 14, 24);
    doc.setFontSize(11);
    doc.text(`Total gaps/partial: ${gaps.length} of ${controls.length} controls`, 14, 32);

    autoTable(doc, {
      startY: 38,
      head: [['Control ID', 'ISM Domain', 'ISO Control', 'Category', 'Status', 'AWS Services', 'Azure Services', 'Notes']],
      body: gaps.map((c) => [
        c.control_id,
        c.ism_domain,
        `${c.iso_control_id} ${c.iso_control_name}`,
        c.service_category,
        c.coverage_status,
        c.aws_services.join(', '),
        c.azure_services.join(', '),
        c.notes.substring(0, 120) + (c.notes.length > 120 ? '…' : ''),
      ]),
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [30, 64, 175] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    doc.save('cloudcomply-gap-report.pdf');
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page overview */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 rounded-xl px-4 py-3 flex gap-3 items-start">
        <Info className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
        <p className="text-sm text-amber-700 dark:text-amber-300">
          Controls that are <strong>Partial</strong> (cloud services exist but require significant customer configuration) or <strong>Gap</strong> (no native cloud service covers the requirement — customer must build or procure a solution). Use this page to prioritise remediation efforts. Export the full gap list as a PDF report for stakeholders.
        </p>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Gap Analysis</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {gaps.length} controls require attention
          </p>
        </div>
        <button
          onClick={exportPDF}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          <FileDown className="w-4 h-4" />
          Export Gap Report PDF
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {catCounts.map((cat) => (
          <div key={cat.category} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">{cat.category}</p>
            <div className="flex gap-2">
              <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                {cat.Partial} Partial
              </span>
              <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                {cat.Gap} Gap
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
          Partial + Gap Controls by Category &amp; Domain
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-slate-200 dark:stroke-slate-700" />
            <XAxis type="number" tick={{ fontSize: 10 }} className="fill-slate-500 dark:fill-slate-400" />
            <YAxis type="category" dataKey="key" tick={{ fontSize: 9 }} width={170} className="fill-slate-500 dark:fill-slate-400" />
            <Tooltip />
            <Legend />
            <Bar dataKey="Partial" fill={CHART_COLOURS.Partial} stackId="a" />
            <Bar dataKey="Gap" fill={CHART_COLOURS.Gap} stackId="a" radius={[0, 3, 3, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gap table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Gap &amp; Partial Controls</h3>
        </div>
        {gaps.length === 0 ? (
          <EmptyState title="No gaps found" description="All controls are covered." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                  {['Control ID', 'ISM Domain', 'Services', 'Status', 'Missing / Remediation', 'Responsibility'].map((h) => (
                    <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {gaps.map((c: Control, idx: number) => (
                  <tr
                    key={`${c.control_id}-${idx}`}
                    className="hover:bg-amber-50/50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedControl(c)}
                  >
                    <td className="px-3 py-3 font-mono text-xs font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {c.control_id}
                    </td>
                    <td className="px-3 py-3 text-slate-600 dark:text-slate-400 text-xs max-w-[120px] truncate" title={c.ism_domain}>
                      {c.ism_domain}
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
        )}
      </div>
    </div>
  );
}
