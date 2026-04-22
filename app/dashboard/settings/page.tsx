"use client";

export default function SettingsPage() {
  const tabs = ["General", "Notifications", "Money related", "Dates"];

  const formFields = [
    { label: "Business name", value: "Itana Susu" },
    { label: "Business address", value: "Accra" },
    { label: "Business location", value: "Spintex" },
    { label: "Business email", value: "tomailgeorge@gmail.com" },
    { label: "Business phone", value: "0591200344" },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-20 font-sans">
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden pb-12">
        
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

        {/* Form Content */}
        <div className="p-10 max-w-4xl space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {formFields.map((field, i) => (
              <div key={i} className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 tracking-widest ml-1">
                  {field.label}
                </label>
                <input 
                  type="text" 
                  defaultValue={field.value}
                  className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-2xl text-[14px] text-slate-800 font-bold focus:outline-none focus:bg-white focus:border-accent/20 transition-all"
                />
              </div>
            ))}
          </div>

          {/* Logo Upload Box */}
          <div className="space-y-2">
             <label className="text-[11px] font-bold text-slate-400 tracking-widest ml-1">Brand Identity</label>
             <div className="p-10 bg-slate-50 border border-slate-100 rounded-3xl flex flex-col items-center justify-center gap-4 hover:border-accent/20 transition-all group cursor-pointer border-dashed">
                <div className="w-16 h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                </div>
                <span className="text-[11px] font-bold tracking-widest text-slate-400 group-hover:text-slate-900 transition-colors">Select portfolio logo</span>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* GCSCA */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 tracking-widest ml-1">
                Gcsca identification
              </label>
              <input 
                type="text" 
                placeholder="VER-XXXXXXXXX"
                className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-2xl text-[14px] text-slate-800 font-bold focus:outline-none focus:bg-white focus:border-accent/20 transition-all"
              />
            </div>

            {/* SMS Name */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 tracking-widest ml-1">
                Sms sender id (max 11)
              </label>
              <input 
                type="text" 
                maxLength={11}
                placeholder="VERKWA_SMS"
                className="w-full px-5 py-4 bg-slate-50 border border-transparent rounded-2xl text-[14px] text-slate-800 font-bold focus:outline-none focus:bg-white focus:border-accent/20 transition-all"
              />
            </div>
          </div>

          <div className="pt-10 border-t border-slate-50">
            <button className="px-10 py-4 bg-slate-900 text-white rounded-full font-bold text-[13px] hover:bg-black transition-all shadow-xl shadow-slate-200">
              Save configuration
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
