import { clsx, type ClassValue } from 'clsx';

export function downloadCSV(rows: Record<string, string | number>[], filename: string) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const escape = (v: string | number) => {
    let s = String(v);
    // Prevent CSV formula injection: prefix dangerous leading chars so
    // Excel/Sheets won't interpret the cell as a formula.
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    s = s.replace(/"/g, '""');
    return s.includes(',') || s.includes('\n') || s.includes('"') ? `"${s}"` : s;
  };
  const csv = [headers.map(escape).join(','), ...rows.map((r) => headers.map((h) => escape(r[h] ?? '')).join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export const SERVICE_COLOURS: Record<string, string> = {
  'Compute': 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  'Containers': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'AI/ML': 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  'Security': 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  'Storage': 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  'Network': 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
};

export const COVERAGE_COLOURS: Record<string, string> = {
  'Covered': 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  'Partial': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  'Gap': 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

export const RESPONSIBILITY_COLOURS: Record<string, string> = {
  'Customer': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'Provider': 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  'Shared': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
};

export const ISO_THEME_COLOURS: Record<string, string> = {
  'Organisational': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  'People': 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  'Physical': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  'Technological': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
};

export const CHART_COLOURS = {
  Covered: '#22c55e',
  Partial: '#f59e0b',
  Gap: '#ef4444',
};

export const CATEGORY_CHART_COLOURS: Record<string, string> = {
  Compute: '#64748b',
  Containers: '#3b82f6',
  'AI/ML': '#f97316',
  Security: '#22c55e',
  Storage: '#a855f7',
  Network: '#8b5cf6',
};

export const SERVICE_TOOLTIPS: Record<string, string> = {
  'EC2': 'Scalable virtual machines in the AWS cloud',
  'AWS Lambda': 'Serverless compute — run code without provisioning servers',
  'Auto Scaling Groups': 'Automatically adjusts EC2 capacity to meet demand',
  'EC2 Image Builder': 'Automates creation and patching of EC2 AMIs',
  'Amazon ECS': 'Managed container orchestration for Docker containers',
  'Amazon EKS': 'Managed Kubernetes service on AWS',
  'AWS Fargate': 'Serverless compute engine for containers',
  'Amazon ECR': 'Fully managed Docker container registry',
  'App Mesh': 'Service mesh for microservices networking on AWS',
  'Amazon Bedrock': 'Fully managed foundation models API from AWS',
  'Amazon SageMaker': 'End-to-end machine learning development platform',
  'Amazon Rekognition': 'Computer vision service for image and video analysis',
  'AWS Comprehend': 'Natural language processing service from AWS',
  'Amazon Textract': 'Extracts text and data from scanned documents',
  'IAM': 'Identity and Access Management for AWS resources',
  'GuardDuty': 'ML-based threat detection for AWS accounts',
  'Security Hub': 'Centralised AWS security findings aggregator',
  'AWS WAF': 'Web Application Firewall for AWS',
  'AWS Shield': 'Managed DDoS protection for AWS',
  'Amazon Inspector': 'Automated vulnerability assessment for EC2 and containers',
  'AWS Secrets Manager': 'Managed service for storing and rotating secrets',
  'CloudTrail': 'Logs all AWS API calls for audit and compliance',
  'CloudWatch': 'Monitoring and observability for AWS resources',
  'AWS Config': 'Records and evaluates AWS resource configurations',
  'AWS Audit Manager': 'Automates evidence collection for AWS audits',
  'S3': 'Scalable object storage service from AWS',
  'KMS': 'Managed encryption key creation and control on AWS',
  'VPC': 'Isolated virtual network in the AWS cloud',
  'AWS PrivateLink': 'Private connectivity to AWS services without internet',
  'Azure Virtual Machines': 'On-demand scalable computing resources in Azure',
  'Azure Functions': 'Serverless compute service in Azure',
  'Azure App Service': 'Platform for building and hosting web apps in Azure',
  'Azure VM Scale Sets': 'Auto-scales a set of identical Azure VMs',
  'Azure Kubernetes Service': 'Managed Kubernetes cluster service in Azure',
  'Azure Container Instances': 'Run containers without managing servers in Azure',
  'Azure Container Registry': 'Managed Docker and OCI container registry in Azure',
  'Azure Container Apps': 'Serverless container hosting on Azure',
  'Azure Service Mesh': 'Istio-based service mesh for AKS workloads',
  'Azure OpenAI Service': 'Access to OpenAI models through Azure',
  'Azure Machine Learning': 'End-to-end ML platform in Azure',
  'Azure AI Content Safety': 'Detects harmful content in AI inputs and outputs',
  'Azure Cognitive Services': 'Pre-built AI APIs for vision, speech, and language',
  'Azure AI Foundry': 'Unified hub for building and deploying AI solutions in Azure',
  'Entra ID': 'Azure Active Directory — cloud identity and access management',
  'Microsoft Defender for Cloud': 'Cloud security posture management and threat protection',
  'Microsoft Sentinel': 'Cloud-native SIEM and SOAR from Microsoft',
  'Azure WAF': 'Web Application Firewall for Azure resources',
  'Azure DDoS Protection': 'Managed DDoS mitigation for Azure resources',
  'Azure Key Vault': 'Managed secrets, keys, and certificates service in Azure',
  'Azure Monitor': 'Full-stack monitoring for Azure resources and applications',
  'Log Analytics': 'Log data storage and querying workspace in Azure',
  'Microsoft Purview': 'Data governance and compliance management in Azure',
  'Azure Blob Storage': 'Scalable unstructured object storage in Azure',
  'Azure Virtual Network': 'Isolated network in Azure for resources',
  'Azure Private Link': 'Private connectivity to Azure services without internet',
  'AWS IAM Identity Center': 'Centralised SSO and access management across AWS accounts',
  'AWS Systems Manager': 'Operations management for AWS resources',
  'AWS Systems Manager Session Manager': 'Secure browser-based shell without SSH/RDP',
  'EC2 Instance Connect': 'One-click SSH access to EC2 instances via browser',
  'AWS Nitro System': 'AWS hypervisor providing hardware-enforced security isolation',
  'Azure Trusted Launch': 'Secure Boot and vTPM for Azure VMs',
  'AWS Certificate Manager': 'Provision and manage TLS/SSL certificates on AWS',
  'AWS IAM Roles for Service Accounts': 'Pod-level IAM role assignment for EKS workloads',
  'Azure RBAC': 'Role-based access control for Azure resources',
  'Microsoft Entra PIM': 'Privileged Identity Management for just-in-time access',
  'Azure Policy': 'Enforces organisational standards across Azure resources',
  'Azure Update Manager': 'Centralised OS patching for Azure VMs',
  'Microsoft Defender for Containers': 'Runtime protection and vulnerability scanning for containers',
  'Azure Bastion': 'Secure RDP/SSH access to Azure VMs via browser',
  'AWS CloudFormation': 'Infrastructure-as-Code for AWS resource provisioning',
  'Azure Resource Manager': 'Deployment and management layer for Azure resources',
  'Azure Disk Encryption': 'OS and data disk encryption for Azure VMs',
  'AWS CloudHSM': 'Dedicated FIPS 140-2 Level 3 hardware security module on AWS',
  'Azure Dedicated HSM': 'FIPS 140-2 Level 3 dedicated HSM in Azure',
  'Azure Compute Gallery': 'Repository for sharing VM images across Azure subscriptions',
  'Amazon Macie': 'ML-based sensitive data discovery in S3',
  'AWS Glue': 'Serverless ETL service for data preparation on AWS',
  'AWS Marketplace': 'Digital catalogue for third-party software on AWS',
  'Azure Marketplace': 'Online store for certified enterprise apps and solutions on Azure',
  'AWS Artifact': 'On-demand access to AWS compliance reports and agreements',
  'AWS CodePipeline': 'Continuous integration and delivery pipeline service on AWS',
  'Azure DevOps': 'DevOps tools for planning, building, and deploying software in Azure',
  'AWS Verified Access': 'Zero-trust application access without VPN on AWS',
  'Azure AD Application Proxy': 'Secure remote access to on-premises apps via Entra ID',
  'AWS Direct Connect': 'Dedicated private network connection from on-premises to AWS',
  'Azure ExpressRoute': 'Dedicated private connection from on-premises to Azure',
  'AWS Systems Manager Incident Manager': 'Automated incident response and runbook orchestration on AWS',
  'AWS Organizations': 'Centralised management of multiple AWS accounts',
  'AWS Transit Gateway': 'Hub-and-spoke network connectivity across VPCs and accounts',
  'Azure Virtual WAN': 'Managed wide-area network service for Azure and on-premises',
  'Amazon CloudFront': 'Global content delivery network (CDN) from AWS',
  'Azure Front Door': 'Global CDN and WAF service from Azure',
  'Amazon API Gateway': 'Managed API publishing and management service on AWS',
  'Azure API Management': 'Full lifecycle API management gateway in Azure',
  'AWS Signer': 'Code and container image signing service from AWS',
  'AWS Security Hub': 'Centralised view of AWS security alerts and compliance',
  'Azure CNI': 'Container network interface for AKS using Azure VNet IPs',
  'AWS VPC CNI': 'Container network interface for EKS using VPC native IPs',
  'Microsoft Entra Access Reviews': 'Periodic access reviews for Azure AD group and app memberships',
};
