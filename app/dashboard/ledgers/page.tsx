"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LedgersPage() {
  const tabs = ["INCOME", "EXPENSES", "BANKING", "INVESTMENTS"];
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLedgers() {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          branches (
            name
          )
        `);
      
      if (error) {
        console.error("Error fetching ledgers:", error);
      } else {
        setRecords(data || []);
      }
      setLoading(false);
    }

    fetchLedgers();
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto">
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
              ADD INCOME
            </button>
          </div>
        </div>

        {/* Records Header */}
        <div className="px-6 py-4 flex items-center justify-between">
          <h3 className="text-[14px] font-black tracking-wide text-slate-900">{records.length} RECORDS</h3>
          <div className="flex items-center gap-4">
            <div className="bg-[#fce5c8] px-4 py-1.5 rounded text-[#925f27] text-xs font-bold">Show: 10</div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[150px]">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#f8f9fa] border-y border-slate-200">
                <th className="px-6 py-4 w-12"><input type="checkbox" className="rounded border-slate-300" /></th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#68adbb] uppercase tracking-wider">#</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#68adbb] uppercase tracking-wider">ITEM</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#68adbb] uppercase tracking-wider">AMOUNT</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#68adbb] uppercase tracking-wider">BRANCH</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#68adbb] uppercase tracking-wider">EFFECTIVE</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#68adbb] uppercase tracking-wider text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-plus-jakarta-sans text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 font-bold italic animate-pulse">
                    Loading ledger data...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr className="bg-white">
                  <td colSpan={7} className="px-6 py-8 text-center text-sm font-medium text-slate-400">
                    No ledger entries available.
                  </td>
                </tr>
              ) : (
                records.map((rec, i) => (
                  <tr key={rec.id || i} className="hover:bg-slate-50 bg-white transition-colors">
                    <td className="px-6 py-4"><input type="checkbox" className="rounded border-slate-300" /></td>
                    <td className="px-6 py-4 font-bold text-slate-800">{i + 1}</td>
                    <td className="px-6 py-4 font-bold text-slate-700 uppercase tracking-tighter">{rec.type}</td>
                    <td className="px-6 py-4 font-black text-slate-900">{Number(rec.amount).toFixed(2)}</td>
                    <td className="px-6 py-4 font-medium text-slate-600">{rec.branches?.name || "Global"}</td>
                    <td className="px-6 py-4 font-medium text-slate-500">{new Date(rec.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="px-3 py-1 bg-white border border-slate-600 rounded text-[11px] font-bold text-slate-800 hover:bg-slate-100 uppercase transition-colors">Review</button>
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
