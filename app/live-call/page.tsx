'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  PhoneCall, PhoneOff, Mic, Bot, ShieldCheck, AlertTriangle,
  TrendingUp, Frown, Meh, Smile, CheckCircle2, BookOpen,
  ArrowRight, User, Zap, FileText, Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { demoScript, demoAnalyses } from '@/lib/demo-script';
import { calculatePayIn3, generateCallSummary, generateFollowUpMessage } from '@/lib/ai-engine';
import {
  createCall, updateCall, addTranscriptMessage, addRecommendation,
  addObjection, addCRMRecord, addFollowUp, logAuditEvent,
} from '@/lib/queries';
import { supabase } from '@/lib/supabase';
import type { AIAnalysis, Sentiment, DropoffRisk } from '@/lib/types';

interface TranscriptEntry {
  speaker: 'agent' | 'customer' | 'ai';
  text: string;
  timestamp: number;
  analysis?: AIAnalysis;
}

const sentimentConfig: Record<Sentiment, { icon: typeof Smile; color: string; bg: string }> = {
  positive: { icon: Smile, color: 'text-success', bg: 'bg-success/10' },
  neutral: { icon: Meh, color: 'text-muted-foreground', bg: 'bg-secondary' },
  negative: { icon: Frown, color: 'text-destructive', bg: 'bg-destructive/10' },
  mixed: { icon: Meh, color: 'text-warning', bg: 'bg-warning/10' },
};

const riskConfig: Record<DropoffRisk, { color: string; bg: string; label: string }> = {
  low: { color: 'text-success', bg: 'bg-success/10', label: 'Low Risk' },
  medium: { color: 'text-warning', bg: 'bg-warning/10', label: 'Medium Risk' },
  high: { color: 'text-destructive', bg: 'bg-destructive/10', label: 'High Risk' },
};

const demoCustomer = {
  id: 'c0000001-0000-0000-0000-000000000001',
  masked_name: 'Rahul S.',
  phone_masked: '****-****-7821',
  email_masked: 'r****@gmail.com',
  city: 'Mumbai',
  age: 28,
  monthly_income: 45000,
  kyc_status: 'verified' as const,
  credit_score: 742,
  existing_customer: true,
  product_interest: 'Pay-in-3',
  purchase_amount: 9000,
  previous_interactions: 3,
};

