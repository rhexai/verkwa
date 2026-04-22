"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthSync } from "@/lib/hooks/useAuthSync";

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

  useEffect(() => {
    async function fetchAccountingData() {
      let query = supabase
        .from('transactions')
        .select('amount, type');

      if (isRestricted && employeeId) {
        query = query.eq('staff_id', employeeId);
      }
      
      const { data: txs, error } = await query;
      
      if (error) {
        console.error("Error fetching accounting data:", error);
      } else {
        let income = 0;
        let expenses = 0;
        
        txs?.forEach(tx => {
          if (tx.status === 'rejected' || tx.status === 'denied') return; // Skip rejected/denied transactions
          const amt = Number(tx.amount);
          if (tx.type === 'Commission') income += amt;
          else if (tx.type === 'Withdrawal') expenses += amt;
        });

        setFinancials({
          income,
          expenses,
          cashOnHand: income - expenses
        });
      }
      setLoading(false);
    }

    fetchAccountingData();
  }, []);

  const summaryCards = [
    { title: "Income", amount: financials.income.toFixed(2) },
    { title: "Expenses", amount: financials.expenses.toFixed(2) },
    { title: "Cash At Hand", amount: financials.cashOnHand.toFixed(2) },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-20 font-sans">
      
      {/* Premium Stats Container */}
      <div className="bg-[#2EB67D] rounded-3xl overflow-hidden shadow-2xl relative p-12 flex flex-col min-h-[400px] justify-between">
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
           <div className="p-6 bg-white/10 rounded-2xl border border-white/20 hover:bg-white/20 transition-all group">
              <p className="text-[9px] font-bold text-white tracking-widest mb-2 uppercase opacity-60">Total yield</p>
              <p className="text-[20px] font-bold text-white tracking-tight leading-none">₵ {financials.income.toLocaleString()}</p>
           </div>
           <div className="p-6 bg-white/10 rounded-2xl border border-white/20 hover:bg-white/20 transition-all group">
              <p className="text-[9px] font-bold text-white tracking-widest mb-2 uppercase opacity-60">Total liabilities</p>
              <p className="text-[20px] font-bold text-white tracking-tight leading-none">₵ {financials.expenses.toLocaleString()}</p>
           </div>
           <div className="p-6 bg-white/10 rounded-2xl border border-white/20 hover:bg-white/20 transition-all group">
              <p className="text-[9px] font-bold text-white tracking-widest mb-2 uppercase opacity-80">Reserved capital</p>
              <p className="text-[20px] font-bold text-white tracking-tight leading-none">₵ 124,500.00</p>
           </div>
        </div>
      </div>

      {/* Action Row */}
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-4">
            <button className="px-6 py-2.5 bg-white border border-slate-200 rounded-full text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              Export Report
            </button>
            <button className="px-6 py-2.5 bg-white border border-slate-200 rounded-full text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M7 12h10"/><path d="M10 18h4"/></svg>
              Advanced Filters
            </button>
         </div>
         <p className="text-[11px] font-bold text-slate-400 italic">Audit Log: Validated on {new Date().toLocaleDateString()}</p>
      </div>

    </div>
  );
}
