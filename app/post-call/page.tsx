'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  FileText, CheckCircle2, AlertTriangle, TrendingUp, MessageSquare,
  User, ShieldCheck, Clock, BookOpen, Sparkles, Send,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  getCallById, getCallTranscript, getCallRecommendations, getCallObjections,
  getCallCRMRecords, getCallFollowUps, approveCRMRecord, logAuditEvent,
} from '@/lib/queries';
import type { Call, TranscriptMessage, AIRecommendation, Objection, CRMRecord, FollowUp } from '@/lib/types';

function PostCallContent() {
  const searchParams = useSearchParams();
  const callId = searchParams.get('id');
  const [call, setCall] = useState<Call | null>(null);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [objections, setObjections] = useState<Objection[]>([]);
  const [crmRecords, setCrmRecords] = useState<CRMRecord[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!callId) { setLoading(false); return; }
    (async () => {
      const [c, t, r, o, crm, fu] = await Promise.all([
        getCallById(callId),
        getCallTranscript(callId),
        getCallRecommendations(callId),
        getCallObjections(callId),
        getCallCRMRecords(callId),
        getCallFollowUps(callId),
      ]);
      setCall(c);
      setTranscript(t as TranscriptMessage[]);
      setRecommendations(r as AIRecommendation[]);
      setObjections(o as Objection[]);
      setCrmRecords(crm as CRMRecord[]);
      setFollowUps(fu as FollowUp[]);
      setLoading(false);
    })();
  }, [callId]);

  const handleApprove = async (recordId: string) => {
    await approveCRMRecord(recordId, 'Agent Priya');
    if (callId) {
      await logAuditEvent('crm_update_approved', 'crm_record', recordId, 'Agent Priya', { auto_apply: false });
    }
    setCrmRecords((prev) => prev.map((r) => r.id === recordId ? { ...r, approved: true, approved_by: 'Agent Priya', applied_to_crm: true } : r));
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-muted-foreground">Loading post-call analysis...</p></div>;
  }

  if (!call) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h2 className="text-lg font-bold">No Call Selected</h2>
        <p className="text-sm text-muted-foreground mt-1">Select a call from the dashboard to view post-call analysis.</p>
      </div>
    );
  }

  const fmtTime = (s: number) => `${Math.floor(s / 60)}m ${s % 60}s`;
  const conversionPct = Math.round(call.conversion_probability * 100);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Post-Call Analysis</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {call.customer?.masked_name} • {call.agent_name} • {fmtTime(call.call_duration_sec)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="capitalize">{call.call_status}</Badge>
          {call.converted ? (
            <Badge className="bg-success text-success-foreground gap-1">
              <CheckCircle2 className="h-3 w-3" /> Converted
            </Badge>
          ) : (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" /> Not Converted
            </Badge>
          )}
          {call.is_demo && <Badge variant="secondary">Demo</Badge>}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              AI-Generated Call Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{call.summary || 'No summary available.'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Conversion Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{conversionPct}%</div>
            <div className="mt-2 h-2 rounded-full bg-secondary overflow-hidden">
              <div
                className={`h-full rounded-full ${conversionPct > 70 ? 'bg-success' : conversionPct > 40 ? 'bg-warning' : 'bg-destructive'}`}
                style={{ width: `${conversionPct}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Customer intent: <span className="font-medium capitalize">{call.customer_intent.replace(/_/g, ' ')}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Sentiment: <span className="font-medium capitalize">{call.customer_sentiment}</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transcript">Transcript</TabsTrigger>
          <TabsTrigger value="crm">CRM Update</TabsTrigger>
          <TabsTrigger value="followup">Follow-up</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  Detected Objections ({objections.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {objections.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No objections detected.</p>
                ) : (
                  objections.map((o) => (
                    <div key={o.id} className="rounded-lg border border-border p-3">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="outline" className="capitalize text-xs">{o.objection_type.replace(/_/g, ' ')}</Badge>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{(o.confidence_score * 100).toFixed(0)}%</span>
                          {o.resolved ? (
                            <Badge variant="outline" className="text-xs border-success/40 text-success">
                              <CheckCircle2 className="mr-1 h-3 w-3" /> Resolved
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs border-warning/40 text-warning">Unresolved</Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground italic">"{o.objection_text}"</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI Recommendations ({recommendations.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {recommendations.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No AI recommendations.</p>
                ) : (
                  recommendations.map((r) => (
                    <div key={r.id} className="rounded-lg border border-border p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium">{r.title}</p>
                        <Badge variant="outline" className="text-xs capitalize">{r.agent_action || 'pending'}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{r.suggested_response}</p>
                      {r.knowledge_source && (
                        <p className="text-xs text-primary mt-1 flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {r.knowledge_source} • {r.knowledge_version}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transcript">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Full Transcript
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4 scrollbar-thin">
                <div className="space-y-3">
                  {transcript.map((msg, i) => (
                    <div key={i} className={`flex ${msg.speaker === 'customer' ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[80%] rounded-lg px-4 py-2.5 text-sm ${
                        msg.speaker === 'customer' ? 'bg-secondary' :
                        msg.speaker === 'ai' ? 'bg-primary/10 border border-primary/20' : 'bg-primary text-primary-foreground'
                      }`}>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-xs font-semibold opacity-70 capitalize">{msg.speaker}</span>
                          <span className="text-xs opacity-50">{Math.floor(msg.timestamp_sec)}s</span>
                        </div>
                        <p>{msg.message_text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crm">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                CRM Update Preview
              </CardTitle>
              <CardDescription>Review and approve before applying to CRM</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {crmRecords.length === 0 ? (
                <p className="text-sm text-muted-foreground">No CRM updates for this call.</p>
              ) : (
                crmRecords.map((rec) => (
                  <div key={rec.id} className="rounded-lg border border-border p-4 space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Update Type</p>
                        <p className="font-medium capitalize">{rec.update_type.replace(/_/g, ' ')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Previous Status</p>
                        <p className="font-medium">{rec.previous_status || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">New Status</p>
                        <p className="font-medium capitalize">{rec.new_status.replace(/_/g, ' ')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Approval</p>
                        {rec.approved ? (
                          <Badge variant="outline" className="border-success/40 text-success">
                            <CheckCircle2 className="mr-1 h-3 w-3" /> Approved
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-warning/40 text-warning">Pending</Badge>
                        )}
                      </div>
                    </div>
                    {rec.notes && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Notes</p>
                        <p className="text-sm bg-secondary rounded-lg p-3">{rec.notes}</p>
                      </div>
                    )}
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <ShieldCheck className="h-3.5 w-3.5 text-success" />
                        Human approval required for sensitive financial decisions
                      </div>
                      {!rec.approved && (
                        <Button onClick={() => handleApprove(rec.id)} size="sm" className="gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Approve CRM Update
                        </Button>
                      )}
                      {rec.approved && (
                        <Badge className="bg-success text-success-foreground gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Applied to CRM
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="followup">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                AI-Generated Follow-up Message
              </CardTitle>
              <CardDescription>Personalized based on call analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {followUps.length === 0 ? (
                <p className="text-sm text-muted-foreground">No follow-up generated.</p>
              ) : (
                followUps.map((fu) => (
                  <div key={fu.id} className="rounded-lg border border-border p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="capitalize">{fu.channel}</Badge>
                      {fu.sent ? (
                        <Badge variant="outline" className="border-success/40 text-success">
                          <Send className="mr-1 h-3 w-3" /> Sent
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-warning/40 text-warning">
                          <Clock className="mr-1 h-3 w-3" /> Scheduled
                        </Badge>
                      )}
                      {fu.scheduled_for && (
                        <span className="text-xs text-muted-foreground">
                          For: {new Date(fu.scheduled_for).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="rounded-lg bg-secondary p-3 text-sm">
                      <p>{fu.message_body}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <ShieldCheck className="h-3.5 w-3.5 text-success" />
                      Follow-up generated from approved knowledge base. No prohibited claims.
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function PostCallPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><p className="text-muted-foreground">Loading...</p></div>}>
      <PostCallContent />
    </Suspense>
  );
}
