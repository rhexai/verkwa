"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthSync } from "@/lib/hooks/useAuthSync";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  defs,
  linearGradient,
  stop
} from "recharts";
import { format, subDays, eachDayOfInterval, startOfDay, isSameDay } from "date-fns";

export default function ReportsPage() {
  const { resolvedRole, employeeId, isSyncing } = useAuthSync();
  const role = (resolvedRole || "").toLowerCase();
  const isAdmin = ["administrator", "admin", "superadmin"].includes(role);
  const isRestricted = !isAdmin && role !== "client" && role !== "";

  const tabs = ["Highlight", "Generate"];
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    depositTotal: 0,
    withdrawalTotal: 0,
    loanTotal: 0,
    commissionTotal: 0,
    timeSeries: [] as any[]
  });

  useEffect(() => {
    async function fetchReportData() {
      try {
        setLoading(true);
        // Fetch last 30 days of transactions for trending
        const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
        
        let query = supabase
          .from('transactions')
          .select('amount, type, created_at')
          .gte('created_at', thirtyDaysAgo)
          .order('created_at', { ascending: true });

        if (isRestricted && employeeId) {
          query = query.eq('staff_id', employeeId);
        }

        const { data: txs, error } = await query;
        
        if (error) throw error;

        // Create 30-day timeline
        const days = eachDayOfInterval({
          start: subDays(new Date(), 29),
          end: new Date()
        });

        let deposit = 0;
        let withdrawal = 0;
        let loan = 0;
        let commission = 0;

        const timeSeries = days.map(day => {
          const dateStr = format(day, "MMM dd");
          let dayDeposit = 0;
          let dayWithdrawal = 0;
          let dayLoan = 0;
          let dayCommission = 0;

          txs?.forEach(tx => {
            if (tx.status === 'rejected' || tx.status === 'denied') return; // Skip rejected/denied transactions
            if (isSameDay(new Date(tx.created_at), day)) {
              const amt = Number(tx.amount);
              if (tx.type === 'Deposit') dayDeposit += amt;
              else if (tx.type === 'Withdrawal') dayWithdrawal += amt;
              else if (tx.type === 'Loan') dayLoan += amt;
              else if (tx.type === 'Commission') dayCommission += amt;
            }
          });

          deposit += dayDeposit;
          withdrawal += dayWithdrawal;
          loan += dayLoan;
          commission += dayCommission;

          return {
            name: dateStr,
            Deposit: dayDeposit,
            Withdrawal: dayWithdrawal,
            Loan: dayLoan,
            Commission: dayCommission
          };
        });

        setReportData({
          depositTotal: deposit,
          withdrawalTotal: withdrawal,
          loanTotal: loan,
          commissionTotal: commission,
          timeSeries
        });
      } catch (err) {
        console.error("Error fetching report data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchReportData();
  }, [resolvedRole, employeeId]);

  const charts = [
    { title: "Deposit", total: reportData.depositTotal.toFixed(2), subtitle: "Daily volume (30d)", hasData: reportData.depositTotal > 0, color: "#2EB67D", dataKey: "Deposit" },
    { title: "Withdrawal", total: reportData.withdrawalTotal.toFixed(2), subtitle: "Daily volume (30d)", hasData: reportData.withdrawalTotal > 0, color: "#F87171", dataKey: "Withdrawal" },
    { title: "Loan", total: reportData.loanTotal.toFixed(2), subtitle: "Daily volume (30d)", hasData: reportData.loanTotal > 0, color: "#FBBF24", dataKey: "Loan" },
    { title: "Revenue", total: reportData.commissionTotal.toFixed(2), subtitle: "Manual commissions (30d)", hasData: reportData.commissionTotal > 0, color: "#818CF8", dataKey: "Commission" }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto pb-20 space-y-8 font-sans animate-in fade-in duration-700">
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Tabs Row */}
        <div className="flex items-center px-6 pt-4 border-b border-slate-50 gap-8">
          {tabs.map((tab, idx) => (
            <button 
              key={tab}
              className={`pb-3 text-[13px] font-bold border-b-2 transition-colors ${
                idx === 0 
                ? "border-accent text-slate-900" 
                : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Highlight Summary Banner */}
        <div className="p-8 bg-slate-50/50">
          <div className="flex items-center gap-5">
            <div className="flex items-end gap-1 h-10">
              <div className="w-2.5 h-6 bg-slate-200 rounded-full animate-pulse"></div>
              <div className="w-2.5 h-10 bg-slate-600 rounded-full animate-pulse " style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2.5 h-8 bg-[#2EB67D] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <div>
              <h2 className="text-[20px] font-bold text-slate-900 tracking-tight leading-tight">Business intelligence summary</h2>
              <p className="text-[12px] font-bold text-slate-400 tracking-widest mt-1 uppercase">Status: Live Analytics Engine Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {charts.map((chart, i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-3xl shadow-sm flex flex-col h-[420px] overflow-hidden group hover:border-accent/20 transition-all">
            <div className="p-8 flex items-start justify-between">
               <div className="space-y-1">
                  <h3 className="text-[16px] font-bold text-slate-900 tracking-tight">{chart.title} analytics</h3>
                  <p className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">{chart.subtitle}</p>
               </div>
               <div className="flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-time</span>
               </div>
            </div>

            <div className="px-8 flex flex-col mb-4">
              <span className="text-4xl font-bold text-slate-900 tracking-tighter">
                {loading ? "..." : `₵ ${Number(chart.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
              </span>
            </div>

            {/* Recharts Area */}
            <div className="flex-1 w-full px-2">
              {loading ? (
                <div className="flex-1 flex items-center justify-center italic text-slate-300 text-xs font-medium h-full">
                  Calculating trajectory...
                </div>
              ) : chart.hasData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={reportData.timeSeries}>
                    <defs>
                      <linearGradient id={`color${chart.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chart.color} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={chart.color} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      hide 
                    />
                    <YAxis hide domain={['auto', 'auto']} />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '16px', 
                        border: 'none', 
                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        padding: '12px'
                      }}
                      cursor={{ stroke: '#f0f0f0', strokeWidth: 2 }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey={chart.dataKey} 
                      stroke={chart.color} 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill={`url(#color${chart.dataKey})`} 
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex-1 flex items-center justify-center italic text-slate-300 text-xs font-medium h-full">
                   Insufficient data for 30-day visualization
                </div>
              )}
            </div>

            <div className="px-8 py-5 bg-slate-50/50 flex items-center justify-between mt-auto">
              <span className="text-[12px] font-bold text-slate-500">View detailed audit trail</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 group-hover:text-accent transition-colors"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
