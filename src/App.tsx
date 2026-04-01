import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { MappingTable } from '@/pages/MappingTable';
import { CSPCoverage } from '@/pages/CSPCoverage';
import { CrossReference } from '@/pages/CrossReference';
import { AIContainers } from '@/pages/AIContainers';
import { ImplementationTracker } from '@/pages/ImplementationTracker';
import { About } from '@/pages/About';

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
      <span className="text-5xl font-bold text-slate-200 dark:text-slate-700">404</span>
      <h1 className="text-xl font-semibold text-slate-700 dark:text-slate-300">Page not found</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">The page you're looking for doesn't exist.</p>
      <a href="/" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">Go to Dashboard</a>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="mapping" element={<MappingTable />} />
          <Route path="csp-coverage" element={<CSPCoverage />} />
          <Route path="gap-analysis" element={<Navigate to="/csp-coverage" replace />} />
          <Route path="cross-reference" element={<CrossReference />} />
          <Route path="ai-containers" element={<AIContainers />} />
          <Route path="implementation" element={<ImplementationTracker />} />
          <Route path="about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
