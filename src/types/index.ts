export interface Control {
  control_id: string;
  ism_domain: string;
  ism_description: string;
  iso_control_id: string;
  iso_control_name: string;
  iso_theme: 'Organisational' | 'People' | 'Physical' | 'Technological';
  service_category: 'Compute' | 'Containers' | 'AI/ML' | 'Security' | 'Storage' | 'Network';
  aws_services: string[];
  azure_services: string[];
  responsibility: 'Customer' | 'Provider' | 'Shared';
  coverage_status: 'Covered' | 'Partial' | 'Gap';
  notes: string;
  source_url: string;
}

export type CoverageStatus = Control['coverage_status'];
export type ISOTheme = Control['iso_theme'];
export type ServiceCategory = Control['service_category'];
export type Responsibility = Control['responsibility'];
