"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AccountingPage() {
  const [loading, setLoading] = useState(true);
  const [financials, setFinancials] = useState({
    income: 0,
    expenses: 0,
    cashOnHand: 0
  });

  useEffect(() => {
    async function fetchAccountingData() {
      const { data: txs, error } = await supabase
        .from('transactions')
        .select('amount, type');
      
      if (error) {
        console.error("Error fetching accounting data:", error);
      } else {
        let income = 0;
        let expenses = 0;
        
        txs?.forEach(tx => {
          const amt = Number(tx.amount);
          if (tx.type === 'Deposit') income += amt;
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
    <div className="w-full max-w-7xl mx-auto space-y-4 pb-20">
      
      {/* Huge Cyan Block */}
      <div className="bg-[#82f3ef] rounded-xl overflow-hidden shadow-sm relative pt-4 flex flex-col h-[500px]">
        
        {/* Header Tabs */}
        <div className="flex items-center justify-between px-6 pb-4">
          <div /> {/* Spacer */}
          <div className="flex items-center gap-4 text-[15px] font-medium mr-4">
            <button className="bg-white px-4 py-1.5 rounded-full text-slate-800 shadow-sm">Overview</button>
            <button className="text-slate-800 hover:text-slate-600 transition-colors">Statements</button>
          </div>
          <button className="w-6 h-6 bg-[#fcd6aa] text-[#b45309] rounded flex items-center justify-center font-black">
            ›
          </button>
        </div>

        {/* Filters */}
        <div className="flex justify-center gap-3">
          <select className="px-3 py-1.5 bg-white border border-transparent rounded-lg text-[13px] text-slate-700 focus:outline-none shadow-sm">
            <option>today</option>
          </select>
          <select className="px-3 py-1.5 bg-white border border-transparent rounded-lg text-[13px] text-slate-700 focus:outline-none shadow-sm">
            <option>all branch</option>
          </select>
        </div>

        {/* Net Income Header */}
        <div className="text-center mt-6 z-10 relative">
          <h2 className="text-[34px] font-black text-slate-900 leading-none">
            {loading ? "..." : financials.cashOnHand.toFixed(2)}
          </h2>
          <p className="text-[14px] font-medium text-slate-800 mt-1">Net Income</p>
        </div>

        {/* Mock Chart inside Cyan Box */}
        <div className="relative flex-1 border-l border-b border-cyan-300 flex items-end ml-10 mr-6 mb-8 mt-2">
          {/* Y-axis */}
          <div className="absolute -right-8 inset-y-0 flex flex-col justify-between items-end text-[10px] text-slate-600 py-1">
            <span>1.0</span><span>0.9</span><span>0.8</span><span>0.7</span><span>0.6</span>
            <span>0.5</span><span>0.4</span><span>0.3</span><span>0.2</span><span>0.1</span><span>0</span>
          </div>
          
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between py-1 z-0 pointer-events-none">
            {[...Array(11)].map((_, i) => <div key={i} className="w-full border-t border-cyan-300/50" />)}
          </div>

          <div className="absolute -bottom-6 w-full flex justify-around text-[11px] text-slate-600">
            <span>income</span><span>expenses</span><span>cash flow</span>
          </div>
        </div>
      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {summaryCards.map((card, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm relative">
            <div className="absolute top-4 right-4 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            </div>
            <h3 className="text-[14px] font-bold text-[#68adbb]">{card.title}</h3>
            <p className="text-[20px] font-medium text-slate-800 mt-2">{card.amount}</p>
          </div>
        ))}
      </div>

      <div className="pt-2">
        <button className="px-4 py-2 bg-white border border-slate-300 rounded text-[13px] font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2">
          Filter
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </button>
      </div>

    </div>
  );
}
