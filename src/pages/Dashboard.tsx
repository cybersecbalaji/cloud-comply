import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';
import { Info } from 'lucide-react';
import { useStore, SERVICE_CATEGORIES } from '@/store/useStore';
import { StatCard } from '@/components/ui/StatCard';
import { CHART_COLOURS, MACRO_THEME_MAP, CATEGORY_CHART_COLOURS } from '@/lib/utils';

// Short labels for the ISM guideline bar chart (strip "Guidelines for ")
function shortGuideline(g: string) {
  return g.replace('Guidelines for ', '').replace(' systems', '').replace(' infrastructure', '');
}

export function Dashboard() {
  const { controls, setFilter } = useStore();
  const navigate = useNavigate();

  const covered = controls.filter((c) => c.coverage_status === 'Covered').length;
  const partial = controls.filter((c) => c.coverage_status === 'Partial').length;
  const gaps = controls.filter((c) => c.coverage_status === 'Gap').length;

  const donutData = [
    { name: 'Covered', value: covered },
    { name: 'Partial', value: partial },
    { name: 'Gap', value: gaps },
  ];

  // Bar chart: controls by macro theme × coverage
  const macroMap: Record<string, { Covered: number; Partial: number; Gap: number }> = {};
  controls.forEach((c) => {
    const macro = MACRO_THEME_MAP[c.ism_guideline] || 'Technical Controls';
    if (!macroMap[macro]) macroMap[macro] = { Covered: 0, Partial: 0, Gap: 0 };
    macroMap[macro][c.coverage_status]++;
  });
  const macroData = Object.entries(macroMap)
    .map(([theme, counts]) => ({ theme, ...counts }))
    .sort((a, b) => (b.Covered + b.Partial + b.Gap) - (a.Covered + a.Partial + a.Gap));

  // Guideline breakdown chart (top 10 by count)
  const guidelineMap: Record<string, { Covered: number; Partial: number; Gap: number }> = {};
  controls.forEach((c) => {
    const label = shortGuideline(c.ism_guideline);
    if (!guidelineMap[label]) guidelineMap[label] = { Covered: 0, Partial: 0, Gap: 0 };
    guidelineMap[label][c.coverage_status]++;
  });
  const guidelineData = Object.entries(guidelineMap)
    .map(([guideline, counts]) => ({ guideline, ...counts }))
    .sort((a, b) => (b.Covered + b.Partial + b.Gap) - (a.Covered + a.Partial + a.Gap))
    .slice(0, 12);

  // Horizontal bar: controls by service category (derived from data, exclude 'All')
  const catList = SERVICE_CATEGORIES.filter((c) => c !== 'All');
  const catData = catList.map((cat) => ({
    category: cat,
    count: controls.filter((c) => c.service_category === cat).length,
  })).filter((d) => d.count > 0).sort((a, b) => b.count - a.count);

  function quickFilter(status: string) {
    setFilter('coverageStatus', status as 'Covered' | 'Partial' | 'Gap');
    navigate('/mapping');
  }

  function filterByCategory(cat: string) {
    setFilter('serviceCategory', cat);
    navigate('/mapping');
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page overview */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-xl px-4 py-3 flex gap-3 items-start">
        <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
        <p className="text-sm text-blue-700 dark:text-blue-300">
          High-level compliance coverage summary across all {controls.length} mapped ISM (March 2026) and ISO 27001:2022 controls for AWS and Azure. Use the charts and quick filters to spot coverage gaps, then jump straight to the filtered Mapping Table for details.
        </p>
      </div>

      {/* Page title */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Dashboard</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Australian ISM &amp; ISO 27001:2022 Cloud Compliance Overview
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Controls" value={controls.length} colour="text-slate-800 dark:text-slate-100" subtext="ISM + ISO 27001 mapped" />
        <StatCard label="Covered" value={covered} colour="text-green-600 dark:text-green-400" subtext={`${controls.length ? Math.round((covered / controls.length) * 100) : 0}% of total`} />
        <StatCard label="Partial Coverage" value={partial} colour="text-amber-600 dark:text-amber-400" subtext={`${controls.length ? Math.round((partial / controls.length) * 100) : 0}% of total`} />
        <StatCard label="Gaps" value={gaps} colour="text-red-600 dark:text-red-400" subtext={`${controls.length ? Math.round((gaps / controls.length) * 100) : 0}% of total`} />
      </div>

      {/* Charts row */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Donut */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Coverage Breakdown</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {donutData.map((entry) => (
                  <Cell key={entry.name} fill={CHART_COLOURS[entry.name as keyof typeof CHART_COLOURS]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {donutData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: CHART_COLOURS[d.name as keyof typeof CHART_COLOURS] }} />
                {d.name} ({d.value})
              </div>
            ))}
          </div>
        </div>

        {/* Macro theme bar chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Coverage by Theme</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={macroData} layout="vertical" margin={{ left: 0, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-slate-200 dark:stroke-slate-700" />
              <XAxis type="number" tick={{ fontSize: 11 }} className="fill-slate-500 dark:fill-slate-400" />
              <YAxis type="category" dataKey="theme" tick={{ fontSize: 10 }} width={110} className="fill-slate-500 dark:fill-slate-400" />
              <Tooltip />
              <Legend />
              <Bar dataKey="Covered" stackId="a" fill={CHART_COLOURS.Covered} />
              <Bar dataKey="Partial" stackId="a" fill={CHART_COLOURS.Partial} />
              <Bar dataKey="Gap" stackId="a" fill={CHART_COLOURS.Gap} radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Guideline breakdown (top 12) */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Controls by ISM Guideline (Top 12)</h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Stacked by coverage status — sorted by total control count</p>
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={guidelineData} layout="vertical" margin={{ left: 0, right: 16 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-slate-200 dark:stroke-slate-700" />
            <XAxis type="number" tick={{ fontSize: 10 }} className="fill-slate-500 dark:fill-slate-400" />
            <YAxis type="category" dataKey="guideline" tick={{ fontSize: 9 }} width={120} className="fill-slate-500 dark:fill-slate-400" />
            <Tooltip />
            <Legend />
            <Bar dataKey="Covered" stackId="a" fill={CHART_COLOURS.Covered} />
            <Bar dataKey="Partial" stackId="a" fill={CHART_COLOURS.Partial} />
            <Bar dataKey="Gap" stackId="a" fill={CHART_COLOURS.Gap} radius={[0, 3, 3, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Service Category horizontal bar */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Controls by Service Category</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={catData} margin={{ left: 10, right: 10, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-slate-200 dark:stroke-slate-700" />
            <XAxis dataKey="category" tick={{ fontSize: 10, angle: -35, textAnchor: 'end' }} className="fill-slate-500 dark:fill-slate-400" />
            <YAxis tick={{ fontSize: 11 }} className="fill-slate-500 dark:fill-slate-400" />
            <Tooltip />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {catData.map((entry) => (
                <Cell
                  key={entry.category}
                  fill={CATEGORY_CHART_COLOURS[entry.category] || '#64748b'}
                  style={{ cursor: 'pointer' }}
                  onClick={() => filterByCategory(entry.category)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 text-center">Click a bar to filter Mapping Table by category</p>
      </div>

      {/* Quick filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Quick Filters</h3>
        <div className="flex flex-wrap gap-2">
          {['Covered', 'Partial', 'Gap'].map((s) => (
            <button
              key={s}
              onClick={() => quickFilter(s)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors
                ${s === 'Covered' ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400' : ''}
                ${s === 'Partial' ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400' : ''}
                ${s === 'Gap' ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400' : ''}
              `}
            >
              View {s} Controls
            </button>
          ))}
          {catData.slice(0, 8).map(({ category }) => (
            <button
              key={category}
              onClick={() => filterByCategory(category)}
              className="px-4 py-1.5 rounded-full text-sm font-medium border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
