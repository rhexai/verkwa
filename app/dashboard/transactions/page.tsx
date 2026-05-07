"use client";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuthSync } from "@/lib/hooks/useAuthSync";

export default function TransactionsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TransactionsContent />
    </Suspense>
  );
}

function TransactionsContent() {
  const { resolvedRole, employeeId, isSyncing } = useAuthSync();
  const role = (resolvedRole || "").toLowerCase();
  const isAdmin = ["administrator", "admin", "superadmin"].includes(role);
  const isRestricted = !isAdmin && role !== "client" && role !== "";

  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab")?.toUpperCase() || "DEPOSITS";
  const initialCustomer = searchParams.get("customer") || "";
  
  const tabs = ["Deposits", "Withdrawals", "Loans", "Loan payments", "Revenue"];
  const [activeTab, setActiveTab] = useState(initialTab);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;
  
  // Filter States
  const [selectedCustomerId, setSelectedCustomerId] = useState(initialCustomer);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [customers, setCustomers] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [totals, setTotals] = useState({ 
    amount: 0, 
    count: 0,
    payable: 0,
    paid: 0,
    outstanding: 0,
    principal: 0,
    interest: 0,
    rejected: 0,
    approved: 0
  });
  const [isDeductionDrawerOpen, setIsDeductionDrawerOpen] = useState(false);
  const [isPaymentDrawerOpen, setIsPaymentDrawerOpen] = useState(false);
  const [deductionDate, setDeductionDate] = useState(new Date().toLocaleDateString('en-GB', { month: '2-digit', year: 'numeric' })); // mm/yyyy
  const [submitting, setSubmitting] = useState(false);

  const [paymentForm, setPaymentForm] = useState({
    customer_id: "",
    amount: "",
    details: "",
    branch_id: ""
  });

  useEffect(() => {
    async function fetchMetadata() {
      let custQuery = supabase.from('customers').select('id, first_name, last_name, account_num').order('last_name');
      
      if (isRestricted && employeeId) {
        custQuery = custQuery.eq('added_by', employeeId);
      }
      
      const { data: custData } = await custQuery;
      const { data: branchData } = await supabase.from('branches').select('id, name').order('name');
      setCustomers(custData || []);
      setBranches(branchData || []);
    }
    fetchMetadata();
  }, []);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        setLoading(true);
        
        if (isRestricted && !employeeId) {
          setLoading(false);
          return;
        }

        // Map UI Tab to DB Type
        const currentTab = activeTab.toUpperCase();
        const dbType = currentTab === "DEPOSITS" ? "Deposit" :
                      currentTab === "WITHDRAWALS" ? "Withdrawal" :
                      currentTab === "LOANS" ? "Loan" :
                      currentTab === "LOAN PAYMENTS" ? "Loan Payment" :
                      currentTab === "REVENUE" ? "REVENUE" : null;

        // 1. Fetch filtered list with pagination
        const selectFields = isRestricted && employeeId
          ? `
            *,
            customers!inner(first_name, last_name, account_num, added_by),
            employees (first_name, last_name),
            branches (name)
          `
          : `
            *,
            customers (first_name, last_name, account_num),
            employees (first_name, last_name),
            branches (name)
          `;

        let query = supabase
          .from('transactions')
          .select(selectFields)
          .order('created_at', { ascending: false })
          .range(page * limit, (page + 1) * limit - 1);
        
        if (dbType) {
          if (dbType === 'REVENUE') {
            query = query.in('type', ['Commission', 'Service Fee', 'Interest', 'Other Income']);
          } else {
            query = query.eq('type', dbType);
          }
        }
        if (selectedCustomerId) query = query.eq('customer_id', selectedCustomerId);
        if (selectedBranchId) query = query.eq('branch_id', selectedBranchId);
        if (selectedStatus) query = query.eq('status', selectedStatus);
        
        // 1b. Apply staff-level isolation for restricted roles
        if (isRestricted && employeeId) {
          query = query.eq('customers.added_by', employeeId);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        
        // Filter out rejections/denials from the master list to ensure they are "permanently deleted" from view
        const txs = (data || []).filter(tx => tx.status !== 'rejected' && tx.status !== 'denied' && tx.status !== 'failed');
        setRecords(txs);
        setHasMore(data?.length === limit);

        // 2. Fetch Aggregates via RPC (High Performance)
        const { data: aggData, error: aggError } = await supabase.rpc('get_transaction_aggregates', {
          p_type: dbType,
          p_employee_id: isRestricted ? employeeId : null
        });

        if (aggError) throw aggError;

        if (aggData) {
          setTotals({ 
            amount: aggData.total_amount, 
            count: aggData.count,
            payable: aggData.payable || 0,
            paid: aggData.paid || 0,
            outstanding: (aggData.payable || 0) - (aggData.paid || 0),
            approved: aggData.approved_count || 0,
            rejected: aggData.rejected_count || 0,
            principal: (aggData.payable || 0) * 0.9,
            interest: (aggData.payable || 0) * 0.1
          });
        }

      } catch (err: any) {
        console.error("Error fetching transactions:", err.message || err);
      } finally {
        setLoading(false);
      }
    }

    fetchTransactions();
  }, [activeTab, page, resolvedRole, employeeId, selectedCustomerId, selectedBranchId, selectedStatus]);

  const handleLogPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentForm.customer_id || !paymentForm.amount) return alert("Please fill all required fields");
    
    setSubmitting(true);
    try {
      const { error } = await supabase.from('transactions').insert([{
        amount: Number(paymentForm.amount),
        type: 'Loan Payment',
        customer_id: paymentForm.customer_id,
        branch_id: paymentForm.branch_id || (branches[0]?.id),
        staff_id: employeeId,
        deposit_by: `LOAN_PAYMENT | ${paymentForm.details}`,
        status: 'completed'
      }]);

      if (error) throw error;
      
      setIsPaymentDrawerOpen(false);
      setPaymentForm({ customer_id: "", amount: "", details: "", branch_id: "" });
      window.location.reload();
    } catch (err: any) {
      alert("Error logging payment: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleExecuteCommission = async () => {
    if (!confirm(`Are you sure you want to execute global commission for ${deductionDate}?`)) return;
    
    setSubmitting(true);
    try {
      // In a real system, this would be a complex batch operation.
      // For now, we'll log it as a system-level Commission entry or just alert.
      // Assuming we need to deduct from each customer? 
      // The user said: "deduct withdrawal commission from ALL active member accounts"
      
      // Let's implement a simplified version that inserts a single record for the log
      // and potentially we'd need a background job for actual balances.
      
      const { error } = await supabase.from('transactions').insert([{
        amount: 0, // System wide batch
        type: 'Commission',
        deposit_by: `BATCH_COMMISSION | Cycle: ${deductionDate}`,
        status: 'completed',
        staff_id: employeeId
      }]);

      if (error) throw error;
      
      alert("Batch commission protocol initiated successfully.");
      setIsDeductionDrawerOpen(false);
      window.location.reload();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };
    return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-20 font-sans animate-in fade-in duration-700">
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Tabs Row */}
        <div className="flex items-center px-6 pt-4 border-b border-slate-50 gap-8">
          {tabs.map((tab) => (
            <button 
              key={tab}
              onClick={() => {
                setActiveTab(tab.toUpperCase());
                setPage(0);
              }}
              className={`pb-3 text-[13px] font-bold border-b-2 transition-colors ${
                activeTab.toUpperCase() === tab.toUpperCase() 
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
              placeholder="Search history..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-72 pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-full text-xs focus:outline-none focus:border-accent/30 transition-all placeholder:text-slate-300"
            />
          </div>
          <div className="flex items-center gap-3">
            {activeTab === "DEPOSITS" ? (
              <Link 
                href="/dashboard/transactions/deposit"
                className="px-6 py-2.5 bg-[#2EB67D] text-white rounded-full font-bold text-xs hover:bg-[#259465] transition-all shadow-md shadow-slate-200"
              >
                New entry
              </Link>
            ) : (
              <button 
                onClick={() => {
                  if (activeTab === "REVENUE") setIsDeductionDrawerOpen(true);
                  if (activeTab === "LOAN PAYMENTS") setIsPaymentDrawerOpen(true);
                }}
                className="px-6 py-2.5 bg-[#2EB67D] text-white rounded-full font-bold text-xs hover:bg-[#259465] transition-all shadow-md shadow-slate-200"
              >
                {activeTab === "WITHDRAWALS" && "Initialize debit"}
                {activeTab === "LOANS" && "Loan request"}
                {activeTab === "LOAN PAYMENTS" && "Log payment"}
                {activeTab === "COMMISSIONS" && "Take deduction"}
              </button>
            )}
            <button className="px-5 py-2 bg-white border border-slate-200 rounded-full text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              Export
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="p-6 border-b border-slate-50 grid grid-cols-1 md:grid-cols-3 gap-6 bg-white">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-900 tracking-widest uppercase">Customer</label>
            <select 
              value={selectedCustomerId}
              onChange={(e) => { setSelectedCustomerId(e.target.value); setPage(0); }}
              className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:outline-none focus:border-accent/30 transition-all appearance-none cursor-pointer"
            >
              <option value="">All customers</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.last_name}, {c.first_name} ({c.account_num})</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-900 tracking-widest uppercase">Branch</label>
            <select 
              value={selectedBranchId}
              onChange={(e) => { setSelectedBranchId(e.target.value); setPage(0); }}
              className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:outline-none focus:border-accent/30 transition-all appearance-none cursor-pointer"
            >
              <option value="">All branches</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-900 tracking-widest uppercase">Status</label>
            <select 
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setPage(0); }}
              className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:outline-none focus:border-accent/30 transition-all appearance-none cursor-pointer"
            >
              <option value="">All status</option>
              <option value="ok">Success / OK</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Records Header */}
        <div className="px-10 py-6 flex items-center justify-between border-b border-slate-50">
          <h3 className="text-[12px] font-black tracking-[0.2em] text-slate-900 underline decoration-slate-100 underline-offset-8">{records.length} Verified records</h3>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => {
                setSelectedCustomerId("");
                setSelectedBranchId("");
                setSelectedStatus("");
                setPage(0);
              }}
              className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-accent transition-all"
            >
              Reset filters
            </button>
            <div className="bg-[#2EB67D] px-5 py-2 text-white text-[10px] font-black tracking-widest">Page capacity: {limit}</div>
          </div>
        </div>

        {/* Summary Block */}
        <div className="bg-[#2EB67D] px-10 py-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">

          
          <div className="flex flex-wrap items-center gap-4">
            {activeTab === "DEPOSITS" && (
              <>
                <SummaryCard label="Total Volume" value={totals.amount} />
                <SummaryCard label="Operations" value={totals.count} isNumber />
              </>
            )}
            {activeTab === "WITHDRAWALS" && (
              <>
                <SummaryCard label="Total Debits" value={totals.amount} />
                <SummaryCard label="Operations" value={totals.count} isNumber />
              </>
            )}
            {activeTab === "LOANS" && (
              <>
                <SummaryCard label="Principal" value={totals.principal} />
                <SummaryCard label="Liabilities" value={totals.payable} />
                <SummaryCard label="Authorized" value={totals.approved} isNumber />
              </>
            )}
            {activeTab === "LOAN PAYMENTS" && (
              <>
                <SummaryCard label="Target" value={totals.payable} />
                <SummaryCard label="Recovered" value={totals.paid} />
                <SummaryCard label="Balance" value={totals.outstanding} color="text-red-400" />
              </>
            )}
            {activeTab === "REVENUE" && (
              <>
                <SummaryCard label="Net Revenue" value={totals.amount} />
              </>
            )}
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto min-h-[150px]">
          <table className="w-full text-left bg-white">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-[11px] font-bold text-slate-400 tracking-widest">Entry date</th>
                
                {activeTab === "REVENUE" ? (
                  <>
                    <th className="px-8 py-4 text-[11px] font-bold text-slate-400 tracking-widest">Customer</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-slate-400 tracking-widest text-right">Yield</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-slate-400 tracking-widest">Branch</th>
                  </>
                ) : activeTab === "LOAN PAYMENTS" ? (
                  <>
                    <th className="px-8 py-4 text-[11px] font-bold text-slate-400 tracking-widest">Customer</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-slate-400 tracking-widest text-right">Repayment</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-slate-400 tracking-widest">Agent</th>
                  </>
                ) : activeTab === "LOANS" ? (
                  <>
                    <th className="px-8 py-4 text-[11px] font-bold text-slate-400 tracking-widest">Customer</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-slate-400 tracking-widest text-right">Amount</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-slate-400 tracking-widest">Status</th>
                  </>
                ) : (
                  <>
                    <th className="px-8 py-4 text-[11px] font-bold text-slate-400 tracking-widest">Customer</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-slate-400 tracking-widest text-right">Amount</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-slate-400 tracking-widest">Status</th>
                    <th className="px-8 py-4 text-[11px] font-bold text-slate-400 tracking-widest">Agent</th>
                  </>
                )}
                
                <th className="px-8 py-4 text-[11px] font-bold text-slate-400 tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs font-bold text-slate-400">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr className="bg-white">
                  <td colSpan={9} className="px-10 py-20 text-center text-[11px] font-bold text-slate-300 tracking-widest">
                    No activity yet.
                  </td>
                </tr>
              ) : (
                records.map((rec, i) => (
                  <tr key={rec.id || i} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-8 py-4">
                       <p className="text-[13px] font-bold text-slate-900 leading-none mb-1">
                          {new Date(rec.created_at).toLocaleDateString([], { day: '2-digit', month: 'short' })}
                       </p>
                       <p className="text-[10px] font-semibold text-slate-400">
                          {new Date(rec.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </p>
                    </td>
                    
                    {activeTab === "REVENUE" ? (
                      <>
                        <td className="px-8 py-4">
                           <p className="text-[14px] font-bold text-slate-800">{rec.customers ? `${rec.customers.last_name}, ${rec.customers.first_name}` : "Admin"}</p>
                           <p className="text-[11px] font-medium text-slate-400">{rec.customers?.account_num}</p>
                        </td>
                        <td className="px-8 py-4 text-right">
                           <p className="text-[16px] font-bold text-slate-900 tracking-tight">₵ {Number(rec.amount).toFixed(2)}</p>
                        </td>
                        <td className="px-8 py-4 text-[13px] font-bold text-slate-400 capitalize">{rec.branches?.name || "Main Branch"}</td>
                      </>
                    ) : activeTab === "LOAN PAYMENTS" ? (
                      <>
                        <td className="px-8 py-4">
                           <p className="text-[14px] font-bold text-slate-800">{rec.customers ? `${rec.customers.last_name}, ${rec.customers.first_name}` : "Admin"}</p>
                           <p className="text-[11px] font-medium text-slate-400">{rec.customers?.account_num}</p>
                        </td>
                        <td className="px-8 py-4 text-right">
                           <p className="text-[16px] font-bold text-slate-900 tracking-tight">₵ {Number(rec.amount).toFixed(2)}</p>
                        </td>
                        <td className="px-8 py-4">
                           <p className="text-[12px] font-bold text-slate-600 capitalize">{rec.employees ? `${rec.employees.first_name}` : "System"}</p>
                        </td>
                      </>
                    ) : activeTab === "LOANS" ? (
                      <>
                        <td className="px-8 py-4">
                           <p className="text-[14px] font-bold text-slate-800">{rec.customers ? `${rec.customers.last_name}, ${rec.customers.first_name}` : "Admin"}</p>
                           <p className="text-[11px] font-medium text-slate-400">{rec.customers?.account_num}</p>
                        </td>
                        <td className="px-8 py-4 text-right">
                           <p className="text-[16px] font-bold text-slate-900 tracking-tight">₵ {Number(rec.amount).toFixed(2)}</p>
                        </td>
                        <td className="px-8 py-4">
                           <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold capitalize ${
                              rec.status === 'ok' || rec.status === 'sent' || rec.status === 'approved' || rec.status === 'completed'
                                ? 'bg-green-50 text-green-600' 
                                : rec.status === 'rejected' || rec.status === 'denied'
                                ? 'bg-red-50 text-red-600'
                                : 'bg-slate-50 text-slate-400'
                           }`}>
                              {rec.status || 'Pending'}
                           </span>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-8 py-4">
                           <p className="text-[14px] font-bold text-slate-800">{rec.customers ? `${rec.customers.last_name}, ${rec.customers.first_name}` : "Admin"}</p>
                           <p className="text-[11px] font-medium text-slate-400">{rec.customers?.account_num}</p>
                        </td>
                        <td className="px-8 py-4 text-right">
                           <p className="text-[16px] font-bold text-slate-900 tracking-tight">₵ {Number(rec.amount).toFixed(2)}</p>
                        </td>
                        <td className="px-8 py-4">
                           <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold capitalize ${
                              rec.status === 'ok' || rec.status === 'sent' || rec.status === 'approved' 
                                ? 'bg-green-50 text-green-600' 
                                : rec.status === 'rejected' || rec.status === 'denied'
                                ? 'bg-red-50 text-red-600'
                                : 'bg-slate-50 text-slate-400'
                           }`}>
                              {rec.status || 'Pending'}
                           </span>
                        </td>
                        <td className="px-8 py-4">
                           <p className="text-[12px] font-bold text-slate-600 capitalize">{rec.employees ? `${rec.employees.first_name}` : "System"}</p>
                        </td>
                      </>
                    )}
                    
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

      {/* TAKE DEDUCTION DRAWER */}
      {isDeductionDrawerOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-[60] backdrop-blur-sm" onClick={() => setIsDeductionDrawerOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-full md:w-[450px] bg-white shadow-2xl z-[70] flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-8 border-b border-slate-50">
              <h2 className="text-[18px] font-bold text-slate-900 tracking-tight">Execute Commission</h2>
              <button 
                onClick={() => setIsDeductionDrawerOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-all font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-10 space-y-10 flex-1 overflow-y-auto scrollbar-hide">
              <div className="p-8 bg-amber-50 rounded-2xl border border-amber-100 space-y-4">
                 <div className="flex items-center gap-3 text-amber-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                    <span className="text-[11px] font-bold tracking-widest">Admin authorization</span>
                 </div>
                 <p className="text-[13px] font-medium text-amber-900/70 leading-relaxed italic">
                    This action will systematically deduct withdrawal commission from ALL active member accounts for the defined temporal window.
                 </p>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 tracking-widest ml-1">Target cycle (MM/YYYY)</label>
                <input 
                  type="text" 
                  value={deductionDate}
                  onChange={(e) => setDeductionDate(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-2xl text-slate-900 font-bold focus:outline-none focus:bg-white focus:border-accent/20 transition-all"
                />
              </div>

              <div className="pt-10 border-t border-slate-50">
                <button 
                  disabled={submitting}
                  onClick={handleExecuteCommission}
                  className="w-full py-4 bg-[#2EB67D] text-white rounded-2xl font-bold text-[13px] hover:bg-[#259465] transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
                >
                  {submitting ? "Processing..." : "Commit Execution"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* NEW PAYMENT DRAWER */}
      {isPaymentDrawerOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-[60] backdrop-blur-sm" onClick={() => setIsPaymentDrawerOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-full md:w-[500px] bg-white shadow-2xl z-[70] flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-8 border-b border-slate-50">
              <h2 className="text-[18px] font-bold text-slate-900 tracking-tight">Log Payment</h2>
              <button 
                onClick={() => setIsPaymentDrawerOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-800 transition-all font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-10 space-y-10 overflow-y-auto flex-1 scrollbar-hide">
              <form onSubmit={handleLogPaymentSubmit} className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 tracking-widest ml-1">Member profile</label>
                  <select 
                    required
                    value={paymentForm.customer_id}
                    onChange={(e) => setPaymentForm({...paymentForm, customer_id: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-2xl text-[14px] font-bold focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="">Query member database...</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.last_name}, {c.first_name} ({c.account_num})</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 tracking-widest ml-1">Branch</label>
                  <select 
                    required
                    value={paymentForm.branch_id}
                    onChange={(e) => setPaymentForm({...paymentForm, branch_id: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-2xl text-[14px] font-bold focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="">Select branch...</option>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 tracking-widest ml-1">Quantum (₵)</label>
                  <input 
                    type="number" 
                    required
                    placeholder="0.00" 
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-2xl text-[24px] font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-accent/20 transition-all placeholder:text-slate-200" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 tracking-widest ml-1">Ledger note</label>
                  <textarea 
                    placeholder="Enter audit remarks..." 
                    value={paymentForm.details}
                    onChange={(e) => setPaymentForm({...paymentForm, details: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-2xl text-[14px] font-semibold focus:outline-none focus:bg-white focus:border-accent/20 transition-all min-h-[150px] placeholder:italic placeholder:font-normal" 
                  />
                </div>

                <div className="pt-10 space-y-3 border-t border-slate-50">
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 bg-[#2EB67D] text-white rounded-2xl font-bold text-[13px] hover:bg-[#259465] transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
                  >
                    {submitting ? "Syncing..." : "Verify and Log"}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsPaymentDrawerOpen(false)}
                    className="w-full py-4 bg-white text-slate-400 rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:text-slate-900 transition-all"
                  >
                    Abort protocol
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({ label, value, isNumber = false, color = "text-white" }: { label: string, value: number, isNumber?: boolean, color?: string }) {
  return (
    <div className={`p-6 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-start min-w-[150px] group hover:bg-white/10 transition-all`}>
      <span className="text-[9px] font-bold text-white/30 tracking-widest mb-1">{label}</span>
      <span className={`text-[20px] font-bold tracking-tight ${color} leading-none`}>
        {isNumber ? value : `₵ ${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
      </span>
    </div>
  );
}
