import type { AIAnalysis } from './types';

export interface DemoStep {
  speaker: 'agent' | 'customer';
  text: string;
  timestampSec: number;
}

export const demoScript: DemoStep[] = [
  { speaker: 'agent', text: 'Hello, thank you for your interest in Pay-in-3. I am here to help you with your purchase. Do you have a moment to talk?', timestampSec: 0 },
  { speaker: 'customer', text: "I'm interested, but Rs. 9,000 is expensive.", timestampSec: 8 },
  { speaker: 'customer', text: 'Is it really zero cost?', timestampSec: 22 },
  { speaker: 'customer', text: 'Do I need KYC?', timestampSec: 38 },
  { speaker: 'customer', text: 'Okay, I want to proceed.', timestampSec: 52 },
];

export const demoAnalyses: Record<number, AIAnalysis> = {
  1: {
    intent: 'evaluating', sentiment: 'negative', conversionProbability: 0.38, dropoffRisk: 'medium',
    objectionType: 'affordability', objectionText: "I'm interested, but Rs. 9,000 is expensive.",
    nextBestAction: 'Explain Pay-in-3 Payment Structure',
    suggestedResponse: 'I understand that Rs. 9,000 can feel like a significant amount. With Pay-in-3, you pay only Rs. 3,000 today, and the remaining two payments of Rs. 3,000 each are spread over 60 days at no extra cost. There is zero interest and zero processing fee — you pay exactly Rs. 9,000, just in three easy parts.',
    confidenceScore: 0.94,
    ragSource: { title: 'Pay-in-3 Payment Structure', content: 'Pay-in-3 divides the total purchase amount into 3 equal installments. For a Rs. 9,000 purchase, the customer pays Rs. 3,000 at checkout, Rs. 3,000 after 30 days, and Rs. 3,000 after 60 days. Zero interest. Zero processing fee.', source: 'Knowledge Base: Pay-in-3 Payment Structure', version: 'v2.1', score: 15, category: 'pricing' },
    compliancePassed: true, complianceNotes: 'Compliance check passed. Response is grounded in approved knowledge base.',
  },
  2: {
    intent: 'evaluating', sentiment: 'neutral', conversionProbability: 0.45, dropoffRisk: 'medium',
    objectionType: 'fees', objectionText: 'Is it really zero cost?',
    nextBestAction: 'Confirm Zero Cost with RBI Citation',
    suggestedResponse: 'Yes, Pay-in-3 is genuinely zero cost to the customer. There is no interest, no processing fee, and no hidden charges. The customer pays exactly the purchase price, split into 3 installments. The merchant pays a small fee to offer this facility. This is verified and compliant with RBI guidelines on zero-cost EMI.',
    confidenceScore: 0.96,
    ragSource: { title: 'Is Pay-in-3 really zero cost?', content: 'Yes. Pay-in-3 is genuinely zero cost to the customer. No interest, no processing fee, no hidden charges. The customer pays exactly the purchase price, split into 3 installments. This is verified and compliant with RBI guidelines.', source: 'Knowledge Base: Is Pay-in-3 really zero cost?', version: 'v2.1', score: 18, category: 'faq' },
    compliancePassed: true, complianceNotes: 'Compliance check passed. Response is grounded in approved knowledge base.',
  },
  3: {
    intent: 'evaluating', sentiment: 'neutral', conversionProbability: 0.55, dropoffRisk: 'low',
    objectionType: 'kyc', objectionText: 'Do I need KYC?',
    nextBestAction: 'Reassure About KYC Process',
    suggestedResponse: 'KYC is a one-time verification required before using Pay-in-3. The process takes approximately 5 minutes and involves: PAN card verification, Aadhaar-based identity verification via OTP, bank account verification via penny drop, and selfie verification. Once complete, you can use Pay-in-3 for all future purchases without repeating verification.',
    confidenceScore: 0.93,
    ragSource: { title: 'KYC Process for Pay-in-3', content: 'KYC is a one-time verification that takes approximately 5 minutes: PAN card verification, Aadhaar OTP, bank account verification, selfie verification. Once complete, no repeat needed.', source: 'Knowledge Base: KYC Process for Pay-in-3', version: 'v2.1', score: 16, category: 'kyc' },
    compliancePassed: true, complianceNotes: 'Compliance check passed. Response is grounded in approved knowledge base.',
  },
  4: {
    intent: 'ready_to_onboard', sentiment: 'positive', conversionProbability: 0.92, dropoffRisk: 'low',
    objectionType: null, objectionText: null,
    nextBestAction: 'Start KYC Process',
    suggestedResponse: 'Great! Let us get your KYC done. It is a one-time process that takes about 5 minutes. I will need your PAN card, Aadhaar for OTP verification, bank account details, and a quick selfie. Shall we begin?',
    confidenceScore: 0.91,
    ragSource: { title: 'KYC Process for Pay-in-3', content: 'KYC is a one-time verification that takes approximately 5 minutes. Once complete, the customer can use Pay-in-3 for all future purchases without repeating verification.', source: 'Knowledge Base: KYC Process for Pay-in-3', version: 'v2.1', score: 14, category: 'kyc' },
    compliancePassed: true, complianceNotes: 'Compliance check passed. Customer is ready to onboard. Human approval required for KYC initiation.',
  },
};
