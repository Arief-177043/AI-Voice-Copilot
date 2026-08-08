/*
# Seed: Knowledge Base for Pay-in-3 Zero-Cost EMI

Populates the knowledge_base table with approved product information used by the RAG agent.
All entries have version v2.1 and effective date 2025-01-15.
*/

INSERT INTO knowledge_base (category, title, content, keywords, version, effective_date) VALUES
('product_info', 'Pay-in-3 Overview',
'Pay-in-3 is a zero-cost EMI product that allows customers to split any purchase into 3 equal payments with no interest, no processing fee, and no hidden charges. The first payment is made at checkout and the remaining two are auto-debited 30 and 60 days later. There is no cost to the customer beyond the purchase price itself.',
ARRAY['pay in 3', 'zero cost', 'emi', 'installment', 'split', 'no interest', 'no fee'], 'v2.1', '2025-01-15'),

('pricing', 'Pay-in-3 Payment Structure',
'Pay-in-3 divides the total purchase amount into 3 equal installments. Example: For a Rs. 9,000 purchase, the customer pays Rs. 3,000 at checkout, Rs. 3,000 after 30 days, and Rs. 3,000 after 60 days. Total amount paid = Rs. 9,000 (the original price). Zero interest. Zero processing fee. Zero hidden charges. The merchant absorbs the cost, not the customer.',
ARRAY['payment structure', 'installment', '9000', '3000', 'checkout', '30 days', '60 days', 'split amount'], 'v2.1', '2025-01-15'),

('eligibility', 'Pay-in-3 Eligibility Criteria',
'To be eligible for Pay-in-3, a customer must: (1) Be at least 18 years of age. (2) Be an Indian resident with a valid PAN card. (3) Have a monthly income of at least Rs. 15,000. (4) Have a bank account with auto-debit enabled. (5) Complete KYC verification. (6) Have a credit score of 650 or above. There is no minimum purchase amount, and the maximum purchase amount is Rs. 50,000.',
ARRAY['eligibility', 'criteria', 'age', 'pan', 'income', '15000', 'bank account', 'credit score', '650', 'kyc', 'maximum', '50000'], 'v2.1', '2025-01-15'),

('kyc', 'KYC Process for Pay-in-3',
'KYC (Know Your Customer) is a one-time verification required before using Pay-in-3. The process takes approximately 5 minutes and involves: (1) PAN card verification. (2) Aadhaar-based identity verification via OTP. (3) Bank account verification via penny drop (a Rs. 1 credit confirms account ownership). (4) Selfie verification for facial match. Once KYC is complete, the customer can use Pay-in-3 for all future purchases without repeating verification. KYC data is encrypted and stored per RBI guidelines.',
ARRAY['kyc', 'verification', 'pan', 'aadhaar', 'otp', 'bank', 'penny drop', 'selfie', '5 minutes', 'rbi', 'identity'], 'v2.1', '2025-01-15'),

('faq', 'Is Pay-in-3 really zero cost?',
'Yes. Pay-in-3 is genuinely zero cost to the customer. There is no interest, no processing fee, and no hidden charges. The customer pays exactly the purchase price, split into 3 installments. The merchant pays a small fee to offer this facility. This is verified and compliant with RBI guidelines on zero-cost EMI. If a customer is charged anything beyond the purchase price, they should report it immediately.',
ARRAY['zero cost', 'really', 'no interest', 'no fee', 'hidden charges', 'rbi', 'verified'], 'v2.1', '2025-01-15'),

('faq', 'What happens if I miss a payment?',
'If a payment is missed, there is a 3-day grace period with no penalty. After the grace period, a late fee of Rs. 100 per missed installment applies. The account is reported to credit bureaus after 30 days of non-payment. Pay-in-3 does not charge interest — only a flat late fee. Customers can set up auto-debit to avoid missed payments. If financial difficulty arises, customers should contact support before the due date.',
ARRAY['missed payment', 'late fee', 'grace period', '100', 'penalty', 'auto debit', 'credit bureau', 'non payment'], 'v2.1', '2025-01-15'),

('faq', 'Do I need KYC for every purchase?',
'No. KYC is a one-time process. Once verified, the customer can use Pay-in-3 for all future purchases without repeating KYC. The verification status remains valid for 2 years, after which a refresh may be required per regulatory guidelines.',
ARRAY['kyc', 'every purchase', 'one time', '2 years', 'repeat', 'refresh'], 'v2.1', '2025-01-15'),

