"use client";

export default function SettingsPage() {
  const tabs = ["GENERAL", "NOTIFICATIONS", "MONEY RELATED", "DATES"];

  const formFields = [
    { label: "Business name", value: "Itana Susu" },
    { label: "Business Address", value: "Accra" },
    { label: "Business Location", value: "Spintex" },
    { label: "Business Email", value: "tomailgeorge@gmail.com" },
    { label: "Business Phone", value: "0591200344" },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto pb-20">
      <div className="bg-white border border-[#e5e7eb] shadow-sm rounded-xl overflow-hidden pb-8">
        
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

        {/* Form Content */}
        <div className="p-8 max-w-4xl space-y-6">
          
          {formFields.map((field, i) => (
            <div key={i} className="relative">
              <label className="absolute -top-2.5 left-3 bg-white px-1 text-[13px] text-slate-500 font-medium">
                {field.label}
              </label>
              <input 
                type="text" 
                defaultValue={field.value}
                className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-lg text-[15px] text-slate-800 font-medium focus:outline-none focus:border-slate-500 transition-colors"
              />
            </div>
          ))}

          {/* Logo Upload Box */}
          <div className="border border-slate-300 rounded-lg p-4 flex items-center gap-6">
            <div className="w-12 h-12 bg-[#f8f9fa] border border-slate-200 rounded flex items-center justify-center text-blue-600 hover:bg-slate-50 cursor-pointer transition-colors shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
            </div>
            <div className="flex-1 text-center text-[15px] font-medium text-slate-400">
              logo
            </div>
          </div>

          {/* GCSCA */}
          <div className="relative mt-6">
            <label className="absolute -top-2.5 left-3 bg-white px-1 text-[13px] text-slate-500 font-medium">
              GCSCA membership number
            </label>
            <input 
              type="text" 
              className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-lg text-[15px] text-slate-800 font-medium focus:outline-none focus:border-slate-500 transition-colors"
            />
          </div>

          {/* SMS Name */}
          <div className="relative mt-6">
            <label className="absolute -top-2.5 left-3 bg-white px-1 text-[13px] text-slate-500 font-medium">
              SMS Sending Name (11 characters max)
            </label>
            <input 
              type="text" 
              maxLength={11}
              className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-lg text-[15px] text-slate-800 font-medium focus:outline-none focus:border-slate-500 transition-colors"
            />
          </div>

          <div className="pt-4">
            <button className="px-8 py-3 bg-black text-white text-[13px] font-bold uppercase tracking-wider rounded hover:bg-slate-800 transition-colors">
              UPDATE
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
