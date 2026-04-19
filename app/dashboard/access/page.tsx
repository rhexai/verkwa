"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AccessControlPage() {
  const tabs = ["STAFF", "ROLES", "PERMISSIONS", "ASSIGN PERMISSION"];
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEmployees() {
      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          branches (
            name
          )
        `);
      
      if (error) {
        console.error("Error fetching employees:", error);
      } else {
        setRecords(data || []);
      }
      setLoading(false);
    }

    fetchEmployees();
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
          <div className="flex items-center gap-3">
            <Link href="/dashboard/access/add" className="px-4 py-2 bg-white border border-slate-300 rounded text-[13px] font-bold text-slate-700 hover:bg-slate-50 transition-colors uppercase">
              ADD EMPLOYEE
            </Link>
            <select className="px-3 py-2 bg-white border border-slate-300 rounded text-[13px] text-slate-600 focus:outline-none">
              <option>Bulk Action</option>
            </select>
          </div>
        </div>

        {/* Records Header */}
        <div className="px-6 py-4 flex items-center justify-between">
          <h3 className="text-[14px] font-black tracking-wide text-slate-900">{records.length} RECORDS</h3>
          <div className="flex items-center gap-4">
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
                <th className="px-6 py-4 text-[12px] font-bold text-[#68adbb] uppercase tracking-wider">IMAGE</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#68adbb] uppercase tracking-wider">NAME</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#68adbb] uppercase tracking-wider">EMAIL</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#68adbb] uppercase tracking-wider">MAIN ROLE</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#68adbb] uppercase tracking-wider">BRANCH</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#68adbb] uppercase tracking-wider">STATUS</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#68adbb] uppercase tracking-wider text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-plus-jakarta-sans">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-fuchsia-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm font-bold text-slate-500">Loading staff...</span>
                    </div>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400 font-medium italic">
                    No staff records found.
                  </td>
                </tr>
              ) : (
                records.map((rec, i) => (
                  <tr key={rec.id || i} className="hover:bg-slate-50 transition-colors bg-white">
                    <td className="px-6 py-4"><input type="checkbox" className="rounded border-slate-300" /></td>
                    <td className="px-6 py-4">
                      <div className="w-10 h-10 bg-white border border-slate-200 shadow-sm rounded-md flex items-center justify-center text-blue-500 overflow-hidden">
                        {rec.image_url ? (
                          <img src={rec.image_url} alt="Staff" className="w-full h-full object-cover" />
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-[14px] text-slate-800">{rec.first_name} {rec.last_name}</td>
                    <td className="px-6 py-4 font-medium text-[14px] text-slate-600">{rec.email}</td>
                    <td className="px-6 py-4 text-[14px] font-medium text-slate-600 italic uppercase tracking-tighter">{rec.role}</td>
                    <td className="px-6 py-4 text-[13px] font-medium">
                      {rec.branches?.name ? (
                        <span className="bg-slate-100 px-2.5 py-1 rounded border border-slate-200 text-slate-700 font-bold whitespace-nowrap">
                          {rec.branches.name}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Global Admin</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`w-11 h-6 rounded-full flex items-center p-1 transition-all pointer-events-none ${rec.status ? 'bg-green-600 justify-end' : 'bg-slate-300 justify-start'}`}>
                        <div className="w-4 h-4 bg-white rounded-full shadow-md" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="px-3 py-1.5 bg-white border border-slate-600 rounded text-[11px] font-bold text-slate-800 hover:bg-slate-100 transition-colors uppercase">Manage</button>
                        <button className="px-3 py-1.5 bg-white border border-slate-600 rounded text-[11px] font-bold text-slate-800 hover:bg-slate-100 transition-colors uppercase">settings</button>
                        <button className="px-3 py-1.5 bg-white border border-slate-600 rounded text-[11px] font-bold text-slate-800 hover:bg-slate-100 transition-colors uppercase">more...</button>
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
