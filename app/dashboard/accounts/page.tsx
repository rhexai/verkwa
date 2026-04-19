"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AccountsPage() {
  const tabs = ["CUSTOMERS", "ACCOUNTS LIST", "ACCOUNT TYPES", "ACCOUNT MODES"];
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCustomers() {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          employees (
            first_name,
            last_name
          )
        `);
      
      if (error) {
        console.error("Error fetching customers:", error);
      } else {
        setRecords(data || []);
      }
      setLoading(false);
    }

    fetchCustomers();
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto pb-20">
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
            placeholder="Search by surname or account" 
            className="w-72 px-4 py-2 bg-white border border-slate-300 rounded text-sm focus:outline-none focus:border-slate-400 placeholder:text-slate-400"
          />
          <Link href="/dashboard/accounts/add" className="px-4 py-2 bg-white border border-slate-300 rounded text-[13px] font-bold text-slate-700 hover:bg-slate-50 transition-colors uppercase">
            ADD CUSTOMER
          </Link>
        </div>

        {/* Records Header */}
        <div className="px-6 py-4 flex items-center justify-between">
          <h3 className="text-[14px] font-black tracking-wide text-slate-900">{records.length} RECORDS</h3>
          <div className="flex items-center gap-4">
            <select className="px-3 py-1.5 bg-white border border-slate-300 rounded text-[13px] font-medium text-slate-700 focus:outline-none">
              <option>Today</option>
            </select>
            <select className="px-3 py-1.5 bg-white border border-slate-300 rounded text-[11px] text-slate-500 focus:outline-none">
              <option>Branches</option>
            </select>
            <div className="bg-[#fce5c8] px-4 py-1.5 rounded text-[#925f27] text-xs font-bold">Show: 10</div>
            <div className="w-8 h-4 rounded-full bg-[#fde6ce]"></div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[150px]">
          <table className="w-full text-left bg-white">
            <thead>
              <tr className="bg-[#f8f9fa] border-y border-slate-200">
                <th className="px-6 py-4 w-12"><input type="checkbox" className="rounded border-slate-300" /></th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#68adbb] uppercase tracking-wider">PHOTO</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#68adbb] uppercase tracking-wider">ACCOUNT #</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#68adbb] uppercase tracking-wider">LAST NAME</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#68adbb] uppercase tracking-wider">FIRST NAME</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#68adbb] uppercase tracking-wider">
                  ADDED BY<br/><span className="text-[10px] text-[#86bfca] lowercase font-semibold">staff</span>
                </th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#68adbb] uppercase tracking-wider">STATUS</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#68adbb] uppercase tracking-wider text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-[#c14a42] border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm font-bold text-slate-500">Loading customers...</span>
                    </div>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400 font-medium italic">
                    No customers found in your database.
                  </td>
                </tr>
              ) : (
                records.map((rec, i) => (
                  <tr key={rec.id || i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4"><input type="checkbox" className="rounded border-slate-300" /></td>
                    <td className="px-6 py-4">
                      {rec.photo_url ? (
                        <img src={rec.photo_url} alt="User" className="w-10 h-10 rounded border border-slate-200 object-cover" />
                      ) : (
                        <div className="w-10 h-10 border border-slate-200 shadow-sm rounded flex items-center justify-center bg-white text-blue-500">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-[14px] text-slate-800">{rec.account_num}</td>
                    <td className="px-6 py-4 font-medium text-[14px] text-slate-800">{rec.last_name}</td>
                    <td className="px-6 py-4 font-medium text-[14px] text-slate-800">{rec.first_name}</td>
                    <td className="px-6 py-4 font-medium text-[14px] text-slate-800">
                      {rec.employees ? `${rec.employees.first_name} ${rec.employees.last_name}` : "System"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[11px] font-bold uppercase ${rec.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-slate-50 text-slate-500 border border-slate-200'}`}>
                        {rec.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="px-3 py-1.5 bg-white border border-slate-600 rounded text-[12px] font-medium text-slate-800 hover:bg-slate-100 transition-colors">Manage</button>
                        <button className="px-3 py-1.5 bg-white border border-slate-600 rounded text-[12px] font-medium text-slate-800 hover:bg-slate-100 transition-colors">Edit</button>
                        <button className="px-3 py-1.5 bg-white border border-slate-600 rounded text-[12px] font-medium text-slate-800 hover:bg-slate-100 transition-colors">Delete</button>
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
