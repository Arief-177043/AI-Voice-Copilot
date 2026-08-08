/*
# AI Voice Co-Pilot for Inside Sales - Initial Schema

## Overview
Creates the full database schema for an AI Voice Co-Pilot that assists inside sales agents
selling a fintech "Pay-in-3 Zero-Cost EMI" product. The app is a single-tenant demo (no auth),
so all policies are open to anon+authenticated.

## Tables Created
1. `customers` — synthetic customer profiles with KYC status, PII-masked fields
2. `calls` — historical and live call records with sentiment, intent, conversion data
3. `transcript_messages` — individual transcript lines for each call
4. `ai_recommendations` — AI suggestions during calls (next best action, objections, etc.)
5. `crm_records` — CRM updates generated post-call, with approval status
6. `follow_ups` — personalized follow-up messages generated after calls
7. `knowledge_base` — approved product information for RAG retrieval
8. `audit_logs` — immutable audit trail for compliance and security
9. `objjections` — catalog of detected objections per call

## Security
- RLS enabled on all tables
- All policies use `TO anon, authenticated` with `USING (true)` — single-tenant demo app,
  data is intentionally shared/public
*/

-- ============================================================
-- 1. CUSTOMERS
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  masked_name text NOT NULL,
  phone_masked text NOT NULL,
  email_masked text NOT NULL,
  city text NOT NULL,
  age int NOT NULL,
  monthly_income int NOT NULL,
  kyc_status text NOT NULL DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'in_progress', 'verified', 'rejected', 'not_started')),
  credit_score int,
  existing_customer boolean NOT NULL DEFAULT false,
  product_interest text NOT NULL DEFAULT 'Pay-in-3',
  purchase_amount int,
  previous_interactions int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_customers" ON customers;
CREATE POLICY "anon_select_customers" ON customers FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_customers" ON customers;
CREATE POLICY "anon_insert_customers" ON customers FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_customers" ON customers;
CREATE POLICY "anon_update_customers" ON customers FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_customers" ON customers;
CREATE POLICY "anon_delete_customers" ON customers FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- 2. CALLS
-- ============================================================
CREATE TABLE IF NOT EXISTS calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  agent_name text NOT NULL,
  call_status text NOT NULL DEFAULT 'completed' CHECK (call_status IN ('completed', 'failed', 'dropped', 'in_progress', 'escalated')),
  call_duration_sec int NOT NULL DEFAULT 0,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  customer_intent text NOT NULL DEFAULT 'exploring',
  customer_sentiment text NOT NULL DEFAULT 'neutral' CHECK (customer_sentiment IN ('positive', 'neutral', 'negative', 'mixed')),
  conversion_probability numeric NOT NULL DEFAULT 0.0 CHECK (conversion_probability >= 0 AND conversion_probability <= 1),
  dropoff_risk text NOT NULL DEFAULT 'low' CHECK (dropoff_risk IN ('low', 'medium', 'high')),
  converted boolean NOT NULL DEFAULT false,
  ai_assisted boolean NOT NULL DEFAULT false,
  ai_cost numeric NOT NULL DEFAULT 0.0,
  summary text,
  conversion_score numeric DEFAULT 0.0,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_calls" ON calls;
CREATE POLICY "anon_select_calls" ON calls FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_calls" ON calls;
CREATE POLICY "anon_insert_calls" ON calls FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_calls" ON calls;
CREATE POLICY "anon_update_calls" ON calls FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_calls" ON calls;
CREATE POLICY "anon_delete_calls" ON calls FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- 3. TRANSCRIPT MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS transcript_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id uuid REFERENCES calls(id) ON DELETE CASCADE,
  speaker text NOT NULL CHECK (speaker IN ('agent', 'customer', 'ai', 'system')),
  message_text text NOT NULL,
  timestamp_sec numeric NOT NULL DEFAULT 0,
  sentiment text DEFAULT 'neutral',
  is_pii_masked boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transcript_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_transcript" ON transcript_messages;
CREATE POLICY "anon_select_transcript" ON transcript_messages FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_transcript" ON transcript_messages;
CREATE POLICY "anon_insert_transcript" ON transcript_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_transcript" ON transcript_messages;
CREATE POLICY "anon_update_transcript" ON transcript_messages FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_transcript" ON transcript_messages;
CREATE POLICY "anon_delete_transcript" ON transcript_messages FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- 4. AI RECOMMENDATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id uuid REFERENCES calls(id) ON DELETE CASCADE,
  recommendation_type text NOT NULL CHECK (recommendation_type IN ('next_best_action', 'objection_response', 'product_info', 'compliance_check', 'kyc_prompt')),
  title text NOT NULL,
  suggested_response text NOT NULL,
  confidence_score numeric NOT NULL DEFAULT 0.0 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  knowledge_source text,
  knowledge_version text,
  agent_action text CHECK (agent_action IN ('used', 'verified', 'escalated', 'dismissed', 'pending')),
  action_timestamp timestamptz,
  compliance_checked boolean NOT NULL DEFAULT true,
  compliance_passed boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_recommendations" ON ai_recommendations;
