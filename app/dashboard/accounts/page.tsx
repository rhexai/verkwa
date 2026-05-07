"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthSync } from "@/lib/hooks/useAuthSync";

export default function AccountsPage() {
  const { resolvedRole, employeeId, isSyncing } = useAuthSync();
  const role = (resolvedRole || "").toLowerCase();
  const isAdmin = ["administrator", "admin", "superadmin"].includes(role);
  const isRestricted = !isAdmin && role !== "client" && role !== "";

  const tabs = ["Customers"];
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;

  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [customerTransactions, setCustomerTransactions] = useState<any[]>([]);
  const [fetchingTxs, setFetchingTxs] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (isDrawerOpen && selectedCustomer) {
      const fetchTxs = async () => {
        setFetchingTxs(true);
        const { data } = await supabase
          .from('transactions')
          .select(`
            *,
            employees (
              first_name,
              last_name
            )
          `)
          .eq('customer_id', selectedCustomer.id)
          .order('created_at', { ascending: false })
          .limit(10);
        
        setCustomerTransactions(data || []);
        setFetchingTxs(false);
      };
      fetchTxs();
    } else {
      setCustomerTransactions([]);
    }
  }, [isDrawerOpen, selectedCustomer]);

  useEffect(() => {
    async function fetchCustomers() {
      try {
        setLoading(true);
        let query = supabase
          .from('customers')
          .select(`
            *,
            employees (
              first_name,
              last_name
            )
          `)
          .order('created_at', { ascending: false })
          .range(page * limit, (page + 1) * limit - 1);

        if (isRestricted && employeeId) {
          query = query.eq('added_by', employeeId);
        }

        const { data, error } = await query;
        
        if (error) throw error;
        
        const custs = data || [];
        setRecords(custs);
        setHasMore(custs.length === limit);
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCustomers();
  }, [page, resolvedRole, employeeId]);
  
  const handleCustomerDelete = async () => {
    if (!selectedCustomer) return;
    if (!isAdmin) {
      alert("Unauthorized: Only administrators can delete customer records.");
      return;
    }
    
    if (!window.confirm(`Are you sure you want to PERMANENTLY delete ${selectedCustomer.first_name} ${selectedCustomer.last_name}? This will remove all their transaction history and cannot be undone.`)) return;
    
    setDeleting(true);
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', selectedCustomer.id);
      
    if (error) {
      if (error.code === '23503') {
        alert("Cannot delete this customer because they have transaction records. You must delete their transactions first, or simply deactivate their account status.");
      } else {
        alert("Error deleting customer: " + error.message);
      }
    } else {
      setIsDrawerOpen(false);
      // Refresh the page
      setRecords(prev => prev.filter(r => r.id !== selectedCustomer.id));
    }
    setDeleting(false);
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
        <div className="p-6 flex items-center justify-between bg-slate-50/50">
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
               <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <input 
              type="text" 
              placeholder="Search customers or accounts..." 
              className="w-80 pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-full text-xs focus:outline-none focus:border-accent/30 transition-all placeholder:text-slate-300"
            />
          </div>
          <Link href="/dashboard/accounts/add" className="px-6 py-2.5 bg-slate-900 text-white rounded-full font-bold text-xs hover:bg-black transition-all shadow-md shadow-slate-200">
            Add Client
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[150px]">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-[11px] font-bold text-slate-400 tracking-widest">ID</th>
                <th className="px-8 py-4 text-[11px] font-bold text-slate-400 tracking-widest">Account #</th>
                <th className="px-8 py-4 text-[11px] font-bold text-slate-400 tracking-widest">Customer name</th>
                <th className="px-8 py-4 text-[11px] font-bold text-slate-400 tracking-widest">Status</th>
                <th className="px-8 py-4 text-[11px] font-bold text-slate-400 tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading || isSyncing ? (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs font-bold text-slate-400">Querying database...</span>
                    </div>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-10 py-20 text-center text-slate-300 font-black tracking-widest text-[11px] italic">
                    No customer yet.
                  </td>
                </tr>
              ) : (
                records.map((rec, i) => (
                  <tr key={rec.id || i} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-8 py-4">
                      <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 overflow-hidden shadow-sm">
                        {rec.photo_url ? (
                          <img src={rec.photo_url} alt="User" className="w-full h-full object-cover grayscale transition-all duration-500 hover:grayscale-0" />
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-4 font-bold text-[14px] text-slate-900 tracking-tight">{rec.account_num}</td>
                    <td className="px-8 py-4">
                       <p className="font-bold text-[14px] text-slate-900">{rec.last_name} {rec.first_name}</p>
                       <p className="text-[11px] font-medium text-slate-400">Handled by {rec.employees ? rec.employees.first_name : "System"}</p>
                    </td>
                    <td className="px-8 py-4">
                       <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${rec.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400'}`}>
                          <span className={`mr-1.5 inline-block w-1.5 h-1.5 rounded-full ${rec.status === 'Active' ? 'bg-green-500' : 'bg-slate-300'}`} />
                          {rec.status}
                       </span>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center justify-end gap-2 text-right">
                        <button 
                          onClick={() => {
                            setSelectedCustomer(rec);
                            setIsDrawerOpen(true);
                          }}
                          className="px-4 py-1.5 bg-white border border-slate-200 rounded-full text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                        >
                          View
                        </button>
                        <Link 
                          href={`/dashboard/accounts/add?id=${rec.id}`}
                          className="px-4 py-1.5 bg-white border border-slate-200 rounded-full text-[11px] font-bold text-slate-400 hover:border-slate-900 hover:text-slate-900 transition-all shadow-sm"
                        >
                          Edit
                        </Link>
                      </div>
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

      {/* DRAWER SIDEBAR FOR CUSTOMER SUMMARY */}
      {isDrawerOpen && selectedCustomer && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-slate-900/20 z-[60] backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
          
          {/* Sidebar */}
          <div className="fixed right-0 top-0 h-full w-full md:w-[480px] bg-white shadow-2xl z-[70] flex flex-col animate-in slide-in-from-right duration-300 overflow-hidden">
            <div className="flex items-center justify-between p-8 border-b border-slate-50">
              <h2 className="text-[18px] font-bold text-slate-900 tracking-tight">Customer Dossier</h2>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-800 transition-all font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-10 flex-1 overflow-y-auto space-y-10 scrollbar-hide">
              
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-24 h-24 bg-slate-50 border border-slate-100 rounded-full overflow-hidden shadow-sm">
                  {selectedCustomer.photo_url ? (
                    <img src={selectedCustomer.photo_url} className="w-full h-full object-cover grayscale transition-all hover:grayscale-0 duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-200">
                       <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                    </div>
                  )}
                </div>
                <div>
                   <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{selectedCustomer.first_name} {selectedCustomer.last_name}</h3>
                   <p className="text-xs font-bold text-slate-400 tracking-[0.2em] mt-1">{selectedCustomer.account_num}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 tracking-widest">Account status</span>
                  <p className="text-[14px] font-bold text-slate-900">{selectedCustomer.status}</p>
                </div>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 tracking-widest">Growth plan</span>
                  <p className="text-[14px] font-bold text-slate-900">{selectedCustomer.account_type || "Susu core"}</p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-50">
                <div className="flex items-center justify-between pb-4 border-b border-slate-50 group">
                  <span className="text-[10px] font-bold text-slate-400 tracking-widest">Contact entry</span>
                  <span className="text-[13px] font-bold text-slate-900">{selectedCustomer.email || "No email logged"}</span>
                </div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-50 group">
                  <span className="text-[10px] font-bold text-slate-400 tracking-widest">Telephone</span>
                  <span className="text-[13px] font-bold text-slate-900">{selectedCustomer.phone || "No phone logged"}</span>
                </div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-50 group">
                  <span className="text-[10px] font-bold text-slate-400 tracking-widest">Account origin</span>
                  <span className="text-[13px] font-bold text-slate-900">{selectedCustomer.employees ? `${selectedCustomer.employees.first_name}` : "System Root"}</span>
                </div>
              </div>

              <div className="space-y-6 pt-6 border-t border-slate-50">
                <div className="flex items-center justify-between">
                  <h4 className="text-[13px] font-bold text-slate-800 tracking-widest">Recent activity</h4>
                  <Link href={`/dashboard/transactions?customer=${selectedCustomer.id}`} className="text-[10px] font-bold text-accent hover:underline">Full activities ›</Link>
                </div>

                <div className="space-y-3 min-h-[100px]">
                  {fetchingTxs ? (
                    <div className="flex items-center justify-center py-10">
                       <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : customerTransactions.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100 text-slate-300 font-bold text-[10px] tracking-widest px-10">
                      No transaction entries found for this lifecycle.
                    </div>
                  ) : (
                    customerTransactions.map((tx, i) => (
                      <div key={tx.id || i} className="group p-4 bg-white border border-slate-100 rounded-2xl hover:border-accent/10 hover:shadow-md transition-all flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold shadow-sm ${tx.type === 'Deposit' ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-500'}`}>
                            {tx.type?.[0]}
                          </div>
                          <div>
                            <p className="text-[13px] font-bold text-slate-900 leading-none mb-1">{tx.type}</p>
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-tighter">
                               {new Date(tx.created_at).toLocaleDateString([], { day: '2-digit', month: 'short' })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-[14px] font-bold tracking-tight text-slate-900`}>
                            ₵ {Number(tx.amount).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-10 pb-20">
                <button 
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-[13px] hover:bg-black transition-all shadow-xl shadow-slate-200"
                >
                  Close
                </button>
                
                {isAdmin && (
                  <button 
                    onClick={handleCustomerDelete}
                    disabled={deleting}
                    className="w-full mt-4 py-4 bg-white border border-red-100 text-red-500 rounded-2xl font-bold text-[13px] hover:bg-red-50 transition-all disabled:opacity-50"
                  >
                    {deleting ? "Deleting..." : "Delete Customer Record"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
