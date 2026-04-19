"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SmsPage() {
  const tabs = ["SMS USAGE", "CONTROL", "TOP UP"];
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSmsUsage() {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          customers (
            first_name,
            last_name
          )
        `);
      
      if (error) {
        console.error("Error fetching SMS usage:", error);
      } else {
        setRecords(data || []);
      }
      setLoading(false);
    }

    fetchSmsUsage();
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
        </div>

        {/* Records Header */}
        <div className="px-6 py-4 flex items-center justify-between">
          <h3 className="text-[14px] font-black tracking-wide text-slate-900">{records.length} RECORDS</h3>
          <div className="flex items-center gap-4">
            <select className="px-3 py-1.5 bg-white border border-slate-300 rounded text-[13px] font-medium text-slate-700 focus:outline-none">
              <option>Today</option>
            </select>
            <div className="bg-[#fce5c8] px-4 py-1.5 rounded text-[#925f27] text-xs font-bold">Show: 10</div>
            <div className="w-8 h-4 rounded-full bg-[#fde6ce]"></div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#f8f9fa] border-y border-slate-200">
                <th className="px-6 py-4 w-12"><input type="checkbox" className="rounded border-slate-300" /></th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#68adbb] uppercase tracking-wider">NUMBER</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#68adbb] uppercase tracking-wider">DATE</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#68adbb] uppercase tracking-wider">TRANSACTION</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#68adbb] uppercase tracking-wider">STATUS</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#68adbb] uppercase tracking-wider text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-plus-jakarta-sans">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-fuchsia-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm font-bold text-slate-500">Loading SMS logs...</span>
                    </div>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium italic">
                    No SMS activity found.
                  </td>
                </tr>
              ) : (
                records.map((rec, i) => (
                  <tr key={rec.id || i} className="hover:bg-slate-50 transition-colors bg-white">
                    <td className="px-6 py-4"><input type="checkbox" className="rounded border-slate-300" /></td>
                    <td className="px-6 py-4 font-bold text-[14px] text-slate-800 tracking-tighter">0591200344</td>
                    <td className="px-6 py-4 font-medium text-[14px] text-slate-800">
                      {new Date(rec.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-[14px] text-slate-600">{rec.type}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded text-[10px] font-black uppercase ${
                        rec.status === 'sent' ? 'bg-[#b1eccd] text-[#1e8b54]' : 'bg-[#fcd0cf] text-[#bc2e2a]'
                      }`}>
                        {rec.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end">
                        <button className="px-3 py-1.5 bg-white border border-slate-600 rounded text-[11px] font-bold text-slate-800 hover:bg-slate-100 transition-colors uppercase">Review</button>
                      </div>
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
