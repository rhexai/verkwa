"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function AddCustomerPage() {
  const router = useRouter();
  const tabs = ["IMPORTANT", "MORE", "LOCATION", "UPLOAD"];
  const [activeTab, setActiveTab ] = useState("IMPORTANT");
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    branch_id: "",
    account_type: "susu account",
    gender: "",
    first_name: "",
    last_name: "",
    mobile_number: ""
  });

  useEffect(() => {
    async function fetchBranches() {
      const { data } = await supabase.from('branches').select('id, name');
      if (data) setBranches(data);
    }
    fetchBranches();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Generate a simple account number (in production this would be more robust)
    const accountNum = "ACC-" + Math.floor(100000 + Math.random() * 900000);

    const { error } = await supabase
      .from('customers')
      .insert([
        {
          first_name: formData.first_name,
          last_name: formData.last_name,
          account_num: accountNum,
          phone: formData.mobile_number,
          gender: formData.gender,
          branch_id: formData.branch_id || null,
          account_type: formData.account_type,
          status: 'Active'
        }
      ]);

    if (error) {
      alert("Error adding customer: " + error.message);
    } else {
      router.push("/dashboard/accounts");
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-[18px] font-black tracking-tight">
        <Link href="/dashboard/accounts" className="text-fuchsia-900 hover:underline">Customers</Link>
        <span className="text-slate-400 font-medium">›</span>
        <span className="text-slate-900">Add Customer</span>
      </div>

      <div className="bg-white border border-[#e5e7eb] shadow-sm rounded-xl overflow-hidden pb-12">
        
        {/* Actions Row */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={handleSave}
              disabled={loading}
              className="bg-[#32b846] hover:bg-[#2d7337] text-white px-6 py-2.5 rounded text-[13px] font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-green-900/10 transition-all active:scale-95 disabled:bg-slate-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              {loading ? "..." : "SAVE"}
            </button>
            <button className="bg-[#9333ea] hover:bg-[#7e22ce] text-white px-6 py-2.5 rounded text-[13px] font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-purple-900/10 transition-all active:scale-95">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              IMPORT LIST
            </button>
          </div>

          <div className="relative">
            <input 
              type="text" 
              placeholder="Search customer by surname ..." 
              className="w-80 px-5 py-2.5 bg-white border border-slate-200 rounded-full text-sm font-medium focus:outline-none focus:border-fuchsia-300 transition-colors shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-6 pt-4 gap-8">
          {tabs.map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-[14px] font-bold uppercase tracking-wider border-b-2 transition-all ${
                activeTab === tab 
                ? "border-[#c14a42] text-[#c14a42]" 
                : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Info Box */}
        <div className="mx-6 mt-6 bg-[#f0fff4] border border-[#c6f6d5] p-3.5 rounded text-center">
          <p className="text-[#2f855a] text-[15px] font-medium leading-none">You can fill the other sections later.</p>
        </div>

        {/* Form */}
        <div className="p-8 max-w-4xl space-y-8 mt-4 font-plus-jakarta-sans">
          
          <div className="relative group">
            <label className="absolute -top-2.5 left-3 bg-white px-1 text-[13px] text-slate-500 font-bold group-focus-within:text-fuchsia-600">Branch</label>
            <select 
              value={formData.branch_id}
              onChange={(e) => setFormData({...formData, branch_id: e.target.value})}
              className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl text-[15px] text-slate-800 font-medium focus:outline-none focus:border-fuchsia-400 transition-colors appearance-none"
            >
              <option value="">Select Branch</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>

          <div className="relative group">
            <label className="absolute -top-2.5 left-3 bg-white px-1 text-[13px] text-slate-500 font-bold group-focus-within:text-fuchsia-600">Select account type</label>
            <select 
              value={formData.account_type}
              onChange={(e) => setFormData({...formData, account_type: e.target.value})}
              className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl text-[15px] text-slate-800 font-medium focus:outline-none focus:border-fuchsia-400 transition-colors appearance-none"
            >
              <option value="susu account">susu account</option>
              <option value="savings">savings</option>
              <option value="current">current</option>
            </select>
          </div>

          <div className="relative group">
            <label className="absolute -top-2.5 left-3 bg-white px-1 text-[13px] text-slate-500 font-bold group-focus-within:text-fuchsia-600">gender</label>
            <select 
              value={formData.gender}
              onChange={(e) => setFormData({...formData, gender: e.target.value})}
              className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl text-[15px] text-slate-800 font-medium focus:outline-none focus:border-fuchsia-400 transition-colors appearance-none"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="relative group">
            <label className="absolute -top-2.5 left-3 bg-white px-1 text-[13px] text-slate-500 font-bold group-focus-within:text-fuchsia-600">first name</label>
            <input 
              type="text" 
              value={formData.first_name}
              onChange={(e) => setFormData({...formData, first_name: e.target.value})}
              className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl text-[15px] text-slate-800 font-medium focus:outline-none focus:border-fuchsia-400 transition-colors"
              required
            />
          </div>

          <div className="relative group">
            <label className="absolute -top-2.5 left-3 bg-white px-1 text-[13px] text-slate-500 font-bold group-focus-within:text-fuchsia-600">last name</label>
            <input 
              type="text" 
              value={formData.last_name}
              onChange={(e) => setFormData({...formData, last_name: e.target.value})}
              className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl text-[15px] text-slate-800 font-medium focus:outline-none focus:border-fuchsia-400 transition-colors"
              required
            />
          </div>

          <div className="relative group">
            <label className="absolute -top-2.5 left-3 bg-white px-1 text-[13px] text-slate-500 font-bold group-focus-within:text-fuchsia-600">Mobile number</label>
            <input 
              type="text" 
              value={formData.mobile_number}
              onChange={(e) => setFormData({...formData, mobile_number: e.target.value})}
              className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-[15px] text-slate-800 font-medium focus:outline-none focus:border-fuchsia-400 transition-colors"
              placeholder="+233"
            />
          </div>

        </div>
      </div>
    </div>
  );
}
