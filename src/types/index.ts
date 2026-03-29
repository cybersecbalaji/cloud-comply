export interface Control {
  control_id: string;
  ism_guideline: string;           // Official ISM guideline name e.g. "Guidelines for system hardening"
  ism_section: string;             // Section within guideline e.g. "Operating system hardening"
  ism_topic: string;               // Topic within section e.g. "Operating system releases and versions"
  ism_description: string;         // Full control text
  classification_levels: string[]; // Applicable classification levels e.g. ["NC","OS","P","S","TS"]
  iso_control_id: string;
  iso_control_name: string;
  iso_theme: 'Organisational' | 'People' | 'Physical' | 'Technological';
  service_category: string;        // e.g. Compute, Containers, AI/ML, Security, Storage, Network, Identity, DevOps, Database, Email, Gateway, Governance
  aws_services: string[];
  azure_services: string[];
  responsibility: 'Customer' | 'Provider' | 'Shared';
  coverage_status: 'Covered' | 'Partial' | 'Gap';
  notes: string;
  source_url: string;
}

export type CoverageStatus = Control['coverage_status'];
export type ISOTheme = Control['iso_theme'];
export type ServiceCategory = string;
export type Responsibility = Control['responsibility'];
