"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ReportsPage() {
  const tabs = ["HIGHLIGHT", "GENERATE"];
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    depositTotal: 0,
    withdrawalTotal: 0,
    loanTotal: 0
  });

  useEffect(() => {
    async function fetchReportData() {
      const { data: txs, error } = await supabase
        .from('transactions')
        .select('amount, type');
      
      if (error) {
        console.error("Error fetching report data:", error);
      } else {
        let deposit = 0;
        let withdrawal = 0;
        let loan = 0;

        txs?.forEach(tx => {
          const amt = Number(tx.amount);
          if (tx.type === 'Deposit') deposit += amt;
          else if (tx.type === 'Withdrawal') withdrawal += amt;
          // Note: Loans aren't fully modeled in the schema yet, but prepared for expansion
        });

        setReportData({
          depositTotal: deposit,
          withdrawalTotal: withdrawal,
          loanTotal: loan
        });
      }
      setLoading(false);
    }

    fetchReportData();
  }, []);

  const charts = [
    { title: "Deposit", total: reportData.depositTotal.toFixed(2), subtitle: "Total deposit", hasData: reportData.depositTotal > 0, color: "bg-[#8ed3cd]" },
    { title: "Withdrawal", total: reportData.withdrawalTotal.toFixed(2), subtitle: "Total withdrawal", hasData: reportData.withdrawalTotal > 0, color: "bg-red-400" },
    { title: "Loan", total: reportData.loanTotal.toFixed(2), subtitle: "Total loan", hasData: reportData.loanTotal > 0, color: "bg-amber-400" }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto pb-20 space-y-6">
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

        {/* Highlight Summary Banner */}
        <div className="p-6">
          <div className="flex items-center gap-4">
            {/* Multi-colored bar mini-icon */}
            <div className="flex items-end gap-[3px] h-8">
              <div className="w-2.5 h-4 bg-green-600 rounded-sm"></div>
              <div className="w-2.5 h-6 bg-red-600 rounded-sm"></div>
              <div className="w-2.5 h-8 bg-blue-600 rounded-sm"></div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight leading-tight">Daily Business Summary Report</h2>
              <p className="text-[14px] font-bold text-slate-800">Date: today</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {charts.map((chart, i) => (
          <div key={i} className="bg-white border border-[#e5e7eb] rounded-xl shadow-sm flex flex-col h-[340px]">
            <div className="p-5 flex items-start justify-between">
              <h3 className="text-[15px] font-bold text-[#68adbb]">{chart.title}</h3>
              <select className="px-3 py-1 bg-white border border-slate-300 rounded text-[13px] text-slate-600 focus:outline-none">
                <option>today</option>
              </select>
            </div>

            <div className="px-6 flex flex-col items-end">
              <span className="text-2xl font-black text-slate-800 leading-none">
                {loading ? "..." : chart.total}
              </span>
              <span className="text-[11px] font-semibold text-[#68adbb] mt-1">{chart.subtitle}</span>
            </div>

            {/* Mock Chart Area */}
            <div className="relative flex-1 border-l border-b border-slate-200 flex items-end ml-10 mr-6 mt-4 pb-1">
              <div className="absolute -left-7 inset-y-0 flex flex-col justify-between text-[10px] text-[#94a3b8] py-1">
                {chart.hasData ? (
                  <><span>30</span><span>25</span><span>20</span><span>15</span><span>10</span><span>5</span><span>0</span></>
                ) : (
                  <><span>1.0</span><span>0.8</span><span>0.6</span><span>0.4</span><span>0.2</span><span>0</span></>
                )}
              </div>
              
              <div className="absolute inset-0 flex flex-col justify-between py-1 z-0 pointer-events-none">
                {[...Array(6)].map((_, idx) => <div key={idx} className="w-full border-t border-slate-100" />)}
              </div>

              {chart.hasData && (
                <div className="relative z-10 w-full flex items-end justify-center gap-[2px] h-full pr-16">
                  <div className={`w-14 ${chart.color} h-full`} />
                </div>
              )}
              
              {/* x-axis dates */}
              <div className="absolute -bottom-6 w-full flex justify-between text-[10px] text-slate-400 px-2">
                <span>30 Mar 26</span><span>06 Apr 26</span><span>13 Apr 26</span><span>20 Apr 26</span><span>27 Apr 26</span>
              </div>
            </div>

            <div className="bg-[#f8f9fa] mt-8 px-6 py-3 border-t border-slate-100 rounded-b-xl">
              <span className="text-[14px] font-bold text-[#68adbb]">Insight</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