export default function LiveCallPage() {
  const router = useRouter();
  const [consentDialog, setConsentDialog] = useState(true);
  const [callActive, setCallActive] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<AIAnalysis | null>(null);
  const [callId, setCallId] = useState<string | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcript, isTyping]);

  useEffect(() => {
    if (callActive) {
      timerRef.current = setInterval(() => setCallDuration((d) => d + 1), 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
  }, [callActive]);

  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const startCall = async () => {
    setConsentDialog(false);
    setCallActive(true);
    setCallEnded(false);
    setTranscript([]);
    setDemoStep(0);
    setCallDuration(0);
    setCurrentAnalysis(null);

    const call = await createCall({
      customer_id: demoCustomer.id,
      agent_name: 'Agent Priya',
      call_status: 'in_progress',
      call_duration_sec: 0,
      customer_intent: 'exploring',
      customer_sentiment: 'neutral',
      conversion_probability: 0.3,
      dropoff_risk: 'medium',
      converted: false,
      ai_assisted: true,
      ai_cost: 0,
      is_demo: true,
    });

    if (call) {
      setCallId(call.id);
      await logAuditEvent('call_started', 'call', call.id, 'Agent Priya', { consent: true, recording: true, ai_assistance: true });
    }

    setTimeout(() => playDemoStep(0, call?.id || null), 800);
  };

  const playDemoStep = useCallback(async (step: number, cId: string | null) => {
    if (step >= demoScript.length) return;

    const script = demoScript[step];
    setIsTyping(true);

    await new Promise((r) => setTimeout(r, 800));
    setIsTyping(false);

    const entry: TranscriptEntry = {
      speaker: script.speaker,
      text: script.text,
      timestamp: script.timestampSec,
    };

    setTranscript((prev) => [...prev, entry]);

    if (cId) {
      await addTranscriptMessage(cId, script.speaker, script.text, script.timestampSec, 'neutral');
    }

    if (script.speaker === 'customer') {
      const customerIndex = demoScript.slice(0, step + 1).filter((s) => s.speaker === 'customer').length - 1;
      const analysis = demoAnalyses[customerIndex + 1];

      if (analysis) {
        setCurrentAnalysis(analysis);
        entry.analysis = analysis;

        if (cId) {
          await addRecommendation({
            call_id: cId,
            recommendation_type: analysis.objectionType ? 'objection_response' : 'next_best_action',
            title: analysis.nextBestAction,
            suggested_response: analysis.suggestedResponse,
            confidence_score: analysis.confidenceScore,
            knowledge_source: analysis.ragSource?.source || null,
            knowledge_version: analysis.ragSource?.version || null,
            agent_action: 'pending',
            compliance_checked: true,
            compliance_passed: analysis.compliancePassed,
          });

          if (analysis.objectionType) {
            await addObjection(cId, analysis.objectionType, script.text, script.timestampSec, analysis.confidenceScore);
          }
        }
      }
    }

    setDemoStep(step + 1);
  }, []);

  useEffect(() => {
    if (callActive && demoStep > 0 && demoStep < demoScript.length) {
      const delay = demoScript[demoStep - 1]?.speaker === 'customer' ? 3500 : 2000;
      const t = setTimeout(() => playDemoStep(demoStep, callId), delay);
      return () => clearTimeout(t);
    }
  }, [demoStep, callActive, callId, playDemoStep]);

  const handleAgentAction = async (action: 'used' | 'verified' | 'escalated' | 'dismissed') => {
    if (!callId || !currentAnalysis) return;

    if (action === 'used') {
      const agentEntry: TranscriptEntry = {
        speaker: 'agent',
        text: currentAnalysis.suggestedResponse,
        timestamp: callDuration,
      };
      setTranscript((prev) => [...prev, agentEntry]);
      await addTranscriptMessage(callId, 'agent', currentAnalysis.suggestedResponse, callDuration, 'positive');
    }

    const { data: recs } = await supabase
      .from('ai_recommendations')
      .select('id')
      .eq('call_id', callId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (recs && recs[0]) {
      await supabase
        .from('ai_recommendations')
        .update({ agent_action: action, action_timestamp: new Date().toISOString() })
        .eq('id', recs[0].id);
    }

    await logAuditEvent('ai_recommendation_actioned', 'call', callId, 'Agent Priya', { action });
    setCurrentAnalysis(null);
  };

  const endCall = async () => {
    setCallActive(false);
    setCallEnded(true);
    if (timerRef.current) clearInterval(timerRef.current);

    if (callId) {
      const finalAnalysis = demoAnalyses[4];
      const summary = generateCallSummary(
        transcript.map((t) => ({ speaker: t.speaker, text: t.text })),
        transcript
          .filter((t) => t.analysis?.objectionType)
          .map((t) => ({ type: t.analysis!.objectionType!, text: t.text, resolved: true })),
        finalAnalysis?.intent || 'evaluating',
        finalAnalysis?.conversionProbability || 0.5
      );

      await updateCall(callId, {
        call_status: 'completed',
        call_duration_sec: callDuration,
        ended_at: new Date().toISOString(),
        customer_intent: finalAnalysis?.intent || 'evaluating',
        customer_sentiment: finalAnalysis?.sentiment || 'neutral',
        conversion_probability: finalAnalysis?.conversionProbability || 0.5,
        dropoff_risk: finalAnalysis?.dropoffRisk || 'medium',
        converted: finalAnalysis?.intent === 'ready_to_onboard',
        conversion_score: finalAnalysis?.conversionProbability || 0.5,
        summary,
        ai_cost: 15.5,
      });

      const followUpMsg = generateFollowUpMessage(
        demoCustomer.masked_name,
        finalAnalysis?.intent || 'evaluating',
        transcript.filter((t) => t.analysis?.objectionType).map((t) => ({ type: t.analysis!.objectionType!, resolved: true })),
        demoCustomer.purchase_amount
      );

      await addFollowUp({
        call_id: callId,
        customer_id: demoCustomer.id,
        channel: 'whatsapp',
        message_body: followUpMsg,
        scheduled_for: new Date(Date.now() + 86400000).toISOString(),
        sent: false,
      });

      await addCRMRecord({
        call_id: callId,
        customer_id: demoCustomer.id,
        update_type: 'kyc_initiated',
        previous_status: 'lead',
        new_status: 'kyc_in_progress',
        notes: summary,
        approved: false,
        approved_by: null,
        applied_to_crm: false,
      });

      await logAuditEvent('call_ended', 'call', callId, 'Agent Priya', { duration: callDuration, status: 'completed' });

      setTimeout(() => router.push(`/post-call?id=${callId}`), 1500);
    }
  };

  const payIn3 = calculatePayIn3(demoCustomer.purchase_amount);
  const lastAnalysis = [...transcript].reverse().find((t) => t.analysis)?.analysis;
  const activeAnalysis = currentAnalysis || lastAnalysis;

  return (
    <div className="space-y-6">
      <Dialog open={consentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Consent Required
            </DialogTitle>
            <DialogDescription>
              Before starting the AI-assisted call, please confirm the following:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <label className="flex items-start gap-3 text-sm">
              <Checkbox defaultChecked className="mt-0.5" />
              <span>Customer has consented to <strong>call recording</strong> for quality and training purposes.</span>
            </label>
            <label className="flex items-start gap-3 text-sm">
              <Checkbox defaultChecked className="mt-0.5" />
              <span>Customer has been informed that <strong>AI assistance</strong> will be used during the call.</span>
            </label>
            <label className="flex items-start gap-3 text-sm">
              <Checkbox defaultChecked className="mt-0.5" />
              <span>Customer data will be <strong>PII-masked</strong> and stored per RBI guidelines.</span>
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => router.push('/')}>Cancel</Button>
            <Button onClick={startCall} className="gap-2">
              <PhoneCall className="h-4 w-4" />
              Start Demo Call
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Live Call — Voice Co-Pilot</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time AI assistance with objection detection and grounded responses
          </p>
        </div>
        <div className="flex items-center gap-3">
          {callActive && (
            <>
              <div className="flex items-center gap-2 text-sm">
                <span className="flex h-2.5 w-2.5 rounded-full bg-destructive animate-pulse" />
                <span className="font-mono font-medium">{fmtTime(callDuration)}</span>
              </div>
              <Button variant="destructive" size="sm" onClick={endCall} className="gap-2">
                <PhoneOff className="h-4 w-4" />
                End Call
              </Button>
            </>
          )}
          {!callActive && !consentDialog && (
            <Button onClick={startCall} className="gap-2">
              <PhoneCall className="h-4 w-4" />
              New Demo Call
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Customer Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="font-medium">{demoCustomer.masked_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium font-mono">{demoCustomer.phone_masked}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">City</p>
                  <p className="font-medium">{demoCustomer.city}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Monthly Income</p>
                  <p className="font-medium">Rs. {demoCustomer.monthly_income.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">KYC Status</p>
                  <Badge variant="outline" className="mt-0.5 capitalize border-success/40 text-success">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    {demoCustomer.kyc_status}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Credit Score</p>
                  <p className="font-medium">{demoCustomer.credit_score}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Purchase Amount</p>
                  <p className="font-medium">Rs. {demoCustomer.purchase_amount.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Previous Calls</p>
                  <p className="font-medium">{demoCustomer.previous_interactions}</p>
                </div>
              </div>
              <Separator className="my-3" />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-success" />
                All PII masked. Synthetic demo data only.
              </div>
            </CardContent>
          </Card>

          <Card className="flex flex-col" style={{ minHeight: '400px' }}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Mic className="h-4 w-4 text-primary" />
                  Live Transcript
                </CardTitle>
                {callActive && (
                  <Badge variant="secondary" className="text-xs">
                    <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
                    Recording
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              <ScrollArea className="h-[340px] pr-4 scrollbar-thin">
                <div className="space-y-3">
                  {transcript.length === 0 && !callActive && (
                    <div className="flex flex-col items-center justify-center h-[280px] text-center">
                      <PhoneCall className="h-10 w-10 text-muted-foreground/50 mb-3" />
                      <p className="text-sm text-muted-foreground">
                        Click "Start Demo Call" to begin the AI-assisted conversation
                      </p>
                    </div>
                  )}
                  {transcript.map((entry, i) => (
                    <div
                      key={i}
                      className={`flex ${entry.speaker === 'customer' ? 'justify-start' : 'justify-end'} animate-slide-up`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg px-4 py-2.5 text-sm ${
                          entry.speaker === 'customer'
                            ? 'bg-secondary text-foreground'
                            : entry.speaker === 'ai'
                            ? 'bg-primary/10 border border-primary/20 text-foreground'
                            : 'bg-primary text-primary-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-xs font-semibold opacity-70">
                            {entry.speaker === 'customer' ? 'Customer' : entry.speaker === 'ai' ? 'AI Co-Pilot' : 'Agent'}
                          </span>
                          <span className="text-xs opacity-50">{fmtTime(entry.timestamp)}</span>
                        </div>
                        <p>{entry.text}</p>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start animate-fade-in">
                      <div className="bg-secondary rounded-lg px-4 py-3 text-sm">
                        <div className="flex gap-1">
                          <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={transcriptEndRef} />
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Conversation Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Customer Intent</p>
                <Badge variant="secondary" className="capitalize">
                  {activeAnalysis?.intent?.replace(/_/g, ' ') || 'Exploring'}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Sentiment</p>
                {(() => {
                  const sent = activeAnalysis?.sentiment || 'neutral';
                  const cfg = sentimentConfig[sent];
                  const Icon = cfg.icon;
                  return (
                    <Badge variant="outline" className={`${cfg.color} ${cfg.bg} border-0 capitalize`}>
                      <Icon className="mr-1 h-3 w-3" />
                      {sent}
                    </Badge>
                  );
                })()}
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Conversion Probability</p>
                <div className="flex items-center gap-2">
                  <Progress value={(activeAnalysis?.conversionProbability || 0.3) * 100} className="h-2" />
                  <span className="text-sm font-medium">
                    {((activeAnalysis?.conversionProbability || 0.3) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Drop-off Risk</p>
                {(() => {
                  const risk = activeAnalysis?.dropoffRisk || 'medium';
                  const cfg = riskConfig[risk];
                  return (
                    <Badge variant="outline" className={`${cfg.color} ${cfg.bg} border-0`}>
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      {cfg.label}
                    </Badge>
                  );
                })()}
              </div>
            </CardContent>
          </Card>

          {currentAnalysis && (
            <Card className="border-primary/30 animate-slide-up">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Bot className="h-4 w-4 text-primary" />
                    AI Recommendation
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">
                    <Zap className="mr-1 h-3 w-3 text-warning" />
                    {(currentAnalysis.confidenceScore * 100).toFixed(0)}% confidence
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentAnalysis.objectionType && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2">
                    <p className="text-xs font-medium text-destructive flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Objection Detected: <span className="capitalize">{currentAnalysis.objectionType.replace(/_/g, ' ')}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 italic">"{currentAnalysis.objectionText}"</p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Next Best Action</p>
                  <p className="text-sm font-semibold text-primary">{currentAnalysis.nextBestAction}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Suggested Response</p>
                  <div className="rounded-lg bg-secondary p-3 text-sm">
                    <p>{currentAnalysis.suggestedResponse}</p>
                  </div>
                </div>

                {currentAnalysis.ragSource && (
                  <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
                    <p className="text-xs font-medium flex items-center gap-1.5 text-primary">
                      <BookOpen className="h-3.5 w-3.5" />
                      Knowledge Source
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{currentAnalysis.ragSource.source}</p>
                    <p className="text-xs text-muted-foreground">Version: {currentAnalysis.ragSource.version}</p>
                  </div>
                )}

                {currentAnalysis.compliancePassed ? (
                  <div className="flex items-center gap-1.5 text-xs text-success">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {currentAnalysis.complianceNotes}
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-destructive">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {currentAnalysis.complianceNotes}
                  </div>
                )}

                <Separator />

                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => handleAgentAction('used')} className="gap-1.5 flex-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Use
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleAgentAction('verified')} className="gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Verify
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleAgentAction('escalated')} className="gap-1.5">
                    <ArrowRight className="h-3.5 w-3.5" />
                    Escalate
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleAgentAction('dismissed')} className="gap-1.5">
                    Dismiss
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Pay-in-3 Calculator
              </CardTitle>
              <CardDescription className="text-xs">Deterministic calculation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Purchase Amount</span>
                  <span className="font-medium">Rs. {demoCustomer.purchase_amount.toLocaleString('en-IN')}</span>
                </div>
                {payIn3.payments.map((p, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{p.due}</span>
                    <span className="font-medium">Rs. {p.amount.toLocaleString('en-IN')}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Total Paid</span>
                  <span className="font-bold text-success">Rs. {payIn3.total.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Interest & Fees</span>
                  <span className="font-medium text-success">Rs. 0.00</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {callEnded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10 mx-auto mb-4">
                <CheckCircle2 className="h-7 w-7 text-success" />
              </div>
              <h2 className="text-lg font-bold">Call Completed</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Generating AI summary, CRM update, and follow-up...
              </p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <FileText className="h-4 w-4 text-primary animate-pulse" />
                <span className="text-sm text-muted-foreground">Processing post-call analysis</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
