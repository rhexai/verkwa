"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthSync } from "@/lib/hooks/useAuthSync";
import Link from "next/link";

export default function GeneratePage() {
  const { resolvedRole, isSyncing } = useAuthSync();
  const role = (resolvedRole || "").toLowerCase();
  const isAdmin = ["administrator", "admin", "superadmin"].includes(role);

  const [generating, setGenerating] = useState(false);
  const [reportType, setReportType] = useState("customers");
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [format, setFormat] = useState("csv");

  const reportTypes = [
    { id: "customers", name: "Client Database", description: "Full export of registered customers and balances", icon: "users" },
    { id: "transactions", name: "Transaction Ledger", description: "Complete history of all successful transactions", icon: "receipt" },
    { id: "revenue", name: "Revenue Summary", description: "Breakdown of commissions and profit margins", icon: "banknote" },
    { id: "performance", name: "Staff Performance", description: "Mobilizer and operator collection metrics", icon: "trending-up" },
  ];

  const handleGenerate = async () => {
    setGenerating(true);
    // Simulate generation delay
    setTimeout(async () => {
      try {
        let data: any[] = [];
        let filename = `verkwa_${reportType}_${new Date().toISOString().split('T')[0]}`;

        if (reportType === 'customers') {
          const { data: res } = await supabase.from('customers').select('*, branches(name)');
          data = res || [];
        } else if (reportType === 'transactions') {
          const { data: res } = await supabase.from('transactions').select('*, customers(first_name, last_name, account_num), employees(first_name, last_name)');
          data = res || [];
        }

        if (data.length === 0) {
          alert("No data found for the selected parameters.");
          setGenerating(false);
          return;
        }

        // Export logic
        const csvContent = "data:text/csv;charset=utf-8," + 
          Object.keys(data[0]).join(",") + "\n" + 
          data.map(row => Object.values(row).map(val => `"${val}"`).join(",")).join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${filename}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

      } catch (err) {
        console.error("Export error:", err);
      } finally {
        setGenerating(false);
      }
    }, 1500);
  };

  if (!isAdmin && !isSyncing) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-6">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center">
           <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <h1 className="text-xl font-bold text-slate-900">Access Restricted</h1>
        <p className="text-slate-500 text-sm font-medium">Generation tools are restricted to administrators only.</p>
        <Link href="/dashboard" className="px-6 py-2 bg-slate-900 text-white rounded-full font-bold text-xs">Return to Terminal</Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto pb-20 space-y-10 font-sans animate-in fade-in duration-700">
      
      {/* Navigation Tabs */}
      <div className="flex items-center gap-8 border-b border-slate-100 pb-1">
        {[
          { name: "Highlight", href: "/dashboard/reports" },
          { name: "Generate", href: "/dashboard/generate" },
        ].map((tab) => (
          <Link
            key={tab.name}
            href={tab.href}
            className={`pb-4 text-[13px] font-bold border-b-2 transition-all ${
              tab.name === "Generate" 
                ? "border-accent text-slate-900" 
                : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-200"
            }`}
          >
            {tab.name}
          </Link>
        ))}
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
        <div className="space-y-1">
          <h1 className="text-[32px] font-bold text-slate-900 tracking-tight leading-none">File system</h1>
          <p className="text-slate-400 font-bold text-[11px] tracking-widest">Select file to extract data assets</p>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left: Report Selection */}
        <div className="lg:col-span-2 space-y-6">
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {reportTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setReportType(type.id)}
                  className={`p-8 text-left border-2 rounded-3xl transition-all space-y-6 relative overflow-hidden group ${
                    reportType === type.id 
                    ? "border-accent bg-accent/5 shadow-xl shadow-accent/5" 
                    : "border-slate-100 bg-white hover:border-slate-200"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                    reportType === type.id ? "bg-accent text-white" : "bg-slate-50 text-slate-400 group-hover:bg-slate-900 group-hover:text-white"
                  }`}>
                     {type.id === 'customers' && <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="19" cy="11" r="4"/></svg>}
                     {type.id === 'transactions' && <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>}
                     {type.id === 'revenue' && <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
                     {type.id === 'performance' && <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-[16px] font-bold text-slate-900 tracking-tight">{type.name}</h3>
                    <p className="text-[12px] font-medium text-slate-400 leading-relaxed tracking-tight">{type.description}</p>
                  </div>
                  {reportType === type.id && (
                    <div className="absolute top-4 right-4">
                       <div className="w-5 h-5 bg-accent rounded-full flex items-center justify-center text-white">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                       </div>
                    </div>
                  )}
                </button>
              ))}
           </div>
        </div>

        {/* Right: Configuration */}
        <div className="space-y-8">
           <div className="bg-white border border-slate-200 p-10 rounded-3xl shadow-sm space-y-10">
              <h2 className="text-[13px] font-bold text-slate-400 tracking-widest">Configuration</h2>
              
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-900 tracking-widest">Timeframe interval</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <p className="text-[9px] font-bold text-slate-300">Start</p>
                       <input 
                         type="date" 
                         value={dateRange.start}
                         onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                         className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:outline-none focus:border-accent transition-all"
                       />
                    </div>
                    <div className="space-y-2">
                       <p className="text-[9px] font-bold text-slate-300">End</p>
                       <input 
                         type="date" 
                         value={dateRange.end}
                         onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                         className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:outline-none focus:border-accent transition-all"
                       />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-900 tracking-widest">Output format</label>
                  <div className="flex gap-3">
                    {["csv", "pdf", "json"].map((f) => (
                      <button
                        key={f}
                        onClick={() => setFormat(f)}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          format === f ? "bg-slate-900 text-white shadow-lg" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="w-full py-5 bg-accent text-white font-bold text-[11px] tracking-widest rounded-2xl shadow-xl shadow-accent/20 hover:bg-accent/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {generating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                      Generate
                    </>
                  )}
                </button>
              </div>
           </div>


        </div>

      </div>

    </div>
  );
}
