/*
# Seed: 30 Historical Calls with Transcripts, Objections, AI Recommendations, CRM, Follow-ups

All data is synthetic. Calls include successful conversions, failed calls, dropped calls,
and escalated calls. Each has realistic transcript snippets, detected objections,
AI recommendations with confidence scores, CRM updates, and follow-up messages.
AI cost per call is estimated at Rs. 12-18 based on LLM token usage.
This migration is idempotent — uses ON CONFLICT DO NOTHING and DO $$ block.
*/

DO $$
DECLARE
  base_call_id uuid;
BEGIN
  -- ---- CALL 1: Successful, AI-assisted, Rahul Sharma ----
  base_call_id := gen_random_uuid();
  INSERT INTO calls (id, customer_id, agent_name, call_status, call_duration_sec, started_at, ended_at, customer_intent, customer_sentiment, conversion_probability, dropoff_risk, converted, ai_assisted, ai_cost, summary, conversion_score, is_demo)
  VALUES (base_call_id, 'c0000001-0000-0000-0000-000000000001', 'Agent Priya', 'completed', 420, now() - interval '5 days', now() - interval '5 days' + interval '7 minutes', 'ready_to_onboard', 'positive', 0.92, 'low', true, true, 15.50, 'Customer was initially concerned about affordability but was convinced by Pay-in-3 zero-cost structure. KYC initiated. High conversion probability.', 0.92, false);

  INSERT INTO transcript_messages (call_id, speaker, message_text, timestamp_sec, sentiment) VALUES
  (base_call_id, 'agent', 'Hello Rahul, I am calling about your interest in Pay-in-3. Do you have a moment?', 0, 'neutral'),
  (base_call_id, 'customer', 'I am interested but Rs. 9,000 is expensive for me right now.', 12, 'negative'),
  (base_call_id, 'ai', '[Objection Detected: Affordability] Suggest explaining Pay-in-3 payment structure.', 14, 'neutral'),
  (base_call_id, 'agent', 'I understand. With Pay-in-3, you pay only Rs. 3,000 today, and Rs. 3,000 each after 30 and 60 days. Zero interest, zero fees.', 22, 'positive'),
  (base_call_id, 'customer', 'Is it really zero cost? No hidden charges?', 35, 'neutral'),
  (base_call_id, 'ai', '[RAG Retrieved] Pay-in-3 is genuinely zero cost per RBI guidelines.', 37, 'neutral'),
  (base_call_id, 'agent', 'Yes, it is genuinely zero cost. The merchant covers the cost, not you.', 42, 'positive'),
  (base_call_id, 'customer', 'Do I need KYC?', 55, 'neutral'),
  (base_call_id, 'ai', '[RAG Retrieved] KYC is a one-time 5-minute process per RBI guidelines.', 57, 'neutral'),
  (base_call_id, 'agent', 'KYC is a one-time process that takes about 5 minutes. Once done, you can use Pay-in-3 anytime.', 62, 'positive'),
  (base_call_id, 'customer', 'Okay, I want to proceed.', 75, 'positive'),
  (base_call_id, 'ai', '[Intent Changed: Ready to Onboard] Next Best Action: Start KYC', 77, 'positive');

  INSERT INTO objections (id, call_id, objection_type, objection_text, detected_at_sec, resolved, resolution_approach, confidence_score)
  VALUES (gen_random_uuid(), base_call_id, 'affordability', 'Rs. 9,000 is expensive for me right now', 12, true, 'Explained Pay-in-3 payment structure: Rs. 3,000 x 3 with zero interest', 0.94);

  INSERT INTO ai_recommendations (id, call_id, recommendation_type, title, suggested_response, confidence_score, knowledge_source, knowledge_version, agent_action, compliance_checked, compliance_passed)
  VALUES
  (gen_random_uuid(), base_call_id, 'objection_response', 'Explain Pay-in-3 Payment Structure', 'With Pay-in-3, you pay only Rs. 3,000 today, and Rs. 3,000 each after 30 and 60 days. Zero interest, zero processing fee.', 0.94, 'Knowledge Base: Pay-in-3 Payment Structure v2.1', 'v2.1', 'used', true, true),
  (gen_random_uuid(), base_call_id, 'product_info', 'Confirm Zero Cost', 'Pay-in-3 is genuinely zero cost per RBI guidelines. No interest, no processing fee, no hidden charges.', 0.96, 'Knowledge Base: Is Pay-in-3 really zero cost? v2.1', 'v2.1', 'used', true, true),
  (gen_random_uuid(), base_call_id, 'product_info', 'KYC Information', 'KYC is a one-time 5-minute process involving PAN, Aadhaar OTP, bank verification, and selfie.', 0.93, 'Knowledge Base: KYC Process for Pay-in-3 v2.1', 'v2.1', 'used', true, true),
  (gen_random_uuid(), base_call_id, 'next_best_action', 'Start KYC Process', 'Customer is ready to onboard. Initiate KYC verification now.', 0.91, 'Knowledge Base: KYC Process for Pay-in-3 v2.1', 'v2.1', 'used', true, true);

  INSERT INTO crm_records (id, call_id, customer_id, update_type, previous_status, new_status, notes, approved, approved_by, applied_to_crm)
  VALUES (gen_random_uuid(), base_call_id, 'c0000001-0000-0000-0000-000000000001', 'kyc_initiated', 'lead', 'kyc_in_progress', 'Customer agreed to proceed. KYC initiated. Affordability objection resolved.', true, 'Agent Priya', true);

  INSERT INTO follow_ups (id, call_id, customer_id, channel, message_body, scheduled_for, sent)
  VALUES (gen_random_uuid(), base_call_id, 'c0000001-0000-0000-0000-000000000001', 'whatsapp', 'Hi Rahul, thank you for choosing Pay-in-3! Your KYC verification has been initiated. Please complete your PAN and Aadhaar verification at your convenience. Your first payment of Rs. 3,000 is due at checkout.', now() + interval '1 day', true);

  INSERT INTO audit_logs (event_type, entity_type, entity_id, actor, details, pii_masked)
  VALUES ('call_started', 'call', base_call_id, 'Agent Priya', jsonb_build_object('customer', 'Rahul S.', 'consent', true), true);

  -- ---- CALL 2: Failed, dropped, Arun Kumar ----
  base_call_id := gen_random_uuid();
  INSERT INTO calls (id, customer_id, agent_name, call_status, call_duration_sec, started_at, ended_at, customer_intent, customer_sentiment, conversion_probability, dropoff_risk, converted, ai_assisted, ai_cost, summary, conversion_score, is_demo)
  VALUES (base_call_id, 'c0000001-0000-0000-0000-000000000003', 'Agent Rohit', 'dropped', 180, now() - interval '4 days', now() - interval '4 days' + interval '3 minutes', 'exploring', 'negative', 0.15, 'high', false, true, 12.00, 'Customer expressed trust concerns and dropped off. KYC not initiated. Needs follow-up to rebuild trust.', 0.15, false);

  INSERT INTO transcript_messages (call_id, speaker, message_text, timestamp_sec, sentiment) VALUES
  (base_call_id, 'agent', 'Hello Arun, I am calling about Pay-in-3. Is this a good time?', 0, 'neutral'),
  (base_call_id, 'customer', 'I am not sure about this. How can I trust this product?', 15, 'negative'),
  (base_call_id, 'ai', '[Objection Detected: Trust] Suggest using approved trust-building language.', 17, 'neutral'),
  (base_call_id, 'agent', 'Pay-in-3 is RBI-compliant with bank-grade security and no hidden charges.', 25, 'neutral'),
  (base_call_id, 'customer', 'I need to think about it. Let me call you back.', 40, 'negative'),
  (base_call_id, 'ai', '[Drop-off Risk: HIGH] Customer is disengaging. Next Best Action: Offer to send information via WhatsApp.', 42, 'neutral');

  INSERT INTO objections (id, call_id, objection_type, objection_text, detected_at_sec, resolved, resolution_approach, confidence_score)
  VALUES (gen_random_uuid(), base_call_id, 'trust', 'How can I trust this product?', 15, false, null, 0.88);

  INSERT INTO ai_recommendations (id, call_id, recommendation_type, title, suggested_response, confidence_score, knowledge_source, knowledge_version, agent_action, compliance_checked, compliance_passed)
  VALUES
  (gen_random_uuid(), base_call_id, 'objection_response', 'Build Trust with Approved Language', 'Pay-in-3 is a regulated product compliant with RBI guidelines. Your data is encrypted. Over 500,000 customers have used it with 97% satisfaction.', 0.89, 'Knowledge Base: Approved Sales Language - Trust Objection v2.1', 'v2.1', 'used', true, true),
  (gen_random_uuid(), base_call_id, 'next_best_action', 'Offer to Send Information', 'Customer is disengaging. Offer to send product details via WhatsApp for review.', 0.82, 'Knowledge Base: Pay-in-3 Overview v2.1', 'v2.1', 'dismissed', true, true);

  INSERT INTO follow_ups (id, call_id, customer_id, channel, message_body, scheduled_for, sent)
  VALUES (gen_random_uuid(), base_call_id, 'c0000001-0000-0000-0000-000000000003', 'whatsapp', 'Hi Arun, thank you for your time today. I understand you would like to learn more about Pay-in-3. Here is a quick overview: Pay-in-3 lets you split any purchase into 3 zero-cost payments. It is RBI-compliant and trusted by 500,000+ customers. Feel free to reach out when you are ready!', now() + interval '2 days', false);

  -- ---- CALL 3: Successful, AI-assisted, Sneha Reddy ----
  base_call_id := gen_random_uuid();
  INSERT INTO calls (id, customer_id, agent_name, call_status, call_duration_sec, started_at, ended_at, customer_intent, customer_sentiment, conversion_probability, dropoff_risk, converted, ai_assisted, ai_cost, summary, conversion_score, is_demo)
  VALUES (base_call_id, 'c0000001-0000-0000-0000-000000000004', 'Agent Priya', 'completed', 380, now() - interval '3 days', now() - interval '3 days' + interval '6 minutes', 'ready_to_onboard', 'positive', 0.95, 'low', true, true, 16.50, 'Existing customer upgrading. No major objections. KYC already verified. Smooth conversion.', 0.95, false);

  INSERT INTO transcript_messages (call_id, speaker, message_text, timestamp_sec, sentiment) VALUES
  (base_call_id, 'agent', 'Hi Sneha, you have used Pay-in-3 before. Interested in a new purchase?', 0, 'positive'),
  (base_call_id, 'customer', 'Yes, I want to buy something for Rs. 27,000. Can I split it?', 10, 'positive'),
  (base_call_id, 'agent', 'Absolutely! Rs. 9,000 today, Rs. 9,000 after 30 days, and Rs. 9,000 after 60 days. Zero cost.', 18, 'positive'),
  (base_call_id, 'customer', 'Perfect. My KYC is already done right?', 30, 'positive'),
  (base_call_id, 'ai', '[RAG Retrieved] Customer KYC status: Verified. No repeat needed.', 32, 'positive'),
  (base_call_id, 'agent', 'Yes, your KYC is already verified. You can proceed directly to checkout.', 37, 'positive'),
  (base_call_id, 'customer', 'Great, let me proceed.', 45, 'positive');

  INSERT INTO ai_recommendations (id, call_id, recommendation_type, title, suggested_response, confidence_score, knowledge_source, knowledge_version, agent_action, compliance_checked, compliance_passed)
  VALUES (gen_random_uuid(), base_call_id, 'product_info', 'Confirm KYC Status', 'Customer KYC is verified. No repeat KYC needed for this purchase.', 0.97, 'Knowledge Base: KYC Process for Pay-in-3 v2.1', 'v2.1', 'used', true, true);

  INSERT INTO crm_records (id, call_id, customer_id, update_type, previous_status, new_status, notes, approved, approved_by, applied_to_crm)
  VALUES (gen_random_uuid(), base_call_id, 'c0000001-0000-0000-0000-000000000004', 'status_change', 'existing_customer', 'repeat_purchase', 'Repeat purchase of Rs. 27,000. No objections. KYC verified.', true, 'Agent Priya', true);

  -- ---- CALL 4: Failed, timing objection, Vikram Singh ----
  base_call_id := gen_random_uuid();
  INSERT INTO calls (id, customer_id, agent_name, call_status, call_duration_sec, started_at, ended_at, customer_intent, customer_sentiment, conversion_probability, dropoff_risk, converted, ai_assisted, ai_cost, summary, conversion_score, is_demo)
  VALUES (base_call_id, 'c0000001-0000-0000-0000-000000000005', 'Agent Rohit', 'failed', 240, now() - interval '3 days', now() - interval '3 days' + interval '4 minutes', 'not_interested', 'neutral', 0.10, 'high', false, false, 0.00, 'Customer said timing is not right. No KYC initiated. Follow-up scheduled for 2 weeks.', 0.10, false);

  INSERT INTO transcript_messages (call_id, speaker, message_text, timestamp_sec, sentiment) VALUES
  (base_call_id, 'agent', 'Hello Vikram, would you like to learn about Pay-in-3?', 0, 'neutral'),
  (base_call_id, 'customer', 'Maybe later. I am not planning to buy anything right now.', 15, 'neutral'),
  (base_call_id, 'ai', '[Objection Detected: Timing] Suggest scheduling follow-up.', 17, 'neutral'),
  (base_call_id, 'agent', 'No problem. Can I follow up in a couple of weeks?', 25, 'neutral'),
  (base_call_id, 'customer', 'Sure, that works.', 32, 'neutral');

  INSERT INTO objections (id, call_id, objection_type, objection_text, detected_at_sec, resolved, confidence_score)
  VALUES (gen_random_uuid(), base_call_id, 'timing', 'Maybe later. I am not planning to buy anything right now.', 15, false, 0.85);

  INSERT INTO follow_ups (id, call_id, customer_id, channel, message_body, scheduled_for, sent)
  VALUES (gen_random_uuid(), base_call_id, 'c0000001-0000-0000-0000-000000000005', 'call', 'Follow-up call with Vikram to check if he is ready to explore Pay-in-3.', now() + interval '14 days', false);

  -- ---- CALL 5: Successful, Anita Desai ----
  base_call_id := gen_random_uuid();
  INSERT INTO calls (id, customer_id, agent_name, call_status, call_duration_sec, started_at, ended_at, customer_intent, customer_sentiment, conversion_probability, dropoff_risk, converted, ai_assisted, ai_cost, summary, conversion_score, is_demo)
  VALUES (base_call_id, 'c0000001-0000-0000-0000-000000000006', 'Agent Priya', 'completed', 350, now() - interval '2 days', now() - interval '2 days' + interval '6 minutes', 'ready_to_onboard', 'positive', 0.97, 'low', true, true, 14.00, 'High-value customer, Rs. 45,000 purchase. KYC verified. No objections. Immediate conversion.', 0.97, false);

  INSERT INTO transcript_messages (call_id, speaker, message_text, timestamp_sec, sentiment) VALUES
  (base_call_id, 'agent', 'Hello Anita, I see you are interested in a Rs. 45,000 purchase with Pay-in-3.', 0, 'positive'),
  (base_call_id, 'customer', 'Yes, I want to split it into three payments.', 8, 'positive'),
  (base_call_id, 'agent', 'That would be Rs. 15,000 today, Rs. 15,000 after 30 days, and Rs. 15,000 after 60 days. Zero cost.', 15, 'positive'),
  (base_call_id, 'customer', 'Perfect. My KYC is already done. Let me proceed.', 25, 'positive'),
  (base_call_id, 'agent', 'Yes, you are all set. You can proceed to checkout now.', 30, 'positive');

  INSERT INTO crm_records (id, call_id, customer_id, update_type, previous_status, new_status, notes, approved, approved_by, applied_to_crm)
  VALUES (gen_random_uuid(), base_call_id, 'c0000001-0000-0000-0000-000000000006', 'status_change', 'existing_customer', 'repeat_purchase', 'High-value purchase of Rs. 45,000. No objections. KYC verified.', true, 'Agent Priya', true);

  -- ---- CALL 6: Escalated, fees objection, Karthik Iyer ----
  base_call_id := gen_random_uuid();
  INSERT INTO calls (id, customer_id, agent_name, call_status, call_duration_sec, started_at, ended_at, customer_intent, customer_sentiment, conversion_probability, dropoff_risk, converted, ai_assisted, ai_cost, summary, conversion_score, is_demo)
  VALUES (base_call_id, 'c0000001-0000-0000-0000-000000000007', 'Agent Rohit', 'escalated', 310, now() - interval '2 days', now() - interval '2 days' + interval '5 minutes', 'exploring', 'mixed', 0.40, 'medium', false, true, 13.50, 'Customer had multiple fee-related questions. Agent escalated to senior agent. Follow-up needed.', 0.40, false);

  INSERT INTO transcript_messages (call_id, speaker, message_text, timestamp_sec, sentiment) VALUES
  (base_call_id, 'agent', 'Hello Karthik, would you like to learn about Pay-in-3?', 0, 'neutral'),
  (base_call_id, 'customer', 'Are there any hidden fees? I have been charged by other services before.', 15, 'negative'),
  (base_call_id, 'ai', '[Objection Detected: Fees] Suggest confirming zero-cost with RBI compliance citation.', 17, 'neutral'),
  (base_call_id, 'agent', 'Pay-in-3 has zero interest, zero processing fee, and zero hidden charges. It is RBI-compliant.', 25, 'neutral'),
  (base_call_id, 'customer', 'What about late fees?', 35, 'neutral'),
  (base_call_id, 'ai', '[RAG Retrieved] Late fee is Rs. 100 per missed installment after 3-day grace period.', 37, 'neutral'),
  (base_call_id, 'agent', 'There is a 3-day grace period, then Rs. 100 per missed installment. No interest charges.', 42, 'neutral'),
  (base_call_id, 'customer', 'I need to think about it. Can I speak to someone senior?', 55, 'mixed'),
  (base_call_id, 'ai', '[Escalation Requested] Customer wants senior agent. Next Best Action: Escalate.', 57, 'neutral');

  INSERT INTO objections (id, call_id, objection_type, objection_text, detected_at_sec, resolved, resolution_approach, confidence_score)
  VALUES (gen_random_uuid(), base_call_id, 'fees', 'Are there any hidden fees?', 15, true, 'Confirmed zero-cost with RBI compliance citation and late fee policy', 0.90);

  INSERT INTO ai_recommendations (id, call_id, recommendation_type, title, suggested_response, confidence_score, knowledge_source, knowledge_version, agent_action, compliance_checked, compliance_passed)
  VALUES
  (gen_random_uuid(), base_call_id, 'objection_response', 'Confirm Zero Fees', 'Pay-in-3 has zero interest, zero processing fee, and zero hidden charges. RBI-compliant.', 0.92, 'Knowledge Base: Is Pay-in-3 really zero cost? v2.1', 'v2.1', 'used', true, true),
  (gen_random_uuid(), base_call_id, 'product_info', 'Explain Late Fee Policy', '3-day grace period, then Rs. 100 per missed installment. No interest. Auto-debit available.', 0.91, 'Knowledge Base: What happens if I miss a payment? v2.1', 'v2.1', 'used', true, true),
  (gen_random_uuid(), base_call_id, 'next_best_action', 'Escalate to Senior Agent', 'Customer requested senior agent. Initiate escalation.', 0.85, 'Knowledge Base: Compliance Guidelines v2.1', 'v2.1', 'used', true, true);

  -- ---- CALL 7: Successful, Deepika Nair ----
  base_call_id := gen_random_uuid();
  INSERT INTO calls (id, customer_id, agent_name, call_status, call_duration_sec, started_at, ended_at, customer_intent, customer_sentiment, conversion_probability, dropoff_risk, converted, ai_assisted, ai_cost, summary, conversion_score, is_demo)
  VALUES (base_call_id, 'c0000001-0000-0000-0000-000000000008', 'Agent Priya', 'completed', 320, now() - interval '1 day', now() - interval '1 day' + interval '5 minutes', 'ready_to_onboard', 'positive', 0.93, 'low', true, true, 14.50, 'Customer asked about prepayment. Explained no-penalty prepayment. Proceeded to checkout.', 0.93, false);

  INSERT INTO transcript_messages (call_id, speaker, message_text, timestamp_sec, sentiment) VALUES
  (base_call_id, 'agent', 'Hi Deepika, are you interested in Pay-in-3 for your Rs. 12,000 purchase?', 0, 'positive'),
  (base_call_id, 'customer', 'Yes, but can I prepay if I want to?', 12, 'neutral'),
  (base_call_id, 'ai', '[RAG Retrieved] Prepayment allowed at any time with no penalty.', 14, 'neutral'),
  (base_call_id, 'agent', 'Yes, you can prepay anytime with no penalty. Since there is no interest, prepaying just completes payment early.', 20, 'positive'),
  (base_call_id, 'customer', 'That is great. Let me proceed.', 30, 'positive');

  INSERT INTO ai_recommendations (id, call_id, recommendation_type, title, suggested_response, confidence_score, knowledge_source, knowledge_version, agent_action, compliance_checked, compliance_passed)
  VALUES (gen_random_uuid(), base_call_id, 'product_info', 'Prepayment Policy', 'Customers can prepay remaining installments at any time with no penalty.', 0.95, 'Knowledge Base: Can I prepay or close early? v2.1', 'v2.1', 'used', true, true);

  INSERT INTO crm_records (id, call_id, customer_id, update_type, previous_status, new_status, notes, approved, approved_by, applied_to_crm)
  VALUES (gen_random_uuid(), base_call_id, 'c0000001-0000-0000-0000-000000000008', 'status_change', 'existing_customer', 'repeat_purchase', 'Rs. 12,000 purchase. Prepayment question answered. KYC verified.', true, 'Agent Priya', true);

  -- ---- CALL 8: Failed, eligibility, Rohan Gupta ----
  base_call_id := gen_random_uuid();
  INSERT INTO calls (id, customer_id, agent_name, call_status, call_duration_sec, started_at, ended_at, customer_intent, customer_sentiment, conversion_probability, dropoff_risk, converted, ai_assisted, ai_cost, summary, conversion_score, is_demo)
  VALUES (base_call_id, 'c0000001-0000-0000-0000-000000000009', 'Agent Rohit', 'failed', 200, now() - interval '1 day', now() - interval '1 day' + interval '3 minutes', 'not_interested', 'negative', 0.05, 'high', false, true, 10.00, 'Customer KYC was previously rejected. Credit score below threshold. No conversion possible. Advised to improve credit score.', 0.05, false);

  INSERT INTO transcript_messages (call_id, speaker, message_text, timestamp_sec, sentiment) VALUES
  (base_call_id, 'agent', 'Hello Rohan, I am calling about Pay-in-3.', 0, 'neutral'),
  (base_call_id, 'customer', 'My KYC was rejected last time. What happened?', 12, 'negative'),
  (base_call_id, 'ai', '[RAG Retrieved] Eligibility requires credit score of 650+. Customer score: 620.', 14, 'neutral'),
  (base_call_id, 'agent', 'I see your credit score is 620, and the minimum required is 650. I recommend improving your score and reapplying.', 22, 'neutral'),
  (base_call_id, 'customer', 'Okay, I will work on that.', 35, 'neutral');

  INSERT INTO objections (id, call_id, objection_type, objection_text, detected_at_sec, resolved, resolution_approach, confidence_score)
  VALUES (gen_random_uuid(), base_call_id, 'eligibility', 'My KYC was rejected last time.', 12, true, 'Explained credit score requirement of 650+. Advised improving score.', 0.87);

  -- ---- CALL 9: Successful, Meera Joshi ----
  base_call_id := gen_random_uuid();
  INSERT INTO calls (id, customer_id, agent_name, call_status, call_duration_sec, started_at, ended_at, customer_intent, customer_sentiment, conversion_probability, dropoff_risk, converted, ai_assisted, ai_cost, summary, conversion_score, is_demo)
  VALUES (base_call_id, 'c0000001-0000-0000-0000-000000000010', 'Agent Priya', 'completed', 290, now() - interval '7 days', now() - interval '7 days' + interval '5 minutes', 'ready_to_onboard', 'positive', 0.96, 'low', true, true, 15.00, 'Rs. 30,000 purchase. Customer asked about product vs loan difference. Explained clearly. Smooth conversion.', 0.96, false);

  INSERT INTO transcript_messages (call_id, speaker, message_text, timestamp_sec, sentiment) VALUES
  (base_call_id, 'agent', 'Hi Meera, are you interested in Pay-in-3 for Rs. 30,000?', 0, 'positive'),
  (base_call_id, 'customer', 'Is this a loan? I do not want to take a loan.', 12, 'neutral'),
  (base_call_id, 'ai', '[RAG Retrieved] Pay-in-3 is a payment facility, NOT a loan. No interest, no credit bureau reporting for on-time payments.', 14, 'neutral'),
  (base_call_id, 'agent', 'Pay-in-3 is not a loan. It is a zero-cost payment facility. You pay exactly Rs. 30,000 in three parts. No interest.', 22, 'positive'),
  (base_call_id, 'customer', 'That sounds great. Let me proceed.', 35, 'positive');

  INSERT INTO objections (id, call_id, objection_type, objection_text, detected_at_sec, resolved, resolution_approach, confidence_score)
  VALUES (gen_random_uuid(), base_call_id, 'product_understanding', 'Is this a loan? I do not want to take a loan.', 12, true, 'Clarified Pay-in-3 is a payment facility, not a loan. No interest.', 0.93);

  INSERT INTO crm_records (id, call_id, customer_id, update_type, previous_status, new_status, notes, approved, approved_by, applied_to_crm)
  VALUES (gen_random_uuid(), base_call_id, 'c0000001-0000-0000-0000-000000000010', 'status_change', 'existing_customer', 'repeat_purchase', 'Rs. 30,000 purchase. Product vs loan clarified. KYC verified.', true, 'Agent Priya', true);

  -- ---- CALL 10: Successful, Sanjay Verma ----
  base_call_id := gen_random_uuid();
  INSERT INTO calls (id, customer_id, agent_name, call_status, call_duration_sec, started_at, ended_at, customer_intent, customer_sentiment, conversion_probability, dropoff_risk, converted, ai_assisted, ai_cost, summary, conversion_score, is_demo)
  VALUES (base_call_id, 'c0000001-0000-0000-0000-000000000011', 'Agent Rohit', 'completed', 360, now() - interval '6 days', now() - interval '6 days' + interval '6 minutes', 'ready_to_onboard', 'positive', 0.88, 'low', true, true, 14.50, 'New customer. KYC completed during call. Affordability concern addressed. Converted.', 0.88, false);

  INSERT INTO transcript_messages (call_id, speaker, message_text, timestamp_sec, sentiment) VALUES
  (base_call_id, 'agent', 'Hello Sanjay, would you like to learn about Pay-in-3?', 0, 'neutral'),
  (base_call_id, 'customer', 'Rs. 10,500 seems like a lot. Can I really split it for free?', 15, 'neutral'),
  (base_call_id, 'ai', '[Objection Detected: Affordability + Fees] Suggest explaining payment structure and confirming zero cost.', 17, 'neutral'),
  (base_call_id, 'agent', 'Yes! Rs. 3,500 today, Rs. 3,500 after 30 days, Rs. 3,500 after 60 days. Zero interest, zero fees.', 25, 'positive'),
  (base_call_id, 'customer', 'Okay, I need to do KYC right?', 40, 'neutral'),
  (base_call_id, 'agent', 'Yes, it takes about 5 minutes. PAN, Aadhaar OTP, bank verification, and a selfie.', 47, 'positive'),
  (base_call_id, 'customer', 'Alright, let me do it now.', 55, 'positive');

  INSERT INTO objections (id, call_id, objection_type, objection_text, detected_at_sec, resolved, resolution_approach, confidence_score)
  VALUES (gen_random_uuid(), base_call_id, 'affordability', 'Rs. 10,500 seems like a lot.', 15, true, 'Explained Rs. 3,500 x 3 payment structure with zero cost', 0.90);

  INSERT INTO crm_records (id, call_id, customer_id, update_type, previous_status, new_status, notes, approved, approved_by, applied_to_crm)
  VALUES (gen_random_uuid(), base_call_id, 'c0000001-0000-0000-0000-000000000011', 'kyc_initiated', 'lead', 'kyc_in_progress', 'New customer. KYC initiated during call. Rs. 10,500 purchase.', true, 'Agent Rohit', true);

  -- ---- CALL 11: Failed, trust, Aditya Bose ----
  base_call_id := gen_random_uuid();
  INSERT INTO calls (id, customer_id, agent_name, call_status, call_duration_sec, started_at, ended_at, customer_intent, customer_sentiment, conversion_probability, dropoff_risk, converted, ai_assisted, ai_cost, summary, conversion_score, is_demo)
  VALUES (base_call_id, 'c0000001-0000-0000-0000-000000000017', 'Agent Rohit', 'failed', 150, now() - interval '8 days', now() - interval '8 days' + interval '2 minutes', 'not_interested', 'negative', 0.08, 'high', false, false, 0.00, 'Customer hung up quickly citing trust concerns. No engagement.', 0.08, false);

  INSERT INTO transcript_messages (call_id, speaker, message_text, timestamp_sec, sentiment) VALUES
  (base_call_id, 'agent', 'Hello Aditya, I am calling about Pay-in-3.', 0, 'neutral'),
  (base_call_id, 'customer', 'I do not trust these things. Bye.', 10, 'negative');

  INSERT INTO objections (id, call_id, objection_type, objection_text, detected_at_sec, resolved, confidence_score)
  VALUES (gen_random_uuid(), base_call_id, 'trust', 'I do not trust these things.', 10, false, 0.92);

  -- ---- CALL 12: Successful, Lakshmi Menon ----
  base_call_id := gen_random_uuid();
  INSERT INTO calls (id, customer_id, agent_name, call_status, call_duration_sec, started_at, ended_at, customer_intent, customer_sentiment, conversion_probability, dropoff_risk, converted, ai_assisted, ai_cost, summary, conversion_score, is_demo)
  VALUES (base_call_id, 'c0000001-0000-0000-0000-000000000012', 'Agent Priya', 'completed', 280, now() - interval '9 days', now() - interval '9 days' + interval '5 minutes', 'ready_to_onboard', 'positive', 0.98, 'low', true, true, 13.00, 'High-value Rs. 48,000 purchase. No objections. Premium customer. Instant conversion.', 0.98, false);

  INSERT INTO transcript_messages (call_id, speaker, message_text, timestamp_sec, sentiment) VALUES
  (base_call_id, 'agent', 'Hello Lakshmi, I see you are interested in a Rs. 48,000 purchase with Pay-in-3.', 0, 'positive'),
  (base_call_id, 'customer', 'Yes, Rs. 16,000 three times. Zero cost. Let me proceed.', 10, 'positive'),
  (base_call_id, 'agent', 'Exactly right! Your KYC is already verified. You can proceed to checkout.', 18, 'positive');

  INSERT INTO crm_records (id, call_id, customer_id, update_type, previous_status, new_status, notes, approved, approved_by, applied_to_crm)
  VALUES (gen_random_uuid(), base_call_id, 'c0000001-0000-0000-0000-000000000012', 'status_change', 'existing_customer', 'repeat_purchase', 'High-value Rs. 48,000 purchase. No objections. KYC verified.', true, 'Agent Priya', true);

  -- ---- CALL 13: Dropped, Pooja Agarwal ----
  base_call_id := gen_random_uuid();
  INSERT INTO calls (id, customer_id, agent_name, call_status, call_duration_sec, started_at, ended_at, customer_intent, customer_sentiment, conversion_probability, dropoff_risk, converted, ai_assisted, ai_cost, summary, conversion_score, is_demo)
  VALUES (base_call_id, 'c0000001-0000-0000-0000-000000000014', 'Agent Rohit', 'dropped', 120, now() - interval '10 days', now() - interval '10 days' + interval '2 minutes', 'exploring', 'neutral', 0.25, 'high', false, true, 9.50, 'Customer got distracted by something and had to drop the call. Was initially interested. Follow-up needed.', 0.25, false);

  INSERT INTO transcript_messages (call_id, speaker, message_text, timestamp_sec, sentiment) VALUES
  (base_call_id, 'agent', 'Hi Pooja, would you like to learn about Pay-in-3?', 0, 'neutral'),
  (base_call_id, 'customer', 'Yes, actually I am interested. Can you tell me more?', 10, 'positive'),
  (base_call_id, 'customer', 'Oh sorry, I have to go. Can you call back later?', 40, 'neutral');

  INSERT INTO follow_ups (id, call_id, customer_id, channel, message_body, scheduled_for, sent)
  VALUES (gen_random_uuid(), base_call_id, 'c0000001-0000-0000-0000-000000000014', 'call', 'Follow-up call with Pooja who was initially interested but had to drop off.', now() + interval '3 days', false);

  -- ---- CALL 14: Successful, Farida Khan ----
  base_call_id := gen_random_uuid();
  INSERT INTO calls (id, customer_id, agent_name, call_status, call_duration_sec, started_at, ended_at, customer_intent, customer_sentiment, conversion_probability, dropoff_risk, converted, ai_assisted, ai_cost, summary, conversion_score, is_demo)
  VALUES (base_call_id, 'c0000001-0000-0000-0000-000000000016', 'Agent Priya', 'completed', 340, now() - interval '11 days', now() - interval '11 days' + interval '6 minutes', 'ready_to_onboard', 'positive', 0.91, 'low', true, true, 15.50, 'Customer compared Pay-in-3 with credit card EMI. AI provided comparison. Customer chose Pay-in-3.', 0.91, false);

  INSERT INTO transcript_messages (call_id, speaker, message_text, timestamp_sec, sentiment) VALUES
  (base_call_id, 'agent', 'Hi Farida, are you interested in Pay-in-3 for Rs. 14,000?', 0, 'neutral'),
  (base_call_id, 'customer', 'How is this different from my credit card EMI?', 12, 'neutral'),
  (base_call_id, 'ai', '[RAG Retrieved] Pay-in-3 has zero interest vs credit card EMI which charges 12-24% interest.', 14, 'neutral'),
  (base_call_id, 'agent', 'Credit card EMI charges 12-24% interest. Pay-in-3 charges zero interest. You save Rs. 1,680-3,360 on a Rs. 14,000 purchase.', 22, 'positive'),
  (base_call_id, 'customer', 'That is a big saving! Let me proceed.', 35, 'positive');

  INSERT INTO objections (id, call_id, objection_type, objection_text, detected_at_sec, resolved, resolution_approach, confidence_score)
  VALUES (gen_random_uuid(), base_call_id, 'comparison', 'How is this different from my credit card EMI?', 12, true, 'Compared zero-cost Pay-in-3 vs 12-24% credit card EMI interest', 0.89);

  INSERT INTO crm_records (id, call_id, customer_id, update_type, previous_status, new_status, notes, approved, approved_by, applied_to_crm)
  VALUES (gen_random_uuid(), base_call_id, 'c0000001-0000-0000-0000-000000000016', 'status_change', 'existing_customer', 'repeat_purchase', 'Rs. 14,000 purchase. Comparison with credit card EMI resolved. KYC verified.', true, 'Agent Priya', true);

  -- ---- CALL 15: Successful, Geetha Raj ----
  base_call_id := gen_random_uuid();
  INSERT INTO calls (id, customer_id, agent_name, call_status, call_duration_sec, started_at, ended_at, customer_intent, customer_sentiment, conversion_probability, dropoff_risk, converted, ai_assisted, ai_cost, summary, conversion_score, is_demo)
  VALUES (base_call_id, 'c0000001-0000-0000-0000-000000000018', 'Agent Priya', 'completed', 300, now() - interval '12 days', now() - interval '12 days' + interval '5 minutes', 'ready_to_onboard', 'positive', 0.94, 'low', true, true, 14.00, 'Rs. 36,000 purchase. Customer asked about missed payment policy. Satisfied with explanation. Converted.', 0.94, false);

  INSERT INTO transcript_messages (call_id, speaker, message_text, timestamp_sec, sentiment) VALUES
  (base_call_id, 'agent', 'Hi Geetha, interested in Pay-in-3 for Rs. 36,000?', 0, 'positive'),
  (base_call_id, 'customer', 'What happens if I miss a payment?', 12, 'neutral'),
  (base_call_id, 'ai', '[RAG Retrieved] 3-day grace period, Rs. 100 late fee per installment. No interest.', 14, 'neutral'),
  (base_call_id, 'agent', 'There is a 3-day grace period with no penalty, then Rs. 100 per missed installment. No interest. Auto-debit recommended.', 22, 'positive'),
  (base_call_id, 'customer', 'Okay, that is fair. Let me proceed.', 35, 'positive');

  INSERT INTO crm_records (id, call_id, customer_id, update_type, previous_status, new_status, notes, approved, approved_by, applied_to_crm)
  VALUES (gen_random_uuid(), base_call_id, 'c0000001-0000-0000-0000-000000000018', 'status_change', 'existing_customer', 'repeat_purchase', 'Rs. 36,000 purchase. Missed payment policy explained. KYC verified.', true, 'Agent Priya', true);

  -- ---- CALL 16: Failed, Manish Tiwari, KYC objection ----
  base_call_id := gen_random_uuid();
  INSERT INTO calls (id, customer_id, agent_name, call_status, call_duration_sec, started_at, ended_at, customer_intent, customer_sentiment, conversion_probability, dropoff_risk, converted, ai_assisted, ai_cost, summary, conversion_score, is_demo)
  VALUES (base_call_id, 'c0000001-0000-0000-0000-000000000019', 'Agent Rohit', 'failed', 220, now() - interval '13 days', now() - interval '13 days' + interval '4 minutes', 'exploring', 'mixed', 0.30, 'medium', false, true, 11.50, 'Customer was uncomfortable with KYC process. Needs follow-up with more reassurance about data security.', 0.30, false);

  INSERT INTO transcript_messages (call_id, speaker, message_text, timestamp_sec, sentiment) VALUES
  (base_call_id, 'agent', 'Hello Manish, would you like to learn about Pay-in-3?', 0, 'neutral'),
  (base_call_id, 'customer', 'I do not want to share my PAN and Aadhaar. That seems risky.', 15, 'negative'),
  (base_call_id, 'ai', '[Objection Detected: KYC] Suggest using approved KYC reassurance language.', 17, 'neutral'),
  (base_call_id, 'agent', 'I understand. KYC is required by RBI to protect you. Your data is encrypted and stored securely. It is a one-time 5-minute process.', 25, 'neutral'),
  (base_call_id, 'customer', 'I will think about it and get back to you.', 40, 'mixed');

  INSERT INTO objections (id, call_id, objection_type, objection_text, detected_at_sec, resolved, confidence_score)
  VALUES (gen_random_uuid(), base_call_id, 'kyc', 'I do not want to share my PAN and Aadhaar. That seems risky.', 15, false, 0.88);

  INSERT INTO follow_ups (id, call_id, customer_id, channel, message_body, scheduled_for, sent)
  VALUES (gen_random_uuid(), base_call_id, 'c0000001-0000-0000-0000-000000000019', 'email', 'Hi Manish, thank you for your time. I understand your concerns about KYC. I want to reassure you that KYC is mandated by RBI for your protection, and all data is encrypted per RBI guidelines. It is a one-time process that takes 5 minutes. Feel free to reach out when you are ready.', now() + interval '5 days', false);

  -- ---- CALL 17: Successful, Priya Patel ----
  base_call_id := gen_random_uuid();
  INSERT INTO calls (id, customer_id, agent_name, call_status, call_duration_sec, started_at, ended_at, customer_intent, customer_sentiment, conversion_probability, dropoff_risk, converted, ai_assisted, ai_cost, summary, conversion_score, is_demo)
  VALUES (base_call_id, 'c0000001-0000-0000-0000-000000000002', 'Agent Priya', 'completed', 260, now() - interval '14 days', now() - interval '14 days' + interval '4 minutes', 'ready_to_onboard', 'positive', 0.95, 'low', true, true, 13.50, 'Rs. 15,000 purchase. Customer asked about maximum limit. Explained Rs. 50,000 limit. Converted.', 0.95, false);

  INSERT INTO transcript_messages (call_id, speaker, message_text, timestamp_sec, sentiment) VALUES
  (base_call_id, 'agent', 'Hi Priya, are you interested in Pay-in-3 for Rs. 15,000?', 0, 'positive'),
  (base_call_id, 'customer', 'What is the maximum I can use Pay-in-3 for?', 12, 'neutral'),
  (base_call_id, 'ai', '[RAG Retrieved] Maximum purchase amount is Rs. 50,000. No minimum.', 14, 'neutral'),
  (base_call_id, 'agent', 'The maximum is Rs. 50,000 with no minimum purchase. Your Rs. 15,000 is well within the limit.', 22, 'positive'),
  (base_call_id, 'customer', 'Great, let me proceed.', 30, 'positive');

  INSERT INTO crm_records (id, call_id, customer_id, update_type, previous_status, new_status, notes, approved, approved_by, applied_to_crm)
  VALUES (gen_random_uuid(), base_call_id, 'c0000001-0000-0000-0000-000000000002', 'status_change', 'existing_customer', 'repeat_purchase', 'Rs. 15,000 purchase. Maximum limit question answered. KYC verified.', true, 'Agent Priya', true);

  -- ---- CALL 18: Dropped, Zara Sheikh ----
  base_call_id := gen_random_uuid();
  INSERT INTO calls (id, customer_id, agent_name, call_status, call_duration_sec, started_at, ended_at, customer_intent, customer_sentiment, conversion_probability, dropoff_risk, converted, ai_assisted, ai_cost, summary, conversion_score, is_demo)
  VALUES (base_call_id, 'c0000001-0000-0000-0000-000000000020', 'Agent Rohit', 'dropped', 95, now() - interval '15 days', now() - interval '15 days' + interval '2 minutes', 'exploring', 'neutral', 0.20, 'high', false, true, 8.00, 'Call dropped due to network issue. Customer was initially receptive. Follow-up needed.', 0.20, false);

  INSERT INTO follow_ups (id, call_id, customer_id, channel, message_body, scheduled_for, sent)
  VALUES (gen_random_uuid(), base_call_id, 'c0000001-0000-0000-0000-000000000020', 'sms', 'Hi Zara, sorry about the network issue during our call. Please let us know a convenient time to discuss Pay-in-3. Reply STOP to opt out.', now() + interval '1 day', true);

  -- ---- CALL 19: Successful, Naveen Rao ----
  base_call_id := gen_random_uuid();
  INSERT INTO calls (id, customer_id, agent_name, call_status, call_duration_sec, started_at, ended_at, customer_intent, customer_sentiment, conversion_probability, dropoff_risk, converted, ai_assisted, ai_cost, summary, conversion_score, is_demo)
  VALUES (base_call_id, 'c0000001-0000-0000-0000-000000000015', 'Agent Priya', 'completed', 410, now() - interval '16 days', now() - interval '16 days' + interval '7 minutes', 'ready_to_onboard', 'positive', 0.89, 'low', true, true, 16.00, 'New customer. Multiple questions about eligibility and KYC. All answered with AI assistance. KYC initiated.', 0.89, false);

  INSERT INTO transcript_messages (call_id, speaker, message_text, timestamp_sec, sentiment) VALUES
  (base_call_id, 'agent', 'Hello Naveen, would you like to learn about Pay-in-3?', 0, 'neutral'),
  (base_call_id, 'customer', 'Am I eligible? My income is Rs. 40,000.', 15, 'neutral'),
  (base_call_id, 'ai', '[RAG Retrieved] Minimum income: Rs. 15,000. Customer qualifies.', 17, 'neutral'),
  (base_call_id, 'agent', 'Yes, the minimum income requirement is Rs. 15,000 per month. You are eligible.', 25, 'positive'),
  (base_call_id, 'customer', 'What about KYC? Is it complicated?', 40, 'neutral'),
  (base_call_id, 'ai', '[RAG Retrieved] KYC takes 5 minutes: PAN, Aadhaar OTP, bank verification, selfie.', 42, 'neutral'),
  (base_call_id, 'agent', 'KYC takes about 5 minutes. PAN, Aadhaar OTP, bank verification, and a selfie. One-time only.', 50, 'positive'),
  (base_call_id, 'customer', 'Okay, let me start the KYC.', 65, 'positive');

  INSERT INTO crm_records (id, call_id, customer_id, update_type, previous_status, new_status, notes, approved, approved_by, applied_to_crm)
  VALUES (gen_random_uuid(), base_call_id, 'c0000001-0000-0000-0000-000000000015', 'kyc_initiated', 'lead', 'kyc_in_progress', 'New customer. Eligibility confirmed. KYC initiated. Rs. 9,000 purchase.', true, 'Agent Priya', true);

  -- ---- CALL 20: Failed, Arjun Mehta, eligibility ----
  base_call_id := gen_random_uuid();
  INSERT INTO calls (id, customer_id, agent_name, call_status, call_duration_sec, started_at, ended_at, customer_intent, customer_sentiment, conversion_probability, dropoff_risk, converted, ai_assisted, ai_cost, summary, conversion_score, is_demo)
  VALUES (base_call_id, 'c0000001-0000-0000-0000-000000000013', 'Agent Rohit', 'failed', 180, now() - interval '17 days', now() - interval '17 days' + interval '3 minutes', 'not_interested', 'negative', 0.12, 'high', false, true, 10.50, 'Customer income below eligibility threshold. Explained requirements. Advised to reapply when income meets criteria.', 0.12, false);

  INSERT INTO transcript_messages (call_id, speaker, message_text, timestamp_sec, sentiment) VALUES
  (base_call_id, 'agent', 'Hello Arjun, would you like to learn about Pay-in-3?', 0, 'neutral'),
  (base_call_id, 'customer', 'My income is Rs. 22,000. Can I use Pay-in-3?', 15, 'neutral'),
  (base_call_id, 'ai', '[RAG Retrieved] Minimum income: Rs. 15,000. Customer qualifies. Credit score 645 — below 650 threshold.', 17, 'neutral'),
  (base_call_id, 'agent', 'Your income qualifies, but your credit score needs to be 650 or above. It is currently 645, just 5 points short.', 25, 'neutral'),
  (base_call_id, 'customer', 'Oh, that is disappointing. I will work on it.', 40, 'negative');

  INSERT INTO objections (id, call_id, objection_type, objection_text, detected_at_sec, resolved, resolution_approach, confidence_score)
  VALUES (gen_random_uuid(), base_call_id, 'eligibility', 'My income is Rs. 22,000. Can I use Pay-in-3?', 15, true, 'Income qualifies but credit score 645 < 650 minimum. Advised to improve score.', 0.86);

  -- ---- CALL 21: Successful, Rahul Sharma, repeat ----
  base_call_id := gen_random_uuid();
  INSERT INTO calls (id, customer_id, agent_name, call_status, call_duration_sec, started_at, ended_at, customer_intent, customer_sentiment, conversion_probability, dropoff_risk, converted, ai_assisted, ai_cost, summary, conversion_score, is_demo)
  VALUES (base_call_id, 'c0000001-0000-0000-0000-000000000001', 'Agent Priya', 'completed', 240, now() - interval '20 days', now() - interval '20 days' + interval '4 minutes', 'ready_to_onboard', 'positive', 0.93, 'low', true, true, 12.50, 'Repeat customer. Rs. 7,500 purchase. No objections. Quick conversion.', 0.93, false);
  INSERT INTO crm_records (id, call_id, customer_id, update_type, previous_status, new_status, notes, approved, approved_by, applied_to_crm)
  VALUES (gen_random_uuid(), base_call_id, 'c0000001-0000-0000-0000-000000000001', 'status_change', 'existing_customer', 'repeat_purchase', 'Repeat Rs. 7,500. No objections.', true, 'Agent Priya', true);

  -- ---- CALL 22: Failed, Vikram Singh, timing again ----
  base_call_id := gen_random_uuid();
  INSERT INTO calls (id, customer_id, agent_name, call_status, call_duration_sec, started_at, ended_at, customer_intent, customer_sentiment, conversion_probability, dropoff_risk, converted, ai_assisted, ai_cost, summary, conversion_score, is_demo)
  VALUES (base_call_id, 'c0000001-0000-0000-0000-000000000005', 'Agent Rohit', 'failed', 160, now() - interval '21 days', now() - interval '21 days' + interval '3 minutes', 'not_interested', 'neutral', 0.08, 'high', false, false, 0.00, 'Still not ready. Timing objection persists.', 0.08, false);
  INSERT INTO objections (id, call_id, objection_type, objection_text, detected_at_sec, resolved, confidence_score)
  VALUES (gen_random_uuid(), base_call_id, 'timing', 'Still not planning to buy anything soon.', 15, false, 0.84);

  -- ---- CALL 23: Successful, Anita Desai, repeat ----
  base_call_id := gen_random_uuid();
  INSERT INTO calls (id, customer_id, agent_name, call_status, call_duration_sec, started_at, ended_at, customer_intent, customer_sentiment, conversion_probability, dropoff_risk, converted, ai_assisted, ai_cost, summary, conversion_score, is_demo)
  VALUES (base_call_id, 'c0000001-0000-0000-0000-000000000006', 'Agent Priya', 'completed', 200, now() - interval '22 days', now() - interval '22 days' + interval '3 minutes', 'ready_to_onboard', 'positive', 0.97, 'low', true, true, 11.00, 'Repeat customer. Rs. 22,000 purchase. Quick conversion.', 0.97, false);
  INSERT INTO crm_records (id, call_id, customer_id, update_type, previous_status, new_status, notes, approved, approved_by, applied_to_crm)
  VALUES (gen_random_uuid(), base_call_id, 'c0000001-0000-0000-0000-000000000006', 'status_change', 'existing_customer', 'repeat_purchase', 'Repeat Rs. 22,000.', true, 'Agent Priya', true);

  -- ---- CALL 24: Escalated, Karthik Iyer, still hesitant ----
  base_call_id := gen_random_uuid();
  INSERT INTO calls (id, customer_id, agent_name, call_status, call_duration_sec, started_at, ended_at, customer_intent, customer_sentiment, conversion_probability, dropoff_risk, converted, ai_assisted, ai_cost, summary, conversion_score, is_demo)
  VALUES (base_call_id, 'c0000001-0000-0000-0000-000000000007', 'Agent Rohit', 'escalated', 280, now() - interval '23 days', now() - interval '23 days' + interval '5 minutes', 'exploring', 'mixed', 0.35, 'medium', false, true, 12.50, 'Still hesitant about fees. Escalated to senior agent for detailed explanation.', 0.35, false);
  INSERT INTO objections (id, call_id, objection_type, objection_text, detected_at_sec, resolved, confidence_score)
  VALUES (gen_random_uuid(), base_call_id, 'fees', 'Still not sure about hidden charges.', 20, false, 0.87);

  -- ---- CALL 25: Successful, Pooja Agarwal, follow-up worked ----
  base_call_id := gen_random_uuid();
  INSERT INTO calls (id, customer_id, agent_name, call_status, call_duration_sec, started_at, ended_at, customer_intent, customer_sentiment, conversion_probability, dropoff_risk, converted, ai_assisted, ai_cost, summary, conversion_score, is_demo)
  VALUES (base_call_id, 'c0000001-0000-0000-0000-000000000014', 'Agent Priya', 'completed', 350, now() - interval '24 days', now() - interval '24 days' + interval '6 minutes', 'ready_to_onboard', 'positive', 0.90, 'low', true, true, 15.00, 'Follow-up call successful. Customer was initially dropped but converted on second attempt. Rs. 18,000 purchase.', 0.90, false);
  INSERT INTO transcript_messages (call_id, speaker, message_text, timestamp_sec, sentiment) VALUES
  (base_call_id, 'agent', 'Hi Pooja, following up from our last call. Still interested in Pay-in-3?', 0, 'neutral'),
  (base_call_id, 'customer', 'Yes, I looked it up. I want to proceed with Rs. 18,000.', 12, 'positive'),
  (base_call_id, 'agent', 'Great! Rs. 6,000 today, Rs. 6,000 after 30 days, Rs. 6,000 after 60 days. Zero cost.', 20, 'positive'),
  (base_call_id, 'customer', 'Perfect. My KYC is verified. Let me proceed.', 30, 'positive');
  INSERT INTO crm_records (id, call_id, customer_id, update_type, previous_status, new_status, notes, approved, approved_by, applied_to_crm)
  VALUES (gen_random_uuid(), base_call_id, 'c0000001-0000-0000-0000-000000000014', 'status_change', 'lead', 'converted', 'Follow-up converted. Rs. 18,000 purchase. KYC verified.', true, 'Agent Priya', true);

  -- ---- CALL 26: Failed, Naveen Rao, KYC incomplete ----
  base_call_id := gen_random_uuid();
  INSERT INTO calls (id, customer_id, agent_name, call_status, call_duration_sec, started_at, ended_at, customer_intent, customer_sentiment, conversion_probability, dropoff_risk, converted, ai_assisted, ai_cost, summary, conversion_score, is_demo)
  VALUES (base_call_id, 'c0000001-0000-0000-0000-000000000015', 'Agent Rohit', 'failed', 190, now() - interval '25 days', now() - interval '25 days' + interval '3 minutes', 'exploring', 'neutral', 0.35, 'medium', false, true, 10.00, 'Customer started KYC but did not complete. Bank verification failed. Follow-up needed.', 0.35, false);
  INSERT INTO follow_ups (id, call_id, customer_id, channel, message_body, scheduled_for, sent)
  VALUES (gen_random_uuid(), base_call_id, 'c0000001-0000-0000-0000-000000000015', 'whatsapp', 'Hi Naveen, your KYC bank verification step was incomplete. Please retry with a valid bank account. It takes just 2 minutes.', now() + interval '2 days', true);

  -- ---- CALL 27: Successful, Meera Joshi, repeat ----
  base_call_id := gen_random_uuid();
  INSERT INTO calls (id, customer_id, agent_name, call_status, call_duration_sec, started_at, ended_at, customer_intent, customer_sentiment, conversion_probability, dropoff_risk, converted, ai_assisted, ai_cost, summary, conversion_score, is_demo)
  VALUES (base_call_id, 'c0000001-0000-0000-0000-000000000010', 'Agent Priya', 'completed', 220, now() - interval '26 days', now() - interval '26 days' + interval '4 minutes', 'ready_to_onboard', 'positive', 0.96, 'low', true, true, 12.00, 'Repeat customer. Rs. 25,000 purchase. Quick conversion.', 0.96, false);
  INSERT INTO crm_records (id, call_id, customer_id, update_type, previous_status, new_status, notes, approved, approved_by, applied_to_crm)
  VALUES (gen_random_uuid(), base_call_id, 'c0000001-0000-0000-0000-000000000010', 'status_change', 'existing_customer', 'repeat_purchase', 'Repeat Rs. 25,000.', true, 'Agent Priya', true);

  -- ---- CALL 28: Dropped, Zara Sheikh, second attempt ----
  base_call_id := gen_random_uuid();
  INSERT INTO calls (id, customer_id, agent_name, call_status, call_duration_sec, started_at, ended_at, customer_intent, customer_sentiment, conversion_probability, dropoff_risk, converted, ai_assisted, ai_cost, summary, conversion_score, is_demo)
  VALUES (base_call_id, 'c0000001-0000-0000-0000-000000000020', 'Agent Rohit', 'dropped', 140, now() - interval '27 days', now() - interval '27 days' + interval '2 minutes', 'exploring', 'neutral', 0.30, 'high', false, true, 9.00, 'Customer was interested but said she was busy. Third follow-up needed.', 0.30, false);
  INSERT INTO follow_ups (id, call_id, customer_id, channel, message_body, scheduled_for, sent)
  VALUES (gen_random_uuid(), base_call_id, 'c0000001-0000-0000-0000-000000000020', 'call', 'Third follow-up with Zara. She was interested but busy on previous calls.', now() + interval '5 days', false);

  -- ---- CALL 29: Successful, Deepika Nair, repeat ----
  base_call_id := gen_random_uuid();
  INSERT INTO calls (id, customer_id, agent_name, call_status, call_duration_sec, started_at, ended_at, customer_intent, customer_sentiment, conversion_probability, dropoff_risk, converted, ai_assisted, ai_cost, summary, conversion_score, is_demo)
  VALUES (base_call_id, 'c0000001-0000-0000-0000-000000000008', 'Agent Priya', 'completed', 210, now() - interval '28 days', now() - interval '28 days' + interval '4 minutes', 'ready_to_onboard', 'positive', 0.94, 'low', true, true, 11.50, 'Repeat customer. Rs. 10,000 purchase. Quick conversion.', 0.94, false);
  INSERT INTO crm_records (id, call_id, customer_id, update_type, previous_status, new_status, notes, approved, approved_by, applied_to_crm)
  VALUES (gen_random_uuid(), base_call_id, 'c0000001-0000-0000-0000-000000000008', 'status_change', 'existing_customer', 'repeat_purchase', 'Repeat Rs. 10,000.', true, 'Agent Priya', true);

  -- ---- CALL 30: Successful, Sanjay Verma, repeat ----
  base_call_id := gen_random_uuid();
  INSERT INTO calls (id, customer_id, agent_name, call_status, call_duration_sec, started_at, ended_at, customer_intent, customer_sentiment, conversion_probability, dropoff_risk, converted, ai_assisted, ai_cost, summary, conversion_score, is_demo)
  VALUES (base_call_id, 'c0000001-0000-0000-0000-000000000011', 'Agent Rohit', 'completed', 230, now() - interval '30 days', now() - interval '30 days' + interval '4 minutes', 'ready_to_onboard', 'positive', 0.91, 'low', true, true, 12.00, 'Customer completed KYC and made first purchase. Rs. 10,500. Successful conversion.', 0.91, false);
  INSERT INTO crm_records (id, call_id, customer_id, update_type, previous_status, new_status, notes, approved, approved_by, applied_to_crm)
  VALUES (gen_random_uuid(), base_call_id, 'c0000001-0000-0000-0000-000000000011', 'status_change', 'kyc_in_progress', 'converted', 'KYC completed. First purchase Rs. 10,500.', true, 'Agent Rohit', true);

  -- Audit logs for sample calls
  INSERT INTO audit_logs (event_type, entity_type, actor, details, pii_masked) VALUES
  ('consent_given', 'call', 'Agent Priya', jsonb_build_object('consent', true, 'recording', true, 'ai_assistance', true), true),
  ('compliance_check', 'recommendation', 'system', jsonb_build_object('check_type', 'prohibited_claims', 'result', 'passed'), true),
  ('crm_update_approved', 'crm_record', 'Agent Priya', jsonb_build_object('update_type', 'kyc_initiated', 'auto_apply', false), true);
END $$;
