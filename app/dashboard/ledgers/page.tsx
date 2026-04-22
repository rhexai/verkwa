"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LedgersPage() {
  const tabs = ["Income", "Expenses", "Banking", "Investments"];
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;

  useEffect(() => {
    async function fetchLedgers() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('transactions')
          .select(`
            *,
            branches (name)
          `)
          .neq('type', 'Deposit')
          .neq('type', 'Withdrawal')
          .order('created_at', { ascending: false })
          .range(page * limit, (page + 1) * limit - 1);
        
        if (error) throw error;
        const txs = data || [];
        setRecords(txs);
        setHasMore(txs.length === limit);
      } catch (err) {
        console.error("Error fetching ledgers:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchLedgers();
  }, [page]);

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
              placeholder="Search ledgers..." 
              className="w-72 pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-full text-xs focus:outline-none focus:border-accent/30 transition-all placeholder:text-slate-300"
            />
          </div>
          <button className="px-6 py-2.5 bg-[#2EB67D] text-white rounded-full font-bold text-xs hover:bg-[#259465] transition-all shadow-md shadow-slate-200">
            Register Income
          </button>
        </div>

        {/* Records Header */}
        <div className="px-8 py-4 flex items-center justify-between border-b border-slate-50">
          <h3 className="text-[11px] font-bold text-slate-400 tracking-widest">
            {records.length} Verified ledger logs
          </h3>
          <div className="flex items-center gap-2">
             <span className="text-[10px] font-bold text-slate-400">Limit: 10</span>
             <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[150px]">
          <table className="w-full text-left bg-white">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-[11px] font-bold text-slate-400 tracking-widest">Type</th>
                <th className="px-8 py-4 text-[11px] font-bold text-slate-400 tracking-widest text-right">Amount</th>
                <th className="px-8 py-4 text-[11px] font-bold text-slate-400 tracking-widest">Branch</th>
                <th className="px-8 py-4 text-[11px] font-bold text-slate-400 tracking-widest">Date</th>
                <th className="px-8 py-4 text-[11px] font-bold text-slate-400 tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                       <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                       <span className="text-xs font-bold text-slate-400">Querying ledger mainframe...</span>
                    </div>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr className="bg-white">
                  <td colSpan={7} className="px-10 py-20 text-center text-[11px] font-black text-slate-300 tracking-widest italic">
                    No ledger entries registered in active buffer.
                  </td>
                </tr>
              ) : (
                records.map((rec, i) => (
                  <tr key={rec.id || i} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-8 py-4">
                        <div className="flex flex-col gap-1.5">
                           <span className={`w-fit px-2.5 py-1 rounded-full text-[10px] font-bold ${rec.type === 'Deposit' ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400'}`}>
                              {rec.type}
                           </span>
                           <span className={`w-fit px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                              rec.status === 'approved' || rec.status === 'ok' || rec.status === 'completed' 
                                ? 'bg-green-50 text-green-500' 
                                : rec.status === 'denied' || rec.status === 'rejected'
                                ? 'bg-red-50 text-red-500'
                                : 'bg-slate-50 text-slate-400'
                           }`}>
                              {rec.status || 'Pending'}
                           </span>
                        </div>
                    </td>
                    <td className="px-8 py-4 text-right">
                        <p className="text-[16px] font-bold text-slate-900 tracking-tight">₵ {Number(rec.amount).toFixed(2)}</p>
                    </td>
                    <td className="px-8 py-4">
                        <p className="text-[13px] font-bold text-slate-400 capitalize">{rec.branches?.name || "Main"}</p>
                    </td>
                    <td className="px-8 py-4">
                        <p className="text-[13px] font-bold text-slate-800 leading-none mb-1">
                           {new Date(rec.created_at).toLocaleDateString([], { day: '2-digit', month: 'short' })}
                        </p>
                        <p className="text-[10px] font-semibold text-slate-400">
                           {new Date(rec.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <button className="px-4 py-1.5 bg-white border border-slate-200 rounded-full text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                        Audit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-6 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Page {page + 1}
          </p>
          <div className="flex gap-2">
            <button 
              disabled={page === 0 || loading}
              onClick={() => setPage(p => Math.max(0, p - 1))}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-all shadow-sm"
            >
              Previous
            </button>
            <button 
              disabled={!hasMore || loading}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-all shadow-sm"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
