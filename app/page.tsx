'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  PhoneCall, TrendingUp, Bot, AlertTriangle, DollarSign,
  Phone, ArrowRight, Clock, CheckCircle2, XCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { getDashboardKPIs, getRecentCalls } from '@/lib/queries';
import type { Call } from '@/lib/types';

const funnelData = [
  { stage: 'Call Connected', count: 30, pct: 100 },
  { stage: 'Engaged', count: 24, pct: 80 },
  { stage: 'Objections Resolved', count: 18, pct: 60 },
  { stage: 'Intent to Onboard', count: 14, pct: 47 },
  { stage: 'Converted', count: 12, pct: 40 },
];

const trendData = [
  { day: 'Mon', calls: 4, converted: 3 },
  { day: 'Tue', calls: 5, converted: 3 },
  { day: 'Wed', calls: 6, converted: 4 },
  { day: 'Thu', calls: 4, converted: 2 },
  { day: 'Fri', calls: 7, converted: 5 },
  { day: 'Sat', calls: 2, converted: 1 },
  { day: 'Sun', calls: 2, converted: 1 },
];

const objectionColors = ['#217 91% 60%', '#160 60% 45%', '#38 92% 50%', '#280 65% 60%', '#340 75% 55%'];
const pieColors = ['hsl(217 91% 60%)', 'hsl(160 60% 45%)', 'hsl(38 92% 50%)', 'hsl(280 65% 60%)', 'hsl(340 75% 55%)'];

export default function DashboardPage() {
  const [kpis, setKpis] = useState({
    callsAnalyzed: 0, conversionRate: 0, aiAssistedConversion: 0,
    topObjections: [] as { type: string; count: number }[],
    dropoffRate: 0, avgAiCostPerCall: 0,
  });
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [k, c] = await Promise.all([getDashboardKPIs(), getRecentCalls(8)]);
      setKpis(k);
      setCalls(c);
      setLoading(false);
    })();
  }, []);

  const fmtPct = (v: number) => `${(v * 100).toFixed(1)}%`;
  const fmtRs = (v: number) => `Rs. ${v.toFixed(2)}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sales Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            AI-powered insights for your Pay-in-3 sales performance
          </p>
        </div>
        <Link href="/live-call">
          <Button className="gap-2">
            <PhoneCall className="h-4 w-4" />
            Start Demo Call
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Calls Analyzed</CardTitle>
            <PhoneCall className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.callsAnalyzed}</div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fmtPct(kpis.conversionRate)}</div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">AI-Assisted</CardTitle>
            <Bot className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fmtPct(kpis.aiAssistedConversion)}</div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Drop-off Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fmtPct(kpis.dropoffRate)}</div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">AI Cost/Call</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fmtRs(kpis.avgAiCostPerCall)}</div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Top Objection</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {kpis.topObjections[0]?.type || 'N/A'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Conversion Funnel */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Conversion Funnel</CardTitle>
            <CardDescription>Call progression through sales stages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {funnelData.map((stage, i) => (
                <div key={stage.stage} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{stage.stage}</span>
                    <span className="text-muted-foreground">
                      {stage.count} calls ({stage.pct}%)
                    </span>
                  </div>
                  <div className="h-7 rounded-md bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-md flex items-center px-3 text-xs font-medium text-white transition-all"
                      style={{
                        width: `${stage.pct}%`,
                        backgroundColor: pieColors[i % pieColors.length],
                      }}
                    >
                      {stage.count}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Objections Pie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Objections</CardTitle>
            <CardDescription>Detected across all calls</CardDescription>
          </CardHeader>
          <CardContent>
            {kpis.topObjections.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={kpis.topObjections}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {kpis.topObjections.map((_, i) => (
                      <Cell key={i} fill={pieColors[i % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ fontSize: '12px', textTransform: 'capitalize' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[220px] text-sm text-muted-foreground">
                No objection data
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trend chart + Recent calls */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Call Activity (7 Days)</CardTitle>
            <CardDescription>Daily calls and conversions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="callGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(217 91% 60%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(217 91% 60%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="convGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(142 71% 45%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(142 71% 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="calls" stroke="hsl(217 91% 60%)" fill="url(#callGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="converted" stroke="hsl(142 71% 45%)" fill="url(#convGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Calls</CardTitle>
            <CardDescription>Latest call activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[240px] overflow-auto scrollbar-thin">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : calls.length === 0 ? (
              <p className="text-sm text-muted-foreground">No calls found</p>
            ) : (
              calls.map((call) => (
                <Link
                  key={call.id}
                  href={`/post-call?id=${call.id}`}
                  className="flex items-center gap-3 rounded-lg p-2 hover:bg-secondary transition-colors"
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    call.call_status === 'completed' ? 'bg-success/15' :
                    call.call_status === 'dropped' ? 'bg-warning/15' : 'bg-destructive/15'
                  }`}>
                    {call.converted ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {call.customer?.masked_name || 'Unknown'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {call.agent_name} • {Math.floor(call.call_duration_sec / 60)}m
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs capitalize shrink-0">
                    {call.call_status}
                  </Badge>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
