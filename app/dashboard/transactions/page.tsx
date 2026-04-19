"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TransactionsPage() {
  const tabs = ["DEPOSITS", "WITHDRAWALS", "LOANS", "LOAN PAYMENTS", "COMMISSIONS"];
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({ deposits: 0, count: 0 });

  useEffect(() => {
    async function fetchTransactions() {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          customers (
            first_name,
            last_name
          ),
          employees (
            first_name,
            last_name
          ),
          branches (
            name
          )
        `);
      
      if (error) {
        console.error("Error fetching transactions:", error);
      } else {
        const txs = data || [];
        setRecords(txs);
        
        // Calculate totals for TODAY (simple mock for now, filtering by 'Deposit')
        const deposits = txs.filter(t => t.type === 'Deposit');
        const totalAmount = deposits.reduce((sum, t) => sum + Number(t.amount), 0);
        setTotals({ deposits: totalAmount, count: deposits.length });
      }
      setLoading(false);
    }

    fetchTransactions();
  }, []);
    return (
    <div className="w-full max-w-7xl mx-auto pb-20">
      <div className="bg-white border border-[#e5e7eb] shadow-sm rounded-xl overflow-hidden">
        
        {/* Tabs Row */}
        <div className="flex items-center px-4 pt-4 border-b border-slate-200 gap-6">
          {tabs.map((tab, idx) => (
            <button 
              key={tab}
              className={`pb-3 text-[13px] font-bold uppercase tracking-wide border-b-2 transition-colors ${
                idx === 0 
                ? "border-[#c14a42] text-[#c14a42]" 
                : "border-transparent text-[#9e5256] hover:text-[#c14a42]"
              }`}
            >
              {tab}
            </button>
          ))}
          <button className="ml-auto mb-3 w-6 h-6 bg-[#fdecd5] text-[#b45309] rounded flex items-center justify-center font-black">
            ›
          </button>
        </div>

        {/* Actions Row */}
        <div className="p-5 flex items-center justify-between border-b border-slate-100 bg-[#fafafa]">
          <input 
            type="text" 
            placeholder="Search table" 
            className="w-64 px-4 py-2 bg-white border border-slate-300 rounded text-sm focus:outline-none focus:border-slate-400 placeholder:text-slate-400"
          />
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white border border-slate-300 rounded text-[13px] font-bold text-slate-700 hover:bg-slate-50 transition-colors uppercase">
              NEW DEPOSIT
            </button>
            <select className="px-3 py-2 bg-white border border-slate-300 rounded text-[13px] text-slate-700 font-medium focus:outline-none">
              <option>Bulk Action</option>
            </select>
            <select className="px-3 py-2 bg-white border border-slate-300 rounded text-[13px] text-slate-700 font-medium focus:outline-none">
              <option>EXPORT</option>
            </select>
          </div>
        </div>

        {/* Records Header */}
        <div className="px-6 py-4 flex items-center justify-between">
          <h3 className="text-[14px] font-black tracking-wide text-slate-900">{records.length} RECORDS</h3>
          <div className="flex items-center gap-4">
            <select className="px-3 py-1.5 bg-white border border-slate-300 rounded text-[13px] font-medium text-slate-700 focus:outline-none">
              <option>Today</option>
            </select>
            <select className="px-3 py-1.5 bg-white border border-slate-300 rounded text-[11px] text-slate-500 focus:outline-none">
              <option>Branches</option>
            </select>
            <div className="bg-[#fce5c8] px-4 py-1.5 rounded text-[#925f27] text-xs font-bold">Show: 10</div>
          </div>
        </div>

        {/* Pink Summary Block */}
        <div className="bg-[#fff0f6] px-6 py-4 flex items-center justify-between border-y border-[#ffe3f0]">
          <h3 className="text-[20px] font-medium text-[#f472b6]">
            Summary for: <span className="font-bold">TODAY</span>
          </h3>
          <div className="flex items-center gap-4">
            <div className="bg-white border border-[#fbcfe8] rounded py-1.5 px-4 flex flex-col items-start min-w-[140px]">
              <span className="text-[13px] font-medium text-[#f472b6]">Total Deposits</span>
              <span className="text-[16px] font-black text-[#f472b6]">GHc {totals.deposits.toFixed(2)}</span>
            </div>
            <div className="bg-white border border-[#fbcfe8] rounded py-1.5 px-4 flex flex-col items-start min-w-[120px]">
              <span className="text-[13px] font-medium text-[#f472b6]">Deposit Count</span>
              <span className="text-[16px] font-black text-[#f472b6]">{totals.count}</span>
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto min-h-[150px]">
          <table className="w-full text-left bg-white">
            <thead>
              <tr className="bg-[#f8f9fa] border-b border-slate-200">
                <th className="px-6 py-4 w-12"><input type="checkbox" className="rounded border-slate-300" /></th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#68adbb] uppercase tracking-wider">T. DATE</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#68adbb] uppercase tracking-wider">CUSTOMER</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#68adbb] uppercase tracking-wider">BRANCH</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#68adbb] uppercase tracking-wider">AMOUNT</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#68adbb] uppercase tracking-wider">SOURCE</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#68adbb] uppercase tracking-wider">STATUS</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#68adbb] uppercase tracking-wider">STAFF</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#68adbb] uppercase tracking-wider text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-fuchsia-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm font-bold text-slate-500">Loading transactions...</span>
                    </div>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr className="bg-white">
                  <td colSpan={9} className="px-6 py-8 text-center text-sm font-medium text-slate-400 italic">
                    No transactions recorded matching your filters.
                  </td>
                </tr>
              ) : (
                records.map((rec, i) => (
                  <tr key={rec.id || i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4"><input type="checkbox" className="rounded border-slate-300" /></td>
                    <td className="px-6 py-4 text-[13px] font-bold text-slate-700">
                      {new Date(rec.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-[13px] font-bold text-slate-900">
                      {rec.customers ? `${rec.customers.first_name} ${rec.customers.last_name}` : "Unknown"}
                    </td>
                    <td className="px-6 py-4 text-[13px] font-medium text-slate-600">
                      {rec.branches?.name || "Global"}
                    </td>
                    <td className="px-6 py-4 text-[13px] font-black text-slate-900">
                      {Number(rec.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-[13px] font-medium text-slate-500">Manual</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        rec.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {rec.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[13px] font-medium text-slate-600">
                      {rec.employees ? `${rec.employees.first_name} ${rec.employees.last_name}` : "System"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="px-3 py-1 bg-white border border-slate-600 rounded text-[11px] font-bold text-slate-800 hover:bg-slate-100">Review</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
