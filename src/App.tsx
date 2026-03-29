import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { MappingTable } from '@/pages/MappingTable';
import { CSPCoverage } from '@/pages/CSPCoverage';
import { CrossReference } from '@/pages/CrossReference';
import { AIContainers } from '@/pages/AIContainers';
import { About } from '@/pages/About';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="mapping" element={<MappingTable />} />
          <Route path="csp-coverage" element={<CSPCoverage />} />
          <Route path="cross-reference" element={<CrossReference />} />
          <Route path="ai-containers" element={<AIContainers />} />
          <Route path="about" element={<About />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
