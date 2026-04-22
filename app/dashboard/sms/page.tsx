"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SmsPage() {
  const tabs = ["Sms usage", "Control", "Top up"];
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
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-20 font-sans">
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

        {/* Actions Row */}
        <div className="p-6 flex items-center justify-between border-b border-slate-50 bg-slate-50/50">
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
               <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <input 
              type="text" 
              placeholder="Search SMS logs..." 
              className="w-72 pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-full text-xs focus:outline-none focus:border-accent/30 transition-all placeholder:text-slate-300"
            />
          </div>
          <div className="flex items-center gap-3">
             <button className="px-5 py-2 bg-slate-900 text-white rounded-full font-bold text-xs hover:bg-black transition-all shadow-md shadow-slate-200">
                Purchase Credits
             </button>
          </div>
        </div>

        {/* Records Header */}
        <div className="px-8 py-4 flex items-center justify-between border-b border-slate-50">
          <h3 className="text-[11px] font-bold text-slate-400 tracking-widest">{records.length} SMS protocol logs</h3>
          <div className="flex items-center gap-3">
             <span className="text-[10px] font-bold text-slate-400">Filter: Today</span>
             <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-[11px] font-bold text-slate-400 tracking-widest">Recipient</th>
                <th className="px-8 py-4 text-[11px] font-bold text-slate-400 tracking-widest">Timestamp</th>
                <th className="px-8 py-4 text-[11px] font-bold text-slate-400 tracking-widest">Trigger type</th>
                <th className="px-8 py-4 text-[11px] font-bold text-slate-400 tracking-widest">Status</th>
                <th className="px-8 py-4 text-[11px] font-bold text-slate-400 tracking-widest text-right">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-plus-jakarta-sans">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs font-bold text-slate-400">Syncing with SMS gateway...</span>
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
                  <tr key={rec.id || i} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-8 py-4 font-bold text-[14px] text-slate-900 tracking-tight">0591200344</td>
                    <td className="px-8 py-4">
                        <p className="text-[13px] font-bold text-slate-900 leading-none mb-1">
                           {new Date(rec.created_at).toLocaleDateString([], { day: '2-digit', month: 'short' })}
                        </p>
                        <p className="text-[10px] font-semibold text-slate-400">
                           {new Date(rec.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </td>
                    <td className="px-8 py-4 font-bold text-[13px] text-slate-400 tracking-tight">{rec.type}</td>
                    <td className="px-8 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        rec.status === 'sent' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-400'
                      }`}>
                        {rec.status || 'Deferred'}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <button className="px-4 py-1.5 bg-white border border-slate-200 rounded-full text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                        Details
                      </button>
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
