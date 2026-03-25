import { Badge } from '@/components/ui/Badge';
import { SERVICE_COLOURS, SERVICE_TOOLTIPS } from '@/lib/utils';
import type { ServiceCategory } from '@/types';

interface ServiceChipProps {
  name: string;
  category: ServiceCategory;
}

// Map each service name to its category colour
const SERVICE_CATEGORY_MAP: Record<string, ServiceCategory> = {
  'EC2': 'Compute',
  'AWS Lambda': 'Compute',
  'Auto Scaling Groups': 'Compute',
  'EC2 Image Builder': 'Compute',
  'Azure Virtual Machines': 'Compute',
  'Azure Functions': 'Compute',
  'Azure App Service': 'Compute',
  'Azure VM Scale Sets': 'Compute',
  'Amazon ECS': 'Containers',
  'Amazon EKS': 'Containers',
  'AWS Fargate': 'Containers',
  'Amazon ECR': 'Containers',
  'App Mesh': 'Containers',
  'Azure Kubernetes Service': 'Containers',
  'Azure Container Instances': 'Containers',
  'Azure Container Registry': 'Containers',
  'Azure Container Apps': 'Containers',
  'Azure Service Mesh': 'Containers',
  'Amazon Bedrock': 'AI/ML',
  'Amazon SageMaker': 'AI/ML',
  'Amazon Rekognition': 'AI/ML',
  'AWS Comprehend': 'AI/ML',
  'Amazon Textract': 'AI/ML',
  'Azure OpenAI Service': 'AI/ML',
  'Azure Machine Learning': 'AI/ML',
  'Azure AI Content Safety': 'AI/ML',
  'Azure Cognitive Services': 'AI/ML',
  'Azure AI Foundry': 'AI/ML',
  'IAM': 'Security',
  'GuardDuty': 'Security',
  'Security Hub': 'Security',
  'AWS Security Hub': 'Security',
  'AWS WAF': 'Security',
  'AWS Shield': 'Security',
  'Amazon Inspector': 'Security',
  'AWS Secrets Manager': 'Security',
  'Entra ID': 'Security',
  'Microsoft Defender for Cloud': 'Security',
  'Microsoft Sentinel': 'Security',
  'Azure WAF': 'Security',
  'Azure DDoS Protection': 'Security',
  'Azure Key Vault': 'Security',
  'AWS IAM Identity Center': 'Security',
  'Microsoft Entra PIM': 'Security',
  'Microsoft Entra Access Reviews': 'Security',
  'Azure RBAC': 'Security',
  'Azure Bastion': 'Security',
  'Microsoft Defender for Containers': 'Security',
  'Azure Policy': 'Security',
  'S3': 'Storage',
  'KMS': 'Storage',
  'AWS CloudHSM': 'Storage',
  'Azure Blob Storage': 'Storage',
  'Azure Key Vault HSM': 'Storage',
  'Azure Dedicated HSM': 'Storage',
  'Amazon Macie': 'Storage',
  'VPC': 'Network',
  'AWS PrivateLink': 'Network',
  'AWS Direct Connect': 'Network',
  'Azure Virtual Network': 'Network',
  'Azure Private Link': 'Network',
  'Azure ExpressRoute': 'Network',
  'CloudTrail': 'Security',
  'CloudWatch': 'Security',
  'AWS Config': 'Security',
  'AWS Audit Manager': 'Security',
  'Azure Monitor': 'Security',
  'Log Analytics': 'Security',
  'Microsoft Purview': 'Security',
};

export function ServiceChip({ name, category }: ServiceChipProps) {
  const resolvedCategory = SERVICE_CATEGORY_MAP[name] ?? category;
  const colourClass = SERVICE_COLOURS[resolvedCategory] ?? SERVICE_COLOURS['Compute'];
  const tooltip = SERVICE_TOOLTIPS[name];

  return (
    <Badge className={colourClass} title={tooltip}>
      {name}
    </Badge>
  );
}
