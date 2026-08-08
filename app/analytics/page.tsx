'use client';

import { useEffect, useState } from 'react';
import {
  Bot, AlertTriangle, DollarSign, TrendingUp, Users,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts';
import { supabase } from '@/lib/supabase';

const funnelData = [
  { stage: 'Connected', count: 30, pct: 100 },
  { stage: 'Engaged', count: 24, pct: 80 },
  { stage: 'Objections Resolved', count: 18, pct: 60 },
  { stage: 'Intent to Onboard', count: 14, pct: 47 },
  { stage: 'Converted', count: 12, pct: 40 },
];

const pieColors = ['hsl(217 91% 60%)', 'hsl(160 60% 45%)', 'hsl(38 92% 50%)', 'hsl(280 65% 60%)', 'hsl(340 75% 55%)'];

const agentPerformance: { agent: string; calls: number; converted: number; rate: number; aiAcceptance: number }[] = [
  { agent: 'Agent Priya', calls: 18, converted: 14, rate: 78, aiAcceptance: 85 },
  { agent: 'Agent Rohit', calls: 12, converted: 6, rate: 50, aiAcceptance: 65 },
];

const dropoffReasons = [
  { reason: 'Trust concerns', count: 5, pct: 42 },
  { reason: 'Timing not right', count: 3, pct: 25 },
  { reason: 'Network issues', count: 2, pct: 17 },
  { reason: 'Eligibility failed', count: 2, pct: 16 },
];

const monthlyImpact = [
  { month: 'Jan', withoutAI: 22, withAI: 35 },
  { month: 'Feb', withoutAI: 25, withAI: 40 },
  { month: 'Mar', withoutAI: 28, withAI: 44 },
];

export default function AnalyticsPage() {
  const [objectionData, setObjectionData] = useState<{ type: string; count: number }[]>([]);
  const [agentData, setAgentData] = useState<{ agent_name: string; calls: number; converted: number }[]>([]);
  const [recStats, setRecStats] = useState({ used: 0, total: 0 });

  useEffect(() => {
    (async () => {
      const { data: objs } = await supabase.from('objections').select('objection_type');
      if (objs) {
        const counts: Record<string, number> = {};
        objs.forEach((o) => { const t = o.objection_type as string; counts[t] = (counts[t] || 0) + 1; });
        setObjectionData(Object.entries(counts).map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count));
      }

      const { data: calls } = await supabase.from('calls').select('agent_name, converted');
      if (calls) {
        const agentMap: Record<string, { calls: number; converted: number }> = {};
        calls.forEach((c) => {
          if (!agentMap[c.agent_name]) agentMap[c.agent_name] = { calls: 0, converted: 0 };
          agentMap[c.agent_name].calls++;
          if (c.converted) agentMap[c.agent_name].converted++;
        });
        setAgentData(Object.entries(agentMap).map(([agent_name, v]) => ({ agent_name, ...v })));
      }

      const { data: recs } = await supabase.from('ai_recommendations').select('agent_action');
      if (recs) {
        const used = recs.filter((r) => r.agent_action === 'used').length;
        setRecStats({ used, total: recs.length });
      }
    })();
  }, []);

  const aiAcceptanceRate = recStats.total > 0 ? (recStats.used / recStats.total) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Deep-dive into conversion performance, objections, and AI impact
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">AI Recommendation Acceptance</CardTitle>
            <Bot className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aiAcceptanceRate.toFixed(0)}%</div>
            <Progress value={aiAcceptanceRate} className="h-1.5 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total Objections Detected</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{objectionData.reduce((s, o) => s + o.count, 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Avg AI Cost / Call</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs. 12.83</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Est. Revenue Lift</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">+57%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Conversion Funnel</CardTitle>
          <CardDescription>Drop-off at each stage of the sales process</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={funnelData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis dataKey="stage" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={130} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
              <Bar dataKey="count" fill="hsl(217 91% 60%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Objection Analytics</CardTitle>
            <CardDescription>Frequency by objection type</CardDescription>
          </CardHeader>
          <CardContent>
            {objectionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={objectionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="type" stroke="hsl(var(--muted-foreground))" fontSize={10} tickFormatter={(v: string) => v.replace(/_/g, ' ')} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Bar dataKey="count" fill="hsl(38 92% 50%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-12">Loading...</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Drop-off Reasons</CardTitle>
            <CardDescription>Why calls fail to convert</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={dropoffReasons} dataKey="count" nameKey="reason" cx="50%" cy="50%" outerRadius={85} paddingAngle={2}>
                  {dropoffReasons.map((_, i) => (
                    <Cell key={i} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Agent Performance
          </CardTitle>
          <CardDescription>Conversion rates and AI recommendation acceptance by agent</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {agentData.map((agent) => {
              const rate = agent.calls > 0 ? (agent.converted / agent.calls) * 100 : 0;
              const perf = agentPerformance.find((p) => p.agent === agent.agent_name);
              return (
                <div key={agent.agent_name} className="rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{agent.agent_name}</p>
                        <p className="text-xs text-muted-foreground">{agent.calls} calls • {agent.converted} converted</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={rate > 60 ? 'border-success/40 text-success' : 'border-warning/40 text-warning'}>
                      {rate.toFixed(0)}% conversion
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Conversion Rate</p>
                      <Progress value={rate} className="h-2" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">AI Acceptance</p>
                      <Progress value={perf?.aiAcceptance || 70} className="h-2" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-success" />
            Estimated Business Impact
          </CardTitle>
          <CardDescription>Conversions with vs without AI assistance</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthlyImpact}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="withoutAI" stroke="hsl(340 75% 55%)" strokeWidth={2} dot={{ r: 4 }} name="Without AI" />
              <Line type="monotone" dataKey="withAI" stroke="hsl(142 71% 45%)" strokeWidth={2} dot={{ r: 4 }} name="With AI" />
            </LineChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="rounded-lg bg-secondary p-3 text-center">
              <p className="text-xs text-muted-foreground">AI Cost / Call</p>
              <p className="text-lg font-bold">Rs. 12.83</p>
            </div>
            <div className="rounded-lg bg-secondary p-3 text-center">
              <p className="text-xs text-muted-foreground">Revenue / Conversion</p>
              <p className="text-lg font-bold">Rs. 2,400</p>
            </div>
            <div className="rounded-lg bg-success/10 p-3 text-center">
              <p className="text-xs text-muted-foreground">Net ROI</p>
              <p className="text-lg font-bold text-success">18,600%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
