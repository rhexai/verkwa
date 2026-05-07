"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthSync } from "@/lib/hooks/useAuthSync";
import { useUser } from "@clerk/nextjs";

export default function LedgersPage() {
  const tabs = ["Income", "Expenses", "Banking", "Investments"];
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    amount: "",
    type: "Commission",
    details: "",
    branch_id: "",
    customer_id: "",
    created_at: new Date().toISOString().split('T')[0]
  });

  const { user } = useUser();
  const { resolvedRole, employeeId: hookEmployeeId, isSyncing } = useAuthSync();

  async function fetchLedgers() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          branches (name)
        `)
        .ilike('deposit_by', 'INCOME%') // Strictly only show manual income/admin entries
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

  useEffect(() => {
    if (!isSyncing) fetchLedgers();
  }, [page, isSyncing]);

  useEffect(() => {
    async function fetchMetadata() {
      const { data: bData } = await supabase.from('branches').select('*');
      const { data: cData } = await supabase.from('customers').select('id, first_name, last_name, account_num').order('last_name');
      setBranches(bData || []);
      setCustomers(cData || []);
      if (bData?.[0]) setFormData(prev => ({ ...prev, branch_id: bData[0].id }));
    }
    fetchMetadata();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      let finalEmployeeId = hookEmployeeId;

      // Fallback: If hook hasn't resolved yet, try direct fetch
      if (!finalEmployeeId && user) {
        const email = user.primaryEmailAddress?.emailAddress;
        const { data } = await supabase.from('employees').select('id').eq('email', email).single();
        if (data) finalEmployeeId = data.id;
      }

      // Proceed even if employee ID isn't found to avoid blocking the workflow
      const { error } = await supabase.from('transactions').insert([{
        amount: Number(formData.amount),
        type: 'Deposit', 
        deposit_by: `INCOME | ${formData.type}: ${formData.details}`,
        branch_id: formData.branch_id,
        staff_id: finalEmployeeId || null,
        customer_id: formData.customer_id || null,
        created_at: new Date(formData.created_at).toISOString(),
        status: 'completed'
      }]);

      if (error) throw error;
      setIsModalOpen(false);
      setFormData({ 
        amount: "", 
        type: "Commission", 
        details: "", 
        branch_id: branches[0]?.id || "",
        customer_id: "",
        created_at: new Date().toISOString().split('T')[0]
      });
      fetchLedgers();
    } catch (err: any) {
      alert("System Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

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
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-2.5 bg-[#2EB67D] text-white rounded-full font-bold text-xs hover:bg-[#259465] transition-all shadow-md shadow-slate-200"
          >
            Register Income
          </button>
        </div>

        <div className="px-8 py-4 border-b border-slate-50 min-h-[40px]">
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
                       <span className="text-xs font-bold text-slate-400">Querying ledger...</span>
                    </div>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr className="bg-white">
                  <td colSpan={7} className="px-10 py-20 text-center text-[11px] font-bold text-slate-300 tracking-widest">
                    No ledger entries
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

      {/* Register Income Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-500">
           <div className="bg-white w-full max-w-lg border border-slate-100 shadow-2xl rounded-3xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-10 space-y-10">
                 <div className="flex items-center justify-between border-b border-slate-50 pb-8">
                    <h2 className="text-[24px] font-bold text-slate-900 tracking-tight leading-none">Register Income</h2>
                    <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 border border-slate-100 rounded-full flex items-center justify-center text-slate-300 hover:border-slate-900 hover:text-slate-900 transition-all font-bold text-lg">✕</button>
                 </div>

                 <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-900 tracking-widest uppercase">Transaction Amount (₵)</label>
                       <input 
                         type="number" 
                         required
                         value={formData.amount}
                         onChange={(e) => setFormData({...formData, amount: e.target.value})}
                         placeholder="0.00"
                         className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-[20px] font-bold text-slate-900 focus:outline-none focus:border-accent transition-all placeholder:text-slate-200"
                       />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-slate-900 tracking-widest uppercase">Associated Customer</label>
                           <select 
                             value={formData.customer_id}
                             onChange={(e) => setFormData({...formData, customer_id: e.target.value})}
                             className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:outline-none focus:border-accent transition-all appearance-none"
                           >
                              <option value="">General (No Customer)</option>
                              {customers.map(c => <option key={c.id} value={c.id}>{c.last_name}, {c.first_name} ({c.account_num})</option>)}
                           </select>
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-slate-900 tracking-widest uppercase">Registration Date</label>
                           <input 
                             type="date"
                             value={formData.created_at}
                             onChange={(e) => setFormData({...formData, created_at: e.target.value})}
                             className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:outline-none focus:border-accent transition-all"
                           />
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-slate-900 tracking-widest uppercase">Income Type</label>
                           <select 
                             value={formData.type}
                             onChange={(e) => setFormData({...formData, type: e.target.value})}
                             className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:outline-none focus:border-accent transition-all appearance-none"
                           >
                              <option>Commission</option>
                              <option>Service Fee</option>
                              <option>Interest</option>
                              <option>Other Income</option>
                           </select>
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-slate-900 tracking-widest uppercase">Target Branch</label>
                           <select 
                             value={formData.branch_id}
                             onChange={(e) => setFormData({...formData, branch_id: e.target.value})}
                             className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:outline-none focus:border-accent transition-all appearance-none"
                           >
                              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                           </select>
                        </div>
                     </div>

                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-900 tracking-widest uppercase">Description / Details</label>
                       <textarea 
                         value={formData.details}
                         onChange={(e) => setFormData({...formData, details: e.target.value})}
                         placeholder="Provide context for this entry..."
                         className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] font-medium text-slate-600 focus:outline-none focus:border-accent transition-all placeholder:text-slate-200 h-24 resize-none"
                       />
                    </div>

                    <button 
                      type="submit"
                      disabled={submitting || !formData.amount}
                      className="w-full py-5 bg-[#2EB67D] text-white font-bold text-[11px] tracking-widest uppercase rounded-2xl shadow-xl shadow-green-100 hover:bg-[#259465] transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                       {submitting ? "Processing entry..." : "Save ENTRY"}
                    </button>
                 </form>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
