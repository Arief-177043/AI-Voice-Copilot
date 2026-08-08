export type KycStatus = 'pending' | 'in_progress' | 'verified' | 'rejected' | 'not_started';
export type CallStatus = 'completed' | 'failed' | 'dropped' | 'in_progress' | 'escalated';
export type Sentiment = 'positive' | 'neutral' | 'negative' | 'mixed';
export type DropoffRisk = 'low' | 'medium' | 'high';
export type Speaker = 'agent' | 'customer' | 'ai' | 'system';
export type RecommendationType =
  | 'next_best_action' | 'objection_response' | 'product_info' | 'compliance_check' | 'kyc_prompt';
export type AgentAction = 'used' | 'verified' | 'escalated' | 'dismissed' | 'pending';
export type ObjectionType =
  | 'affordability' | 'fees' | 'kyc' | 'trust' | 'timing' | 'product_understanding' | 'comparison' | 'eligibility' | 'other';
export type KnowledgeCategory =
  | 'product_info' | 'eligibility' | 'kyc' | 'faq' | 'approved_language' | 'prohibited_claims' | 'pricing' | 'compliance';

export interface Customer {
  id: string;
  full_name: string;
  masked_name: string;
  phone_masked: string;
  email_masked: string;
  city: string;
  age: number;
  monthly_income: number;
  kyc_status: KycStatus;
  credit_score: number | null;
  existing_customer: boolean;
  product_interest: string;
  purchase_amount: number | null;
  previous_interactions: number;
  created_at: string;
}

export interface Call {
  id: string;
  customer_id: string;
  agent_name: string;
  call_status: CallStatus;
  call_duration_sec: number;
  started_at: string;
  ended_at: string | null;
  customer_intent: string;
  customer_sentiment: Sentiment;
  conversion_probability: number;
  dropoff_risk: DropoffRisk;
  converted: boolean;
  ai_assisted: boolean;
  ai_cost: number;
  summary: string | null;
  conversion_score: number;
  is_demo: boolean;
  created_at: string;
  customer?: Customer;
}

export interface TranscriptMessage {
  id: string;
  call_id: string;
  speaker: Speaker;
  message_text: string;
  timestamp_sec: number;
  sentiment: string;
  is_pii_masked: boolean;
  created_at: string;
}

export interface AIRecommendation {
  id: string;
  call_id: string;
  recommendation_type: RecommendationType;
  title: string;
  suggested_response: string;
  confidence_score: number;
  knowledge_source: string | null;
  knowledge_version: string | null;
  agent_action: AgentAction | null;
  action_timestamp: string | null;
  compliance_checked: boolean;
  compliance_passed: boolean;
  created_at: string;
}

export interface Objection {
  id: string;
  call_id: string;
  objection_type: ObjectionType;
  objection_text: string;
  detected_at_sec: number;
  resolved: boolean;
  resolution_approach: string | null;
  confidence_score: number;
  created_at: string;
}

export interface CRMRecord {
  id: string;
  call_id: string;
  customer_id: string;
  update_type: string;
  previous_status: string | null;
  new_status: string;
  notes: string | null;
  approved: boolean;
  approved_by: string | null;
  approved_at: string | null;
  applied_to_crm: boolean;
  created_at: string;
}

export interface FollowUp {
  id: string;
  call_id: string;
  customer_id: string;
  channel: string;
  message_body: string;
  scheduled_for: string | null;
  sent: boolean;
  created_at: string;
}

export interface KnowledgeEntry {
  id: string;
  category: KnowledgeCategory;
  title: string;
  content: string;
  keywords: string[];
  version: string;
  effective_date: string;
  is_active: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  event_type: string;
  entity_type: string | null;
  entity_id: string | null;
  actor: string;
  details: Record<string, unknown> | null;
  pii_masked: boolean;
  created_at: string;
}

export interface DashboardKPIs {
  callsAnalyzed: number;
  conversionRate: number;
  aiAssistedConversion: number;
  topObjections: { type: string; count: number }[];
  dropoffRate: number;
  avgAiCostPerCall: number;
}

export interface RAGResult {
  title: string;
  content: string;
  source: string;
  version: string;
  score: number;
  category: KnowledgeCategory;
}

export interface AIAnalysis {
  intent: string;
  sentiment: Sentiment;
  conversionProbability: number;
  dropoffRisk: DropoffRisk;
  objectionType: ObjectionType | null;
  objectionText: string | null;
  nextBestAction: string;
  suggestedResponse: string;
  confidenceScore: number;
  ragSource: RAGResult | null;
  compliancePassed: boolean;
  complianceNotes: string;
}
