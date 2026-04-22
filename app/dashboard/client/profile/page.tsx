"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";

export default function ClientProfilePage() {
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    gender: "",
    account_num: ""
  });

  useEffect(() => {
    async function fetchProfile() {
      const email = user?.primaryEmailAddress?.emailAddress;
      if (!email) return setLoading(false);

      try {
        const { data: cust } = await supabase
          .from('customers')
          .select('*')
          .eq('email', email)
          .single();

        if (cust) {
          setFormData({
            first_name: cust.first_name || "",
            last_name: cust.last_name || "",
            email: cust.email || "",
            phone: cust.phone || "",
            gender: cust.gender || "",
            account_num: cust.account_num || ""
          });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    }

    if (isLoaded) fetchProfile();
  }, [user, isLoaded]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('customers')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          gender: formData.gender
        })
        .eq('email', formData.email);

      if (error) throw error;
      alert("Profile updated successfully!");
    } catch (err: any) {
      alert("Error updating profile: " + err.message);
    } finally {
      setSubmitting(false);
    }
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
              tab.name === "Profile" 
                ? "border-accent text-slate-900" 
                : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-200"
            }`}
          >
            {tab.name}
          </Link>
        ))}
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-10">
         <div className="relative group">
            <div className="w-28 h-28 bg-slate-50 flex items-center justify-center border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
               {user?.imageUrl ? (
                 <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
               ) : (
                 <span className="text-3xl font-bold text-slate-300 uppercase tracking-tight">{formData.first_name?.[0]}{formData.last_name?.[0]}</span>
               )}
            </div>
            <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-slate-900 text-white flex items-center justify-center hover:bg-black transition-all border-4 border-white rounded-full shadow-lg">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            </button>
         </div>
         <div className="space-y-1">
            <h1 className="text-[32px] font-bold text-slate-900 tracking-tight leading-none">{formData.first_name} {formData.last_name}</h1>
            <p className="text-slate-400 font-bold text-[11px] tracking-widest uppercase italic">{formData.account_num || "Verified profile"}</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        
        {/* Left: General Settings */}
        <div className="md:col-span-2 space-y-10 font-sans">
           <form onSubmit={handleUpdate} className="bg-white border border-slate-200 p-10 rounded-3xl shadow-sm space-y-10">
              <div className="flex items-center justify-between border-b border-slate-50 pb-8">
                 <h2 className="text-[15px] font-bold text-slate-800">Identity parameters</h2>
                 <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest leading-none">Secure protocol</span>
              </div>

              <div className="grid grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">First name</label>
                    <input 
                      type="text" 
                      value={formData.first_name}
                      onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 text-[14px] font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-slate-900 transition-all rounded-2xl"
                    />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Last name</label>
                    <input 
                      type="text" 
                      value={formData.last_name}
                      onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 text-[14px] font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-slate-900 transition-all rounded-2xl"
                    />
                 </div>
              </div>

              <div className="space-y-3">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Authenticated email</label>
                  <input 
                    type="email" 
                    readOnly
                    value={formData.email}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-50 text-[14px] font-bold text-slate-300 cursor-not-allowed rounded-2xl"
                  />
                  <p className="text-[11px] font-medium text-slate-400 italic tracking-tight">Root account managed via Verkwa Authentication Module.</p>
              </div>

              <div className="grid grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Mobile comms</label>
                    <input 
                      type="text" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 text-[14px] font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-slate-900 transition-all rounded-2xl"
                    />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Gender id</label>
                    <div className="relative">
                      <select 
                        value={formData.gender}
                        onChange={(e) => setFormData({...formData, gender: e.target.value})}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 text-[14px] font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-slate-900 transition-all appearance-none rounded-2xl"
                      >
                         <option value="Male">Male</option>
                         <option value="Female">Female</option>
                         <option value="Other">Other</option>
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                      </div>
                    </div>
                 </div>
              </div>

              <div className="pt-6 border-t border-slate-50">
                 <button 
                  type="submit"
                  disabled={submitting}
                  className="w-full py-5 bg-slate-900 text-white font-bold text-[11px] tracking-widest uppercase hover:bg-black transition-all active:scale-[0.98] disabled:bg-slate-100 rounded-2xl shadow-xl shadow-slate-100"
                 >
                   {submitting ? "Syncing profile data..." : "Commit changes"}
                 </button>
              </div>
           </form>
        </div>

        {/* Right: Security & More */}
        <div className="space-y-8 font-sans">
           <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm space-y-8">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Access Shield</h3>
              <div className="space-y-4">
                 <button className="w-full py-5 border border-slate-100 rounded-2xl flex items-center gap-5 px-6 hover:bg-slate-50 transition-all group">
                    <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center">
                       <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </div>
                    <div className="text-left">
                       <p className="text-[13px] font-bold text-slate-900 leading-none mb-1">Key archive</p>
                       <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest group-hover:text-accent transition-colors">Reset ›</p>
                    </div>
                 </button>
                 <button className="w-full py-5 border border-slate-100 rounded-2xl flex items-center gap-5 px-6 hover:bg-slate-50 transition-all group">
                    <div className="w-10 h-10 border border-slate-100 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center">
                       <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
                    <div className="text-left">
                       <p className="text-[13px] font-bold text-slate-900 leading-none mb-1">Duo-verified</p>
                       <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest group-hover:text-slate-900 transition-colors">Active ›</p>
                    </div>
                 </button>
              </div>
           </div>

           <div className="bg-slate-900 text-white rounded-3xl p-8 space-y-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                 <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <h4 className="text-[11px] font-bold text-white/50 uppercase tracking-widest relative z-10">Procedural note</h4>
              <p className="text-[11px] font-medium text-white/50 leading-relaxed tracking-tight italic relative z-10">Structural modifications require manual authorization via the HQ Support Ledger.</p>
              <button className="text-[11px] font-bold text-white uppercase tracking-widest hover:underline relative z-10">Open ledger ›</button>
           </div>
        </div>
      </div>
    </div>
  );
}
