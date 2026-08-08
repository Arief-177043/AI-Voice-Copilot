import { supabase } from './supabase';
import type { Call, Customer } from './types';

export async function getDashboardKPIs() {
  const { data: calls } = await supabase.from('calls').select('*');
  if (!calls) return { callsAnalyzed: 0, conversionRate: 0, aiAssistedConversion: 0, topObjections: [], dropoffRate: 0, avgAiCostPerCall: 0 };
  const totalCalls = calls.length;
  const converted = calls.filter((c: Call) => c.converted).length;
  const aiAssistedConverted = calls.filter((c: Call) => c.converted && c.ai_assisted).length;
  const dropped = calls.filter((c: Call) => c.call_status === 'dropped' || c.call_status === 'failed').length;
  const totalAiCost = calls.reduce((sum: number, c: Call) => sum + c.ai_cost, 0);
  const { data: objectionData } = await supabase.from('objections').select('objection_type');
  const objectionCounts: Record<string, number> = {};
  if (objectionData) for (const o of objectionData) { const t = o.objection_type as string; objectionCounts[t] = (objectionCounts[t] || 0) + 1; }
  const topObjections = Object.entries(objectionCounts).map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count).slice(0, 5);
  return {
    callsAnalyzed: totalCalls,
    conversionRate: totalCalls > 0 ? converted / totalCalls : 0,
    aiAssistedConversion: totalCalls > 0 ? aiAssistedConverted / totalCalls : 0,
    topObjections, dropoffRate: totalCalls > 0 ? dropped / totalCalls : 0,
    avgAiCostPerCall: totalCalls > 0 ? totalAiCost / totalCalls : 0,
  };
}

export async function getRecentCalls(limit: number = 10): Promise<Call[]> {
  const { data } = await supabase.from('calls').select(`*, customer:customers(*)`).order('started_at', { ascending: false }).limit(limit);
  return (data as Call[]) || [];
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  const { data } = await supabase.from('customers').select('*').eq('id', id).maybeSingle();
  return (data as Customer) || null;
}

export async function getCustomerCalls(customerId: string): Promise<Call[]> {
  const { data } = await supabase.from('calls').select('*').eq('customer_id', customerId).order('started_at', { ascending: false });
  return (data as Call[]) || [];
}

export async function getCallById(id: string): Promise<Call | null> {
  const { data } = await supabase.from('calls').select(`*, customer:customers(*)`).eq('id', id).maybeSingle();
  return (data as Call) || null;
}

export async function getCallTranscript(callId: string) {
  const { data } = await supabase.from('transcript_messages').select('*').eq('call_id', callId).order('timestamp_sec', { ascending: true });
  return data || [];
}

export async function getCallRecommendations(callId: string) {
  const { data } = await supabase.from('ai_recommendations').select('*').eq('call_id', callId).order('created_at', { ascending: true });
  return data || [];
}

export async function getCallObjections(callId: string) {
  const { data } = await supabase.from('objections').select('*').eq('call_id', callId).order('detected_at_sec', { ascending: true });
  return data || [];
}

export async function getCallCRMRecords(callId: string) {
  const { data } = await supabase.from('crm_records').select('*').eq('call_id', callId).order('created_at', { ascending: true });
  return data || [];
}

export async function getCallFollowUps(callId: string) {
  const { data } = await supabase.from('follow_ups').select('*').eq('call_id', callId).order('created_at', { ascending: true });
  return data || [];
}

export async function getAllCustomers(): Promise<Customer[]> {
  const { data } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
  return (data as Customer[]) || [];
}

export async function getAuditLogs(limit: number = 20) {
  const { data } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(limit);
  return data || [];
}

export async function logAuditEvent(eventType: string, entityType: string | null, entityId: string | null, actor: string, details: Record<string, unknown>) {
  await supabase.from('audit_logs').insert({ event_type: eventType, entity_type: entityType, entity_id: entityId, actor, details, pii_masked: true });
}

export async function createCall(callData: Partial<Call>): Promise<Call | null> {
  const { data } = await supabase.from('calls').insert(callData).select().maybeSingle();
  return (data as Call) || null;
}

export async function updateCall(callId: string, updates: Partial<Call>) {
  await supabase.from('calls').update(updates).eq('id', callId);
}

export async function addTranscriptMessage(callId: string, speaker: string, text: string, timestampSec: number, sentiment: string = 'neutral') {
  await supabase.from('transcript_messages').insert({ call_id: callId, speaker, message_text: text, timestamp_sec: timestampSec, sentiment, is_pii_masked: true });
}

export async function addRecommendation(rec: Record<string, unknown>) {
  await supabase.from('ai_recommendations').insert(rec);
}

export async function addObjection(callId: string, objectionType: string, objectionText: string, detectedAtSec: number, confidenceScore: number) {
  await supabase.from('objections').insert({ call_id: callId, objection_type: objectionType, objection_text: objectionText, detected_at_sec: detectedAtSec, resolved: false, confidence_score: confidenceScore });
}

export async function addCRMRecord(rec: Record<string, unknown>) {
  await supabase.from('crm_records').insert(rec);
}

export async function addFollowUp(rec: Record<string, unknown>) {
  await supabase.from('follow_ups').insert(rec);
}

export async function approveCRMRecord(recordId: string, approvedBy: string) {
  await supabase.from('crm_records').update({ approved: true, approved_by: approvedBy, approved_at: new Date().toISOString(), applied_to_crm: true }).eq('id', recordId);
}

export async function updateRecommendationAction(recId: string, action: string) {
  await supabase.from('ai_recommendations').update({ agent_action: action, action_timestamp: new Date().toISOString() }).eq('id', recId);
}
