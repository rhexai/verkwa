"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function ClientActivityPage() {
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    transactions: [] as any[],
    customer: null as any
  });
  const [filterType, setFilterType] = useState("All");

  useEffect(() => {
    async function fetchActivity() {
      const email = user?.primaryEmailAddress?.emailAddress;
      if (!email) return setLoading(false);

      try {
        const { data: customer } = await supabase
          .from('customers')
          .select('*')
          .eq('email', email)
          .single();

        if (customer) {
          const { data: txs } = await supabase
            .from('transactions')
            .select('*, employees(first_name, last_name)')
            .eq('customer_id', customer.id)
            .order('created_at', { ascending: false });

          setData({ transactions: txs || [], customer });
        }
      } catch (err) {
        console.error("Error fetching activity:", err);
      } finally {
        setLoading(false);
      }
    }

    if (isLoaded) fetchActivity();
  }, [user, isLoaded]);

  const role = (user?.publicMetadata?.role as string) || "client";
  const isStaff = ["Administrator", "Manager", "Operator", "Mobilizer", "admin", "superadmin", "employee"].includes(role);

  const filteredTransactions = data.transactions.filter(tx => 
    filterType === "All" ? true : tx.type === filterType
  );

  const exportCSV = () => {
    const headers = ["ID", "Date", "Type", "Amount", "Staff", "Status"];
    const rows = filteredTransactions.map(tx => [
      tx.id,
      new Date(tx.created_at).toLocaleString(),
      tx.type,
      tx.amount,
      tx.employees ? `${tx.employees.first_name} ${tx.employees.last_name}` : "System",
      tx.status || "Completed"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers, ...rows].map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `verkwa_activity_${data.customer?.account_num}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isLoaded || loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-10 pb-20 font-sans animate-in fade-in duration-700">
      
      {/* Navigation Tabs */}
      <div className="flex items-center gap-8 border-b border-slate-100 pb-1">
        {[
          { name: "Overview", href: "/dashboard" },
          { name: "Requests", href: "/dashboard/client/requests" },
          { name: "Activity", href: "/dashboard/client/activity" },
          { name: "Profile", href: "/dashboard/client/profile" }
        ].map((tab) => (
          <Link
            key={tab.name}
            href={tab.href}
            className={`pb-4 text-[13px] font-bold border-b-2 transition-all ${
              tab.name === "Activity" 
                ? "border-accent text-slate-900" 
                : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-200"
            }`}
          >
            {tab.name}
          </Link>
        ))}
      </div>

      {isStaff && (
        <div className="bg-accent rounded-2xl p-6 text-white flex items-center justify-between shadow-lg">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
              </div>
              <div>
                 <p className="text-[14px] font-bold tracking-tight leading-none mb-1">Staff context active</p>
                 <p className="text-[11px] font-bold text-white/40 tracking-widest uppercase">Viewing client-facing portal</p>
              </div>
           </div>
           <Link href="/dashboard" className="px-6 py-2.5 bg-white text-slate-900 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all uppercase tracking-widest">
              Exit portal
           </Link>
        </div>
      )}
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-1">
          <h1 className="text-[32px] font-bold text-slate-900 tracking-tight leading-none">Account ledger</h1>
          <p className="text-slate-400 font-bold text-[11px] tracking-widest uppercase">{data.customer?.account_num}</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={exportCSV}
            className="px-6 py-3 bg-white border border-slate-200 rounded-full text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            Export
          </button>
          <Link 
            href="/dashboard/client/requests"
            className="px-6 py-3 bg-accent text-white rounded-full font-bold text-xs hover:bg-accent/90 transition-all flex items-center gap-2 shadow-xl shadow-slate-200"
          >
             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
             New Request
          </Link>
        </div>
      </div>

      {/* Filter Section */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-2">
            {["All", "Deposit", "Withdrawal", "Loan", "Commission"].map(t => (
              <button 
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-8 py-2 rounded-full text-[12px] font-bold transition-all whitespace-nowrap ${
                  filterType === t 
                  ? "bg-accent text-white shadow-lg shadow-green-100" 
                  : "bg-white text-slate-400 border border-slate-100 hover:text-slate-600"
                }`}
              >
                {t}
              </button>
            ))}
      </div>

      {/* Transactions Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
               <tr className="bg-slate-50/50">
                 <th className="px-8 py-5 text-[11px] font-bold text-slate-400 tracking-widest uppercase">Transaction</th>
                 <th className="px-8 py-5 text-[11px] font-bold text-slate-400 tracking-widest uppercase">Classification</th>
                 <th className="px-8 py-5 text-[11px] font-bold text-slate-400 tracking-widest uppercase">Amount</th>
                 <th className="px-8 py-5 text-[11px] font-bold text-slate-400 tracking-widest uppercase">Agent</th>
                 <th className="px-8 py-5 text-[11px] font-bold text-slate-400 tracking-widest text-right uppercase">Status</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTransactions.length === 0 ? (
                <tr>
                   <td colSpan={5} className="px-8 py-32 text-center text-slate-300 font-bold tracking-widest text-[11px]">
                      No matching records found
                   </td>
                </tr>
              ) : (
                filteredTransactions.map((tx, i) => (
                  <tr key={tx.id || i} className="group hover:bg-slate-50/80 transition-colors">
                    <td className="px-8 py-6">
                       <p className="text-[14px] font-bold text-slate-900 tracking-tight mb-1">#{tx.id.slice(0,8).toUpperCase()}</p>
                       <p className="text-[11px] font-bold text-slate-400 tracking-widest uppercase">{new Date(tx.created_at).toLocaleDateString([], { day: '2-digit', month: 'short' })} • {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </td>
                    <td className="px-8 py-6">
                       <span className={`px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${tx.type === 'Deposit' ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-600'}`}>
                         {tx.type || 'Standard'}
                       </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <p className={`text-[18px] font-bold tracking-tight text-slate-900`}>
                          ₵ {Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                       </p>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[11px] font-bold text-slate-500">
                            {tx.employees?.first_name?.[0] || 'S'}
                          </div>
                          <p className="text-[13px] font-bold text-slate-700">{tx.employees ? `${tx.employees.first_name} ${tx.employees.last_name}` : "System Kernel"}</p>
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest ${tx.status === 'Failed' ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-400'}`}>
                          <span className="mr-1 inline-block w-1 h-1 rounded-full bg-current" />
                          {tx.status || "Verified"}
                       </span>
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
