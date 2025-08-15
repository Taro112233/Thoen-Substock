// components/warehouse/BadgeComponents.tsx
import { Badge } from "@/components/ui/badge";
import { getSecurityLevelConfig, getPriorityConfig, getRequisitionStatusConfig, getReceivingStatusConfig } from "@/utils/warehouse-helpers";

interface BadgeProps {
  value: string;
}

export function SecurityLevelBadge({ value }: BadgeProps) {
  const config = getSecurityLevelConfig(value);
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function PriorityBadge({ value }: BadgeProps) {
  const config = getPriorityConfig(value);
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function RequisitionStatusBadge({ value }: BadgeProps) {
  const config = getRequisitionStatusConfig(value);
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function ReceivingStatusBadge({ value }: BadgeProps) {
  const config = getReceivingStatusConfig(value);
  return <Badge variant={config.variant}>{config.label}</Badge>;
}