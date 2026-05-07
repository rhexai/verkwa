"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthSync } from "@/lib/hooks/useAuthSync";
import Link from "next/link";

export default function AccountingPage() {
  const { resolvedRole, employeeId, isSyncing } = useAuthSync();
  const role = (resolvedRole || "").toLowerCase();
  const isAdmin = ["administrator", "admin", "superadmin"].includes(role);
  const isRestricted = !isAdmin && role !== "client" && role !== "";
  const [loading, setLoading] = useState(true);
  const [financials, setFinancials] = useState({
    income: 0,
    expenses: 0,
    cashOnHand: 0
  });
  const [recentEntries, setRecentEntries] = useState<any[]>([]);

  useEffect(() => {
    async function fetchAccountingData() {
      try {
        setLoading(true);
        const { data: rpcData, error } = await supabase.rpc('get_dashboard_stats', {
          p_employee_id: isRestricted ? employeeId : null
        });

        if (error) throw error;

        const income = rpcData.financials.revenue.total;
        const expenses = rpcData.financials.withdrawals.total;

        setFinancials({
          income,
          expenses,
          cashOnHand: income - expenses
        });

        // Fetch recent operational entries
        const { data: entries } = await supabase
          .from('transactions')
          .select('*, branches(name)')
          .ilike('deposit_by', 'INCOME%') // Strictly only show manual income/admin entries
          .order('created_at', { ascending: false })
          .limit(5);
        
        setRecentEntries(entries || []);

      } catch (err) {
        console.error("Error fetching accounting data:", err);
      } finally {
        setLoading(false);
      }
    }

    if (!isSyncing && (!isRestricted || employeeId)) fetchAccountingData();
  }, [isSyncing, isRestricted, employeeId]);


  return (
    <div className="w-full max-w-7xl mx-auto space-y-12 pb-20 font-sans animate-in fade-in duration-700">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
        <div className="space-y-1">
          <h1 className="text-[32px] font-bold text-slate-900 tracking-tight leading-none">Accounting</h1>
          <p className="text-slate-400 font-bold text-[11px] tracking-widest uppercase">Manage system revenue and operational expenses</p>
        </div>
        <div className="flex items-center gap-3">
           <Link href="/dashboard/ledgers" className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-xs shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              Register income
           </Link>
        </div>
      </div>

      {/* Premium Stats Container */}
      <div className="bg-[#2EB67D] rounded-[40px] overflow-hidden shadow-2xl relative p-12 flex flex-col min-h-[400px] justify-between border-4 border-white">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
             <h3 className="text-[28px] font-bold text-white tracking-tight">Financial performance</h3>
          </div>
          <div className="flex items-center gap-2 p-1 bg-white/10 rounded-full border border-white/20">
             <button className="px-5 py-2 bg-white text-slate-900 rounded-full font-bold text-xs shadow-lg">Summary</button>
             <button className="px-5 py-2 text-white hover:bg-white/10 rounded-full font-bold text-xs transition-colors">Statements</button>
          </div>
        </div>

        <div className="flex flex-col items-center py-10">
           <p className="text-[11px] font-bold text-white tracking-[0.4em] mb-2 uppercase opacity-80">Net operational income</p>
           <h2 className="text-[64px] font-bold text-white tracking-tighter leading-none">
              {loading ? "..." : `₵ ${financials.cashOnHand.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
           </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="p-8 bg-white/10 rounded-3xl border border-white/20 hover:bg-white/20 transition-all group">
              <p className="text-[9px] font-bold text-white tracking-widest mb-2 uppercase opacity-60">Total yield</p>
              <p className="text-[24px] font-bold text-white tracking-tight leading-none">₵ {financials.income.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
           </div>
           <div className="p-8 bg-white/10 rounded-3xl border border-white/20 hover:bg-white/20 transition-all group">
              <p className="text-[9px] font-bold text-white tracking-widest mb-2 uppercase opacity-60">Total liabilities</p>
              <p className="text-[24px] font-bold text-white tracking-tight leading-none">₵ {financials.expenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
           </div>
           <div className="p-8 bg-white/10 rounded-3xl border border-white/20 hover:bg-white/20 transition-all group">
              <p className="text-[9px] font-bold text-white tracking-widest mb-2 uppercase opacity-80">Reserved capital</p>
              <p className="text-[24px] font-bold text-white tracking-tight leading-none">₵ 124,500.00</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         {/* Recent Ledger Activity */}
         <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
               <h2 className="text-[15px] font-black text-slate-900 tracking-tight">Recent ledger activity</h2>
               <Link href="/dashboard/ledgers" className="text-[11px] font-bold text-accent hover:underline tracking-widest uppercase">View full ledger ›</Link>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
               <table className="w-full text-left">
                  <thead>
                     <tr className="bg-slate-50/50 border-b border-slate-50">
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 tracking-widest uppercase">Entry details</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 tracking-widest uppercase">Branch</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 tracking-widest uppercase text-right">Amount</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {recentEntries.length === 0 ? (
                        <tr>
                           <td colSpan={3} className="px-8 py-10 text-center text-[12px] font-bold text-slate-300 italic">No recent operational activity detected</td>
                        </tr>
                     ) : (
                        recentEntries.map((entry) => (
                           <tr key={entry.id} className="hover:bg-slate-50 transition-colors group">
                              <td className="px-8 py-5">
                                 <div className="space-y-1">
                                    <p className="text-[13px] font-bold text-slate-900 tracking-tight">{entry.deposit_by || entry.type}</p>
                                    <p className="text-[10px] font-medium text-slate-400">{new Date(entry.created_at).toLocaleString()}</p>
                                 </div>
                              </td>
                              <td className="px-8 py-5">
                                 <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-black tracking-widest uppercase">{entry.branches?.name || "System"}</span>
                              </td>
                              <td className="px-8 py-5 text-right">
                                 <p className={`text-[14px] font-black tracking-tight ${entry.type === 'Withdrawal' ? 'text-red-500' : 'text-[#2EB67D]'}`}>
                                    {entry.type === 'Withdrawal' ? '-' : '+'}₵ {entry.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                 </p>
                              </td>
                           </tr>
                        ))
                     )}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Secondary Stats/Actions */}
         <div className="space-y-8">
            <div className="bg-white border border-slate-200 p-10 rounded-[32px] shadow-sm space-y-8">
               <h3 className="text-[13px] font-bold text-slate-400 tracking-widest uppercase">System health</h3>
               <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                     <p className="text-[11px] font-bold text-slate-500 uppercase">Audit status</p>
                     <span className="px-3 py-1 bg-green-100 text-green-600 rounded-lg text-[9px] font-black tracking-widest uppercase">Verified</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                     <p className="text-[11px] font-bold text-slate-500 uppercase">Last reconciliation</p>
                     <span className="text-[11px] font-black text-slate-900">{new Date().toLocaleDateString()}</span>
                  </div>
                  <button className="w-full py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-black text-slate-600 tracking-widest uppercase hover:bg-slate-100 transition-all">
                     Run manual reconcile
                  </button>
               </div>
            </div>

            <div className="p-10 bg-slate-900 rounded-[32px] text-white space-y-6 shadow-xl shadow-slate-200">
               <h3 className="text-[11px] font-bold text-slate-400 tracking-widest uppercase opacity-60">Action center</h3>
               <div className="space-y-4">
                  <Link href="/dashboard/generate" className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-[11px] font-black text-white tracking-widest uppercase transition-all flex items-center justify-center gap-2">
                     <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                     Extract assets
                  </Link>
               </div>
            </div>
         </div>
      </div>

    </div>
  );
}
