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

  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [editingBranch, setEditingBranch] = useState<any>(null);
  const [isManageDrawerOpen, setIsManageDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error("Error fetching branches:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const branchPayload = { 
        name: formData.name,
        code: formData.code,
        location: formData.location,
        phone: formData.phone,
        region: formData.region
      };

      let error;
      if (editingBranch) {
        const { error: updateError } = await supabase
          .from('branches')
          .update(branchPayload)
          .eq('id', editingBranch.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('branches')
          .insert([branchPayload]);
        error = insertError;
      }
  
      if (error) {
        console.error("Supabase Save Error:", error);
        alert("Error saving branch: " + (error.message || "Unknown database error"));
      } else {
        setIsDrawerOpen(false);
        setEditingBranch(null);
        setFormData({ name: "", code: "", location: "", phone: "", region: "" });
        fetchBranches();
      }
    } catch (err: any) {
      console.error("Unexpected Branch Save Error:", err);
      alert("Critical Error: " + (err.message || "Network request failed. Please check your connection or Supabase URL."));
    } finally {
      setSaving(false);
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
        <div className="p-6 flex items-center justify-between bg-slate-50/50">
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
               <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <input 
              type="text" 
              placeholder="Search branches..." 
              className="w-64 pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-full text-xs focus:outline-none focus:border-accent/30 transition-all placeholder:text-slate-300"
            />
          </div>
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="px-6 py-2.5 bg-[#2EB67D] text-white rounded-full font-bold text-xs hover:bg-[#259465] transition-all shadow-md shadow-slate-200"
          >
            Add branch
          </button>
        </div>

        {/* Records Header */}
        <div className="px-6 py-4 flex items-center justify-between">
          <h3 className="text-[14px] font-black tracking-wide text-slate-900">{records.length} records</h3>
          <div className="flex items-center gap-4">
            <div className="bg-[#fce5c8] px-4 py-1.5 rounded text-[#925f27] text-xs font-bold">Show: 10</div>
            <div className="w-8 h-4 rounded-full bg-[#fde6ce]"></div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-[11px] font-bold text-slate-400 tracking-widest">Branch name</th>
                <th className="px-8 py-4 text-[11px] font-bold text-slate-400 tracking-widest">Code</th>
                <th className="px-8 py-4 text-[11px] font-bold text-slate-400 tracking-widest">Location</th>
                <th className="px-8 py-4 text-[11px] font-bold text-slate-400 tracking-widest">Phone</th>
                <th className="px-8 py-4 text-[11px] font-bold text-slate-400 tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs font-bold text-slate-400">Loading branch records...</span>
                    </div>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium italic">
                    No branches found. Click Add branch to begin.
                  </td>
                </tr>
              ) : (
                records.map((rec, i) => (
                  <tr key={rec.id || i} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-8 py-4 font-bold text-[14px] text-slate-900">{rec.name}</td>
                    <td className="px-8 py-4 text-[13px] font-bold text-slate-500">{rec.code}</td>
                    <td className="px-8 py-4 text-[14px] font-medium text-slate-900">{rec.location || "N/A"}</td>
                    <td className="px-8 py-4 text-[13px] font-medium text-slate-400">{rec.phone || "-"}</td>
                    <td className="px-8 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => {
                            setSelectedBranch(rec);
                            setIsManageDrawerOpen(true);
                          }}
                          className="px-4 py-1.5 bg-white border border-slate-200 rounded-full text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                        >
                          Manage
                        </button>
                        <button 
                          onClick={() => {
                            setEditingBranch(rec);
                            setFormData({
                              name: rec.name,
                              code: rec.code,
                              location: rec.location || "",
                              phone: rec.phone || "",
                              region: rec.region || ""
                            });
                            setIsDrawerOpen(true);
                          }}
                          className="px-4 py-1.5 bg-white border border-slate-200 rounded-full text-[11px] font-bold text-slate-400 hover:border-slate-900 hover:text-slate-900 transition-all shadow-sm"
                        >
                          Edit
                        </button>
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
          <div className="fixed right-0 top-0 h-full w-full md:w-[450px] bg-white shadow-2xl z-[70] flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-8 border-b border-slate-50">
              <h2 className="text-[18px] font-bold text-slate-900 tracking-tight">
                {editingBranch ? "Edit branch" : "Add branch"}
              </h2>
              <button 
                onClick={() => {
                  setIsDrawerOpen(false);
                  setEditingBranch(null);
                  setFormData({ name: "", code: "", location: "", phone: "", region: "" });
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-all font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-10 flex-1 overflow-y-auto space-y-8 scrollbar-hide">
              
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 tracking-widest ml-1">Branch identity</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-2xl text-[15px] text-slate-800 font-bold focus:outline-none focus:bg-white focus:border-accent/20 transition-all placeholder:text-slate-300"
                  placeholder="Enter branch name..."
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 tracking-widest ml-1">Operational code</label>
                <input 
                  type="text" 
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-2xl text-[15px] text-slate-800 font-bold focus:outline-none focus:bg-white focus:border-accent/20 transition-all placeholder:text-slate-300"
                  placeholder="e.g. ACC-01"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 tracking-widest ml-1">Geographic location</label>
                <input 
                  type="text" 
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-2xl text-[15px] text-slate-800 font-bold focus:outline-none focus:bg-white focus:border-accent/20 transition-all placeholder:text-slate-300"
                  placeholder="Enter address..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 tracking-widest ml-1">Direct contact</label>
                <input 
                  type="text" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-2xl text-[15px] text-slate-800 font-bold focus:outline-none focus:bg-white focus:border-accent/20 transition-all placeholder:text-slate-300"
                  placeholder="Enter phone number..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 tracking-widest ml-1">Administrative region</label>
                <select 
                  value={formData.region}
                  onChange={(e) => setFormData({...formData, region: e.target.value})}
                  className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-2xl text-[15px] text-slate-800 font-bold focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="">Select region</option>
                  {regions.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div className="pt-8 pb-12">
                <button 
                  type="submit"
                  disabled={saving}
                  className="w-full py-4 bg-[#2EB67D] text-white rounded-2xl font-bold text-[13px] hover:bg-[#259465] transition-all disabled:opacity-50 shadow-xl shadow-slate-200"
                >
                  {saving ? "Processing..." : editingBranch ? "Save" : "Register branch"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* MANAGE DRAWER FOR BRANCH SUMMARY */}
      {isManageDrawerOpen && selectedBranch && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/30 z-[60] backdrop-blur-sm" onClick={() => setIsManageDrawerOpen(false)} />
          
          {/* Sidebar */}
          <div className="fixed right-0 top-0 h-full w-full md:w-[450px] bg-white shadow-2xl z-[70] flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-8 border-b border-slate-50">
              <h2 className="text-[18px] font-bold text-slate-900 tracking-tight">Manage Branch</h2>
              <button 
                onClick={() => setIsManageDrawerOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-all font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-10 flex-1 overflow-y-auto space-y-10 scrollbar-hide font-sans">
              
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/><path d="M12 3v6"/></svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">{selectedBranch.name}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">{selectedBranch.code}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Region</span>
                  <p className="text-[14px] font-bold text-slate-900">{selectedBranch.region || "Not assigned"}</p>
                </div>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Zone</span>
                  <p className="text-[14px] font-bold text-slate-900">{selectedBranch.location || "N/A"}</p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-50">
                <div className="flex items-center justify-between py-4 border-b border-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center">
                       <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                    </div>
                    <span className="text-[13px] font-bold text-slate-600">Assigned Staff</span>
                  </div>
                  <span className="text-[11px] font-bold text-accent uppercase tracking-widest">Active</span>
                </div>

                <div className="flex items-center justify-between py-4 border-b border-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center">
                       <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                    </div>
                    <span className="text-[13px] font-bold text-slate-600">Total Deposits</span>
                  </div>
                  <span className="text-[14px] font-bold text-slate-900 tracking-tight">₵ 0.00</span>
                </div>

                <div className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center">
                       <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    </div>
                    <span className="text-[13px] font-bold text-slate-600">Contact</span>
                  </div>
                  <span className="text-[14px] font-bold text-slate-900">{selectedBranch.phone || "No phone logged"}</span>
                </div>
              </div>

              <div className="pt-10 pb-20">
                <button 
                  onClick={() => setIsManageDrawerOpen(false)}
                  className="w-full py-4 bg-[#2EB67D] text-white rounded-2xl font-bold text-[13px] hover:bg-[#259465] transition-all shadow-xl shadow-slate-200"
                >
                  Close Manager
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
