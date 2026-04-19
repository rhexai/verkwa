"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function BusinessDataPage() {
  const tabs = ["BRANCHES", "COMPLAINTS"];
  const regions = ["Greater Accra", "Ashanti", "Central", "Eastern", "Northern", "Western", "Volta", "Upper East", "Upper West", "Bono", "Bono East", "Ahafo", "Savannah", "North East", "Oti", "Western North"];
  
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    location: "",
    phone: "",
    region: ""
  });
  const [saving, setSaving] = useState(false);

  const fetchBranches = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('branches')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching branches:", error);
    } else {
      setRecords(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const { data, error } = await supabase
      .from('branches')
      .insert([
        { 
          name: formData.name,
          code: formData.code,
          location: formData.location,
          phone: formData.phone,
          region: formData.region
        }
      ]);

    if (error) {
      alert("Error saving branch: " + error.message);
    } else {
      setIsDrawerOpen(false);
      setFormData({ name: "", code: "", location: "", phone: "", region: "" });
      fetchBranches();
    }
    setSaving(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto relative">
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
            <button 
              onClick={() => setIsDrawerOpen(true)}
              className="px-4 py-2 bg-white border border-slate-300 rounded text-[13px] font-bold text-slate-700 hover:bg-slate-50 transition-colors uppercase"
            >
              ADD BRANCH
            </button>
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
                <th className="px-6 py-4 text-[12px] font-bold text-[#68adbb] uppercase tracking-wider">NAME</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#68adbb] uppercase tracking-wider">CODE</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#68adbb] uppercase tracking-wider">LOCATION</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#68adbb] uppercase tracking-wider">PHONE</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#68adbb] uppercase tracking-wider text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-[#c14a42] border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm font-bold text-slate-500">Loading branches...</span>
                    </div>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium italic">
                    No branches found. Click ADD BRANCH to begin.
                  </td>
                </tr>
              ) : (
                records.map((rec, i) => (
                  <tr key={rec.id || i} className="hover:bg-slate-50 transition-colors bg-white font-plus-jakarta-sans">
                    <td className="px-6 py-4"><input type="checkbox" className="rounded border-slate-300" /></td>
                    <td className="px-6 py-4 font-bold text-[14px] text-slate-800">{rec.name}</td>
                    <td className="px-6 py-4 font-bold text-[14px] text-slate-800">{rec.code}</td>
                    <td className="px-6 py-4 font-medium text-[14px] text-slate-800">{rec.location || "N/A"}</td>
                    <td className="px-6 py-4 font-medium text-[14px] text-slate-600">{rec.phone || "-"}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="px-3 py-1.5 bg-white border border-slate-600 rounded text-[12px] font-medium text-slate-800 hover:bg-slate-100 transition-colors">Manage</button>
                        <button className="px-3 py-1.5 bg-white border border-slate-600 rounded text-[12px] font-medium text-slate-800 hover:bg-slate-100 transition-colors uppercase">edit</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DRAWER SIDEBAR */}
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/30 z-[60] backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
          
          {/* Sidebar */}
          <div className="fixed right-0 top-0 h-full w-[400px] bg-white shadow-2xl z-[70] flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-[18px] font-black text-slate-900 uppercase tracking-tight">ADD BRANCH</h2>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-all font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-8 flex-1 overflow-y-auto space-y-8">
              <div className="relative group">
                <label className="absolute -top-2.5 left-3 bg-white px-1 text-[12px] text-slate-500 font-bold group-focus-within:text-fuchsia-600 transition-colors">branch name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-lg text-[15px] text-slate-800 font-medium focus:outline-none focus:border-fuchsia-400 transition-colors"
                  required
                />
              </div>

              <div className="relative group">
                <label className="absolute -top-2.5 left-3 bg-white px-1 text-[12px] text-slate-500 font-bold group-focus-within:text-fuchsia-600 transition-colors">branch code</label>
                <input 
                  type="text" 
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-lg text-[15px] text-slate-800 font-medium focus:outline-none focus:border-fuchsia-400 transition-colors"
                  required
                />
              </div>

              <div className="relative group">
                <label className="absolute -top-2.5 left-3 bg-white px-1 text-[12px] text-slate-500 font-bold group-focus-within:text-fuchsia-600 transition-colors">branch location</label>
                <input 
                  type="text" 
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-lg text-[15px] text-slate-800 font-medium focus:outline-none focus:border-fuchsia-400 transition-colors"
                />
              </div>

              <div className="relative group">
                <label className="absolute -top-2.5 left-3 bg-white px-1 text-[12px] text-slate-500 font-bold group-focus-within:text-fuchsia-600 transition-colors">branch phone</label>
                <input 
                  type="text" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-lg text-[15px] text-slate-800 font-medium focus:outline-none focus:border-fuchsia-400 transition-colors"
                />
              </div>

              <div className="relative group">
                <label className="absolute -top-2.5 left-3 bg-white px-1 text-[12px] text-slate-500 font-bold group-focus-within:text-fuchsia-600 transition-colors">region</label>
                <select 
                  value={formData.region}
                  onChange={(e) => setFormData({...formData, region: e.target.value})}
                  className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-lg text-[15px] text-slate-800 font-medium focus:outline-none focus:border-fuchsia-400 transition-colors appearance-none"
                >
                  <option value="">Select Region</option>
                  {regions.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>

              <div className="pt-4 pb-12">
                <button 
                  type="submit"
                  disabled={saving}
                  className="w-24 py-2 bg-black text-white text-[13px] font-bold uppercase tracking-wider rounded border border-black hover:bg-slate-800 transition-all disabled:bg-slate-400 disabled:border-slate-400 shadow-lg shadow-black/10 active:scale-95"
                >
                  {saving ? "..." : "SAVE"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
