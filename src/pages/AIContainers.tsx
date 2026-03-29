import { useState, useMemo } from 'react';
import { Download, Info, X } from 'lucide-react';
import { downloadCSV } from '@/lib/utils';
import { useStore, ISM_GUIDELINES } from '@/store/useStore';
import { Badge } from '@/components/ui/Badge';
import { ServiceChip } from '@/components/ServiceChip';
import { EmptyState } from '@/components/ui/EmptyState';
import { COVERAGE_COLOURS } from '@/lib/utils';
import type { Control } from '@/types';

type Tab = 'ai' | 'containers';

const AI_CONTROL_AREAS = [
  { area: 'Access Control (Endpoints)', customer: 'Enforce IAM policies, API keys, network restrictions', aws: 'Bedrock IAM enforcement', azure: 'Entra ID RBAC for OpenAI' },
  { area: 'Inference Logging', customer: 'Configure logging destinations, set retention', aws: 'CloudTrail API logs', azure: 'Azure Monitor diagnostic settings' },
  { area: 'Data Residency', customer: 'Select AU regions, enforce via policy', aws: 'ap-southeast-2 endpoint configuration', azure: 'australiaeast region selection' },
  { area: 'Content Filtering', customer: 'Configure guardrails and content policies', aws: 'Bedrock Guardrails setup', azure: 'AI Content Safety policy configuration' },
  { area: 'Model Integrity', customer: 'Training data validation, SBOM, provenance', aws: 'SageMaker ML Lineage Tracking', azure: 'Azure ML Model Registry' },
  { area: 'General-Purpose AI Usage Policy', customer: 'Document approved use cases, prohibited inputs', aws: 'AWS Organizations SCPs', azure: 'Azure Policy + Entra ID Conditional Access' },
  { area: 'Third-Party Model Risk', customer: 'Risk assess each model, document approvals', aws: 'Marketplace compliance reports via Artifact', azure: 'AI Foundry model cards review' },
  { area: 'Prompt Injection Defence', customer: 'Input validation, hardening, adversarial testing', aws: 'Bedrock Guardrails (partial)', azure: 'Content Safety (partial)' },
];

const CONTAINER_CONTROL_AREAS = [
  { area: 'Image Vulnerability Scanning', customer: 'Enable scan-on-push, act on findings', aws: 'ECR Enhanced Scanning (Inspector)', azure: 'ACR + Defender for Containers' },
  { area: 'RBAC & Namespace Isolation', customer: 'Define RBAC policies, namespace quotas', aws: 'EKS RBAC + IRSA', azure: 'AKS Azure RBAC + Workload Identity' },
  { area: 'Runtime Threat Detection', customer: 'Enable and tune detection rules', aws: 'GuardDuty for EKS/ECS', azure: 'Defender for Containers on AKS' },
  { area: 'Secrets Management', customer: 'Inject secrets via CSI, define rotation', aws: 'Secrets Manager CSI driver', azure: 'Key Vault CSI provider' },
  { area: 'Network Policy Enforcement', customer: 'Write and apply NetworkPolicy manifests', aws: 'VPC CNI + NetworkPolicy', azure: 'Azure CNI + Azure Network Policy' },
  { area: 'Image Signing & Immutability', customer: 'Sign images, enforce admission control', aws: 'ECR + AWS Signer + Notary v2', azure: 'ACR Content Trust + Key Vault' },
  { area: 'Registry Access Control', customer: 'Configure IAM/RBAC roles for push/pull', aws: 'ECR resource-based policies', azure: 'ACR AcrPull/AcrPush RBAC roles' },
  { area: 'Container Hardening (SOE)', customer: 'Use minimal base images, remove unnecessary tools', aws: 'ECR Image Builder, Distroless images', azure: 'ACR Tasks, Defender image hardening' },
];

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