CREATE POLICY "anon_select_recommendations" ON ai_recommendations FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_recommendations" ON ai_recommendations;
CREATE POLICY "anon_insert_recommendations" ON ai_recommendations FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_recommendations" ON ai_recommendations;
CREATE POLICY "anon_update_recommendations" ON ai_recommendations FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_recommendations" ON ai_recommendations;
CREATE POLICY "anon_delete_recommendations" ON ai_recommendations FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- 5. OBJECTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS objections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id uuid REFERENCES calls(id) ON DELETE CASCADE,
  objection_type text NOT NULL CHECK (objection_type IN ('affordability', 'fees', 'kyc', 'trust', 'timing', 'product_understanding', 'comparison', 'eligibility', 'other')),
  objection_text text NOT NULL,
  detected_at_sec numeric NOT NULL DEFAULT 0,
  resolved boolean NOT NULL DEFAULT false,
  resolution_approach text,
  confidence_score numeric NOT NULL DEFAULT 0.0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE objections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_objections" ON objections;
CREATE POLICY "anon_select_objections" ON objections FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_objections" ON objections;
CREATE POLICY "anon_insert_objections" ON objections FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_objections" ON objections;
CREATE POLICY "anon_update_objections" ON objections FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_objections" ON objections;
CREATE POLICY "anon_delete_objections" ON objections FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- 6. CRM RECORDS
-- ============================================================
CREATE TABLE IF NOT EXISTS crm_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id uuid REFERENCES calls(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  update_type text NOT NULL CHECK (update_type IN ('new_lead', 'status_change', 'note', 'follow_up_scheduled', 'kyc_initiated', 'onboarding')),
  previous_status text,
  new_status text NOT NULL,
  notes text,
  approved boolean NOT NULL DEFAULT false,
  approved_by text,
  approved_at timestamptz,
  applied_to_crm boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE crm_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_crm" ON crm_records;
CREATE POLICY "anon_select_crm" ON crm_records FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_crm" ON crm_records;
CREATE POLICY "anon_insert_crm" ON crm_records FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_crm" ON crm_records;
CREATE POLICY "anon_update_crm" ON crm_records FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_crm" ON crm_records;
CREATE POLICY "anon_delete_crm" ON crm_records FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- 7. FOLLOW UPS
-- ============================================================
CREATE TABLE IF NOT EXISTS follow_ups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id uuid REFERENCES calls(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  channel text NOT NULL DEFAULT 'email' CHECK (channel IN ('email', 'sms', 'whatsapp', 'call')),
  message_body text NOT NULL,
  scheduled_for timestamptz,
  sent boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_follow_ups" ON follow_ups;
CREATE POLICY "anon_select_follow_ups" ON follow_ups FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_follow_ups" ON follow_ups;
CREATE POLICY "anon_insert_follow_ups" ON follow_ups FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_follow_ups" ON follow_ups;
CREATE POLICY "anon_update_follow_ups" ON follow_ups FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_follow_ups" ON follow_ups;
CREATE POLICY "anon_delete_follow_ups" ON follow_ups FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- 8. KNOWLEDGE BASE (RAG source)
-- ============================================================
CREATE TABLE IF NOT EXISTS knowledge_base (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (category IN ('product_info', 'eligibility', 'kyc', 'faq', 'approved_language', 'prohibited_claims', 'pricing', 'compliance')),
  title text NOT NULL,
  content text NOT NULL,
  keywords text[],
  version text NOT NULL DEFAULT 'v1.0',
  effective_date date NOT NULL DEFAULT CURRENT_DATE,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_knowledge" ON knowledge_base;
CREATE POLICY "anon_select_knowledge" ON knowledge_base FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_knowledge" ON knowledge_base;
CREATE POLICY "anon_insert_knowledge" ON knowledge_base FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_knowledge" ON knowledge_base;
CREATE POLICY "anon_update_knowledge" ON knowledge_base FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_knowledge" ON knowledge_base;
CREATE POLICY "anon_delete_knowledge" ON knowledge_base FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- 9. AUDIT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL CHECK (event_type IN ('call_started', 'call_ended', 'ai_recommendation_shown', 'ai_recommendation_actioned', 'crm_update_approved', 'crm_update_rejected', 'compliance_check', 'kyc_initiated', 'consent_given', 'consent_denied', 'escalation', 'data_access')),
  entity_type text,
  entity_id uuid,
  actor text NOT NULL DEFAULT 'system',
  details jsonb,
  pii_masked boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_audit" ON audit_logs;
CREATE POLICY "anon_select_audit" ON audit_logs FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_audit" ON audit_logs;
CREATE POLICY "anon_insert_audit" ON audit_logs FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_audit" ON audit_logs;
CREATE POLICY "anon_update_audit" ON audit_logs FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_audit" ON audit_logs;
CREATE POLICY "anon_delete_audit" ON audit_logs FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_calls_customer ON calls(customer_id);
CREATE INDEX IF NOT EXISTS idx_calls_status ON calls(call_status);
CREATE INDEX IF NOT EXISTS idx_transcript_call ON transcript_messages(call_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_call ON ai_recommendations(call_id);
CREATE INDEX IF NOT EXISTS idx_objections_call ON objections(call_id);
CREATE INDEX IF NOT EXISTS idx_crm_call ON crm_records(call_id);
CREATE INDEX IF NOT EXISTS idx_followups_call ON follow_ups(call_id);
CREATE INDEX IF NOT EXISTS idx_kb_category ON knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_kb_keywords ON knowledge_base USING GIN (keywords);
