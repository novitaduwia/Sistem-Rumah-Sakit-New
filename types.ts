export enum AgentType {
  COORDINATOR = 'COORDINATOR',
  MEDICAL_RECORDS = 'MEDICAL_RECORDS',
  PATIENT_MANAGEMENT = 'PATIENT_MANAGEMENT',
  APPOINTMENTS = 'APPOINTMENTS',
  BILLING = 'BILLING'
}

export interface Message {
  id: string;
  role: 'user' | 'system' | 'agent';
  agentType?: AgentType;
  content: string;
  timestamp: Date;
  metadata?: {
    isSecure?: boolean; // For medical records
    toolCallId?: string;
  };
}

export interface SystemLog {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'success' | 'error';
  message: string;
}

export interface SubAgentDefinition {
  type: AgentType;
  name: string;
  description: string;
  icon: string; // Icon name
  color: string;
  isSecure: boolean;
}