export function AIContainers() {
  const [activeTab, setActiveTab] = useState<Tab>('ai');
  const { controls, setSelectedControl } = useStore();

  // Local filters (independent of the global mapping table filters)
  const [coverageFilter, setCoverageFilter] = useState('All');
  const [guidelineFilter, setGuidelineFilter] = useState('All');
  const [responsibilityFilter, setResponsibilityFilter] = useState('All');
  const [cloudFilter, setCloudFilter] = useState('All');

  const aiControls = useMemo(() => controls.filter((c) => c.service_category === 'AI/ML'), [controls]);
  const containerControls = useMemo(() => controls.filter((c) => c.service_category === 'Containers'), [controls]);

  const baseControls = activeTab === 'ai' ? aiControls : containerControls;

  const filteredControls = useMemo(() => {
    return baseControls.filter((c) => {
      if (coverageFilter !== 'All' && c.coverage_status !== coverageFilter) return false;
      if (guidelineFilter !== 'All' && c.ism_guideline !== guidelineFilter) return false;
      if (responsibilityFilter !== 'All' && c.responsibility !== responsibilityFilter) return false;
      if (cloudFilter === 'AWS' && c.aws_services.length === 0) return false;
      if (cloudFilter === 'Azure' && c.azure_services.length === 0) return false;
      return true;
    });
  }, [baseControls, coverageFilter, guidelineFilter, responsibilityFilter, cloudFilter]);

  const currentAreas = activeTab === 'ai' ? AI_CONTROL_AREAS : CONTAINER_CONTROL_AREAS;
  const csvFilename = activeTab === 'ai' ? 'cloudcomply-ai-controls.csv' : 'cloudcomply-container-controls.csv';

  const csvData = filteredControls.map((c: Control) => ({
    control_id: c.control_id,
    ism_guideline: c.ism_guideline,
    ism_section: c.ism_section,
    ism_topic: c.ism_topic,
    iso_control_id: c.iso_control_id,
    iso_control_name: c.iso_control_name,
    service_category: c.service_category,
    classification_levels: c.classification_levels.join(', '),
    aws_services: c.aws_services.join(', '),
    azure_services: c.azure_services.join(', '),
    responsibility: c.responsibility,
    coverage_status: c.coverage_status,
    notes: c.notes,
  }));

  const hasActiveFilters =
    coverageFilter !== 'All' || guidelineFilter !== 'All' ||
    responsibilityFilter !== 'All' || cloudFilter !== 'All';

  function resetFilters() {
    setCoverageFilter('All');
    setGuidelineFilter('All');
    setResponsibilityFilter('All');
    setCloudFilter('All');
  }

  const overviewText = activeTab === 'ai'
    ? `AI/ML compliance controls covering Amazon Bedrock, SageMaker, Azure OpenAI, Azure Machine Learning, and related services. Highlights controls unique to AI workloads under ISM March 2026: general-purpose AI usage policies, model integrity, prompt injection defence, inference logging, data residency, and content filtering. The shared responsibility matrix shows what you own versus what AWS and Azure handle.`
    : `Container compliance controls covering ECS, EKS, Fargate, ECR, AKS, ACI, ACR, and related services. Highlights container-specific requirements from ISM March 2026: image vulnerability scanning, container hardening (SOE), Kubernetes RBAC, runtime threat detection, secrets management, and network policy enforcement. The shared responsibility matrix shows what you own versus what AWS and Azure handle.`;

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Page overview */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-xl px-4 py-3 flex gap-3 items-start">
        <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
        <p className="text-sm text-blue-700 dark:text-blue-300">{overviewText}</p>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">AI &amp; Container Compliance</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Dedicated compliance view for AI/ML and container service controls — ISM March 2026
          </p>
        </div>
        <button
          onClick={() => downloadCSV(csvData, csvFilename)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export {activeTab === 'ai' ? 'AI' : 'Container'} Controls CSV
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg w-fit">
        {(['ai', 'containers'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); resetFilters(); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {tab === 'ai' ? 'AI / ML Services' : 'Container Services'}
            <span className="ml-1.5 text-xs text-slate-400 dark:text-slate-500">
              ({tab === 'ai' ? aiControls.length : containerControls.length})
            </span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2">
          <FilterSelect label="Coverage" value={coverageFilter} options={['All', 'Covered', 'Partial', 'Gap']} onChange={setCoverageFilter} />
          <FilterSelect
            label="ISM Guideline"
            value={guidelineFilter}
            options={ISM_GUIDELINES}
            onChange={setGuidelineFilter}
          />
          <FilterSelect label="Responsibility" value={responsibilityFilter} options={['All', 'Customer', 'Shared', 'Provider']} onChange={setResponsibilityFilter} />
          <FilterSelect label="Cloud" value={cloudFilter} options={['All', 'AWS', 'Azure']} onChange={setCloudFilter} />
        </div>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400"
          >
            <X className="w-3.5 h-3.5" /> Clear filters
          </button>
        )}
      </div>

      {/* Shared Responsibility Matrix */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Shared Responsibility Matrix — {activeTab === 'ai' ? 'AI / ML' : 'Containers'}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Control Area</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wide">AWS</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-blue-500 dark:text-blue-300 uppercase tracking-wide">Azure</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {currentAreas.map((row) => (
                <tr key={row.area} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300 text-xs">{row.area}</td>
                  <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">{row.customer}</td>
                  <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">{row.aws}</td>
                  <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">{row.azure}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Controls table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {activeTab === 'ai' ? 'AI / ML' : 'Container'} Control Records
          </h3>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {filteredControls.length} of {baseControls.length} shown
          </span>
        </div>
        {filteredControls.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                  {['Control ID', 'ISM Guideline / Section', 'Description', 'AWS Services', 'Azure Services', 'Responsibility', 'Coverage'].map((h) => (
                    <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredControls.map((c: Control, idx: number) => (
                  <tr
                    key={`${c.control_id}-${idx}`}
                    className="hover:bg-blue-50/50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedControl(c)}
                  >
                    <td className="px-3 py-2.5 font-mono text-xs font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {c.control_id}
                    </td>
                    <td className="px-3 py-2.5 text-xs max-w-[120px]">
                      <div className="text-slate-600 dark:text-slate-400 truncate" title={c.ism_guideline}>
                        {c.ism_guideline.replace('Guidelines for ', '')}
                      </div>
                      <div className="text-slate-400 dark:text-slate-500 truncate text-xs" title={c.ism_section}>
                        {c.ism_section}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-slate-600 dark:text-slate-400 max-w-xs">
                      <p className="line-clamp-2">{c.ism_description}</p>
                    </td>
                    <td className="px-3 py-2.5 max-w-[160px]">
                      <div className="flex flex-wrap gap-1">
                        {c.aws_services.slice(0, 2).map((s) => (
                          <ServiceChip key={s} name={s} category={c.service_category} />
                        ))}
                        {c.aws_services.length > 2 && <span className="text-xs text-slate-400">+{c.aws_services.length - 2}</span>}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 max-w-[160px]">
                      <div className="flex flex-wrap gap-1">
                        {c.azure_services.slice(0, 2).map((s) => (
                          <ServiceChip key={s} name={s} category={c.service_category} />
                        ))}
                        {c.azure_services.length > 2 && <span className="text-xs text-slate-400">+{c.azure_services.length - 2}</span>}
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
