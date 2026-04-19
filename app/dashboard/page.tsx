"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const { isLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    customers: 0,
    employees: 0,
    branches: 0,
    transactions: 0,
    financials: {
      revenue: { today: 0, month: 0, total: 0 },
      deposits: { today: 0, month: 0, total: 0 },
      withdrawals: { today: 0, month: 0, total: 0 },
      loans: { today: 0, month: 0, total: 0 },
    },
    staffPerformance: [] as any[]
  });

  useEffect(() => {
    async function fetchDashboardStats() {
      // 1. Fetch Counts
      const [custCount, empCount, branchCount, txCount] = await Promise.all([
        supabase.from('customers').select('*', { count: 'exact', head: true }),
        supabase.from('employees').select('*', { count: 'exact', head: true }),
        supabase.from('branches').select('*', { count: 'exact', head: true }),
        supabase.from('transactions').select('*', { count: 'exact', head: true }),
      ]);

      // 2. Fetch All Transactions for calculation
      const { data: txs } = await supabase.from('transactions').select('*');
      
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const monthStr = now.toISOString().slice(0, 7);

      const financials = {
        revenue: { today: 0, month: 0, total: 0 },
        deposits: { today: 0, month: 0, total: 0 },
        withdrawals: { today: 0, month: 0, total: 0 },
        loans: { today: 0, month: 0, total: 0 },
      };

      if (txs) {
        txs.forEach(tx => {
          const txDate = tx.created_at.split('T')[0];
          const txMonth = tx.created_at.slice(0, 7);
          const amount = Number(tx.amount);

          if (tx.type === 'Deposit') {
            financials.deposits.total += amount;
            if (txDate === todayStr) financials.deposits.today += amount;
            if (txMonth === monthStr) financials.deposits.month += amount;
          } else if (tx.type === 'Withdrawal') {
            financials.withdrawals.total += amount;
            if (txDate === todayStr) financials.withdrawals.today += amount;
            if (txMonth === monthStr) financials.withdrawals.month += amount;
          }
        });
      }

      // 3. Fetch Staff Performance
      const { data: staffTxs } = await supabase
        .from('transactions')
        .select('amount, staff_id, created_at, employees(first_name, last_name)');
      
      const performanceMap: Record<string, any> = {};
      staffTxs?.forEach(tx => {
        const staffName = `${tx.employees.first_name} ${tx.employees.last_name}`;
        if (!performanceMap[staffName]) {
          performanceMap[staffName] = { name: staffName, today: 0, week: 0, month: 0 };
        }
        const amount = Number(tx.amount);
        const txDate = tx.created_at.split('T')[0];
        const txMonth = tx.created_at.slice(0, 7);
        
        if (txDate === todayStr) performanceMap[staffName].today += amount;
        if (txMonth === monthStr) performanceMap[staffName].month += amount;
        performanceMap[staffName].week += amount; // Simplified for now
      });

      setStats({
        customers: custCount.count || 0,
        employees: empCount.count || 0,
        branches: branchCount.count || 0,
        transactions: txCount.count || 0,
        financials,
        staffPerformance: Object.values(performanceMap)
      });
      setLoading(false);
    }

    if (isLoaded) fetchDashboardStats();
  }, [isLoaded]);

  if (!isLoaded || loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-fuchsia-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const heroStats = [
    { title: "Revenue", today: stats.financials.revenue.today.toFixed(2), month: stats.financials.revenue.month.toFixed(2), lifetime: stats.financials.revenue.total.toFixed(2), icon: "banknote" },
    { title: "Deposits", today: stats.financials.deposits.today.toFixed(2), month: stats.financials.deposits.month.toFixed(2), lifetime: stats.financials.deposits.total.toFixed(2), icon: "wallet" },
    { title: "Withdrawals", today: stats.financials.withdrawals.today.toFixed(2), month: stats.financials.withdrawals.month.toFixed(2), lifetime: stats.financials.withdrawals.total.toFixed(2), icon: "arrow-down" },
    { title: "Loans", today: stats.financials.loans.today.toFixed(2), month: stats.financials.loans.month.toFixed(2), lifetime: stats.financials.loans.total.toFixed(2), icon: "coins" },
  ];

  const generalStats = [
    { value: stats.customers.toString(), label: "CUSTOMERS" },
    { value: stats.customers.toString(), label: "ACCOUNTS" },
    { value: stats.employees.toString(), label: "EMPLOYEES" },
    { value: stats.branches.toString(), label: "BRANCHES" },
    { value: stats.transactions.toString(), label: "SMS" },
    { value: "0", label: "COMPLAINTS" },
  ];

  const chartsData = [
    { title: "Commission by Branch" },
    { title: "Deposits by Branch", hasData: true },
    { title: "Withdrawals by Branch" },
    { title: "Loans by Branch" },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-20">
      
      {/* 4 Hero Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {heroStats.map((stat, i) => (
          <div key={i} style={{ backgroundColor: '#2ccbba' }} className="rounded-xl text-white overflow-hidden shadow-md flex flex-col">
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/20">
              <div className="flex items-center gap-2 font-bold text-[15px]">
                <div className="w-6 h-6 border-2 border-white rounded-full flex items-center justify-center">
                  {i === 0 && <span className="text-[12px]">$</span>}
                  {i === 1 && <div className="w-3 h-2 border-2 border-white rounded-sm" />}
                  {i === 2 && <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>}
                  {i === 3 && <span className="text-[10px]">L</span>}
                </div>
                {stat.title}
              </div>
              <button className="text-white hover:text-slate-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>
              </button>
            </div>

            <div className="p-5 flex flex-col justify-end min-h-[140px] space-y-3">
              <div className="flex items-baseline gap-2">
                <span className="text-[40px] font-bold leading-none tracking-tight">{stat.today}</span>
                <span className="text-[11px] font-bold uppercase tracking-widest text-white/90">TODAY</span>
              </div>
              <div className="flex flex-col gap-1.5 opacity-90">
                <div className="flex items-baseline gap-2">
                  <span className="text-[22px] font-bold leading-none">{stat.month}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest">MONTH</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-[22px] font-bold leading-none">{stat.lifetime}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest">LIFE TIME</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobilizers Collection Summary Table */}
      <div className="bg-white border text-left border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="bg-fuchsia-50/30 border-b border-slate-200 p-5">
          <h2 className="text-[16px] font-bold text-slate-800">Mobilizers Collection Summary</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-4 text-xs font-bold text-[#68adbb] uppercase tracking-widest w-1/4">STAFF</th>
                <th className="px-6 py-4 text-xs font-bold text-[#68adbb] uppercase tracking-widest w-1/4">TODAY</th>
                <th className="px-6 py-4 text-xs font-bold text-[#68adbb] uppercase tracking-widest w-1/4">WEEK</th>
                <th className="px-6 py-4 text-xs font-bold text-[#68adbb] uppercase tracking-widest w-1/4">MONTH</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-plus-jakarta-sans text-sm font-medium">
              {stats.staffPerformance.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium italic">
                    No staff collections recorded for this period.
                  </td>
                </tr>
              ) : (
                stats.staffPerformance.map((staff, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors bg-white">
                    <td className="px-6 py-5 font-black text-slate-900">{staff.name}</td>
                    <td className="px-6 py-5 text-slate-600 font-bold">{staff.today.toFixed(2)}</td>
                    <td className="px-6 py-5 text-slate-600 font-bold">{staff.week.toFixed(2)}</td>
                    <td className="px-6 py-5 text-slate-600 font-bold">{staff.month.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* General Summaries Grid */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-[16px] font-bold text-slate-800 mb-5">General Summaries</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {generalStats.map((stat, i) => (
            <div key={i} className="flex flex-col items-start p-4 rounded-lg bg-white border border-slate-300 shadow-sm">
              <span className="text-[28px] font-black text-slate-800 leading-none mb-1">{stat.value}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {chartsData.map((chart, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm space-y-6 flex flex-col min-h-[380px]">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-[18px] font-bold text-slate-800">{chart.title}</h2>
                <p className="text-[13px] font-medium text-slate-500 mt-1">Tap or click on a bar for actual figures.</p>
              </div>
              <button className="text-[12px] font-bold text-fuchsia-700 uppercase tracking-widest hover:underline decoration-2 underline-offset-4">Table</button>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 pb-2">
              <div className="flex items-center gap-2"><div className="w-8 h-2.5 bg-teal-300 rounded-sm" /><span className="text-[12px] font-bold text-slate-500">Today</span></div>
              <div className="flex items-center gap-2"><div className="w-8 h-2.5 bg-amber-200 rounded-sm" /><span className="text-[12px] font-bold text-slate-500">This Month</span></div>
              <div className="flex items-center gap-2"><div className="w-8 h-2.5 bg-sky-300 rounded-sm" /><span className="text-[12px] font-bold text-slate-500">Lifetime</span></div>
            </div>

            {/* Mock Chart Area */}
            <div className="relative flex-1 mt-4 ml-8 border-l border-b border-slate-200 flex items-end">
              {/* Y Axis labels */}
              <div className="absolute -left-8 inset-y-0 w-6 flex flex-col justify-between text-[11px] font-medium text-slate-400 py-1">
                <span>1.0</span><span>0.8</span><span>0.6</span><span>0.4</span><span>0.2</span><span>0</span>
              </div>
              
              {/* Background grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between py-1 z-0 pointer-events-none">
                {[...Array(6)].map((_, i) => <div key={i} className="w-full border-t border-slate-100" />)}
              </div>

              {/* Mock Bars */}
              {chart.hasData && (
                <div className="relative z-10 w-full flex items-end justify-center gap-[2px] h-full pb-0.5">
                  <div className="w-20 bg-amber-200 h-full hover:bg-amber-300 transition-colors cursor-pointer" />
                  <div className="w-20 bg-sky-300 h-full hover:bg-sky-400 transition-colors cursor-pointer" />
                </div>
              )}
              {chart.hasData && (
                <div className="absolute -bottom-6 w-full text-center text-[13px] font-bold text-slate-500">HQ</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Floating Continue Setup Widget */}
      <div className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 z-50">
        <button style={{ backgroundColor: '#2d7337' }} className="hover:opacity-90 text-white p-4 rounded-2xl shadow-xl shadow-emerald-900/20 flex items-center gap-4 transition-all group">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl">
            🚀
          </div>
          <div className="text-left pr-4">
            <h4 className="font-bold tracking-tight text-sm">Continue Setup</h4>
            <p className="text-[10px] font-medium text-emerald-200 uppercase tracking-widest mt-0.5">60% complete • 3/5 tasks</p>
          </div>
          <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg>
          </div>
        </button>
      </div>

    </div>
  );
}