('faq', 'What is the maximum purchase amount?',
'The maximum purchase amount for Pay-in-3 is Rs. 50,000. There is no minimum purchase amount. The limit may be increased for customers with a strong repayment history and credit score above 750.',
ARRAY['maximum', '50000', 'limit', 'minimum', 'credit score', '750'], 'v2.1', '2025-01-15'),

('approved_language', 'Approved Sales Language - Affordability Objection',
'When a customer says the price is too high, use: "I understand that Rs. [amount] can feel like a significant amount. With Pay-in-3, you only pay Rs. [amount/3] today, and the remaining two payments are spread over 60 days at no extra cost. There is zero interest and zero processing fee — you pay exactly Rs. [amount], just in three easy parts. Would you like to see how the payments would work for your purchase?"',
ARRAY['affordability', 'objection', 'too expensive', 'too high', 'price', 'sales language', 'approved'], 'v2.1', '2025-01-15'),

('approved_language', 'Approved Sales Language - Trust Objection',
'When a customer expresses trust concerns, use: "I completely understand your concern. Pay-in-3 is a regulated product compliant with RBI guidelines. Your data is encrypted and stored per RBI standards. We use bank-grade security for all transactions, and there are no hidden charges — what you see is what you pay. Over 500,000 customers have used Pay-in-3 with a 97% satisfaction rate."',
ARRAY['trust', 'concern', 'rbi', 'security', 'regulated', 'encrypted', 'satisfaction', 'sales language'], 'v2.1', '2025-01-15'),

('approved_language', 'Approved Sales Language - KYC Objection',
'When a customer is reluctant about KYC, use: "I understand sharing personal information can feel like a hassle. KYC is a one-time process that takes about 5 minutes, and it is required by RBI regulations to protect you. Once done, you never have to repeat it for future Pay-in-3 purchases. Your data is encrypted and stored securely per RBI guidelines. Shall I walk you through the steps?"',
ARRAY['kyc', 'reluctant', 'hassle', 'one time', '5 minutes', 'rbi', 'sales language'], 'v2.1', '2025-01-15'),

('prohibited_claims', 'Prohibited Claims and Compliance Rules',
'The following claims are PROHIBITED and must never be made by agents: (1) "Pay-in-3 is a loan" — it is NOT a loan, it is a payment facility. (2) "Guaranteed approval" — approval depends on eligibility and KYC. (3) "No credit check required" — credit score is checked. (4) "Your credit score will not be affected" — missed payments are reported to credit bureaus. (5) Any claim about specific returns, rewards, or cashback not in official documentation. (6) Any promise of credit limit increases. (7) "You will definitely be approved" — approval is never guaranteed. Violation of these rules may result in regulatory action.',
ARRAY['prohibited', 'claims', 'compliance', 'loan', 'guaranteed', 'approval', 'credit check', 'forbidden', 'not allowed', 'rules'], 'v2.1', '2025-01-15'),

('compliance', 'Compliance Guidelines for AI Recommendations',
'All AI-generated responses must: (1) Be grounded in the approved knowledge base — never invent product terms. (2) Include a confidence score. (3) Cite the knowledge source and version. (4) Be checked against prohibited claims before display. (5) Never make credit or loan decisions. (6) Require human approval for sensitive financial actions. (7) Mask all PII in transcripts and logs. (8) Log all AI recommendations and agent actions to the audit log. Responses that fail compliance checks must be flagged and not shown to the agent.',
ARRAY['compliance', 'guidelines', 'ai', 'grounded', 'confidence', 'citation', 'prohibited', 'pii', 'audit', 'human approval'], 'v2.1', '2025-01-15'),

('faq', 'How is Pay-in-3 different from a loan?',
'Pay-in-3 is a payment facility, NOT a loan. There is no interest charged, no EMI tenure beyond 60 days, and no credit bureau reporting for on-time payments. A loan involves interest, longer tenure, and credit reporting. Pay-in-3 is a zero-cost payment splitting service where the merchant subsidizes the cost. The customer pays exactly the purchase price divided into 3 parts.',
ARRAY['difference', 'loan', 'payment facility', 'not a loan', 'interest', 'tenure', 'credit bureau'], 'v2.1', '2025-01-15'),

('faq', 'Can I prepay or close early?',
'Yes. Customers can prepay remaining installments at any time with no penalty or prepayment charge. Since there is no interest, prepaying does not save money — it simply completes the payment early. To prepay, go to the Pay-in-3 dashboard and select "Pay Now" on any upcoming installment.',
ARRAY['prepay', 'prepayment', 'early', 'close', 'no penalty', 'pay now'], 'v2.1', '2025-01-15')
ON CONFLICT DO NOTHING;
