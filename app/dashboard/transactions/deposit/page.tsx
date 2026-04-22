"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function DepositFormPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [headerSearch, setHeaderSearch] = useState("");
  const [lookupQuery, setLookupQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [formData, setFormData] = useState({
    amount: "",
    depositBy: ""
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (lookupQuery.length > 1) {
      const searchItems = async () => {
        const { data } = await supabase
          .from('customers')
          .select('*')
          .or(`last_name.ilike.%${lookupQuery}%,first_name.ilike.%${lookupQuery}%,account_num.ilike.%${lookupQuery}%`)
          .limit(5);
        
        setSearchResults(data || []);
      };
      searchItems();
    } else {
      setSearchResults([]);
    }
  }, [lookupQuery]);

  const handleSelectCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setLookupQuery("");
    setSearchResults([]);
  };

  const handleClearCustomer = () => {
    setSelectedCustomer(null);
    setLookupQuery("");
    setSearchResults([]);
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return alert("Please select a customer first.");
    if (!formData.amount || Number(formData.amount) <= 0) return alert("Please enter a valid Deposit amount.");
    if (!isLoaded || !user) return alert("Authentication error. Please refresh and try again.");
    
    setLoading(true);

    try {
      // 1. Get staff record from Supabase 
      // Try Clerk ID first, fallback to Email
      const userEmail = user.primaryEmailAddress?.emailAddress;
      const userRole = user.publicMetadata?.role as string;
      const isAdmin = userRole === "Administrator" || userRole === "admin";
      
      const { data: staff, error: staffError } = await supabase
        .from('employees')
        .select('id, branch_id')
        .or(`clerk_id.eq.${user.id},email.eq.${userEmail}`)
        .single();

      let staffId = staff?.id || null;
      let branchId = staff?.branch_id || selectedCustomer.branch_id || null;

      if (!staffId && !isAdmin) {
        console.error("Staff lookup error:", staffError);
        throw new Error("Staff record not found. Please ensure your account is registered as an employee or you have Administrator privileges.");
      }

      // 2. Insert transaction
      const { error } = await supabase
        .from('transactions')
        .insert([
          {
            type: 'Deposit',
            amount: Number(formData.amount),
            customer_id: selectedCustomer.id,
            staff_id: staffId,
            branch_id: branchId,
            deposit_by: formData.depositBy || `${selectedCustomer.first_name} ${selectedCustomer.last_name}`,
            status: 'approved' 
          }
        ]);

      if (error) throw error;

      // 3. Success Feedback
      alert(`Deposit successful!\n₵ ${Number(formData.amount).toFixed(2)} credited to ${selectedCustomer.first_name} ${selectedCustomer.last_name}`);
      
      router.push("/dashboard/transactions");
    } catch (error: any) {
      console.error("Deposit Processing Error:", error);
      alert("Error processing Deposit: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4">
      
      {/* Top Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[20px] font-black tracking-tight text-slate-900">
          <Link href="/dashboard/transactions" className="hover:underline">Deposits</Link>
          <span className="text-slate-400 font-medium">›</span>
          <span className="text-slate-400">Deposit Form</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search customer by surname ..." 
              className="w-72 px-5 py-2.5 bg-white border border-slate-200 rounded-full text-sm italic placeholder:text-slate-300 focus:outline-none focus:border-slate-300 shadow-sm"
              value={headerSearch}
              onChange={(e) => setHeaderSearch(e.target.value)}
            />
          </div>
          <button className="w-10 h-10 border-2 border-slate-400 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-all font-light text-2xl">
            ＋
          </button>
        </div>
      </div>

      <div className="bg-white border border-[#e2e8f0] shadow-xl rounded-3xl overflow-hidden p-10 mt-6">
        
        <form onSubmit={handleDeposit} className="max-w-4xl space-y-10 relative">
          
          {/* Lookup Section */}
          <div className="bg-white border-2 border-slate-100 rounded-3xl p-8 space-y-8 shadow-inner-sm">
            
            {/* Search Input */}
            {!selectedCustomer ? (
              <div className="relative group">
                <label className="absolute -top-2.5 left-6 bg-white px-2 text-[13px] text-slate-400 font-bold group-focus-within:text-slate-500 transition-colors tracking-tight">Search by surname or account</label>
                <input 
                  type="text" 
                  value={lookupQuery}
                  onChange={(e) => setLookupQuery(e.target.value)}
                  placeholder="e.g. Smith or ACC-123..."
                  className="w-full px-8 py-5 bg-white border border-slate-200 rounded-2xl text-[15px] font-medium text-slate-600 focus:outline-none focus:border-slate-300 transition-colors shadow-sm"
                />
                {/* Search Results Dropdown */}
                {searchResults.length > 0 && (
                  <div className="absolute w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-20 overflow-hidden">
                    {searchResults.map(res => (
                      <button 
                        key={res.id}
                        type="button"
                        onClick={() => handleSelectCustomer(res)}
                        className="w-full px-8 py-4 text-left hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 flex justify-between items-center"
                      >
                        <div>
                          <p className="text-sm font-black text-slate-700">{res.last_name}, {res.first_name}</p>
                          <p className="text-[11px] font-bold text-slate-400 tracking-widest">{res.account_num}</p>
                        </div>
                        <span className="text-xs font-bold text-slate-300">Select</span>
                      </button>
                    ))}
                  </div>
                )}
                {lookupQuery.length > 1 && searchResults.length === 0 && !loading && (
                   <div className="absolute w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 p-4 text-center text-sm text-slate-400 italic">
                      No customers found matching "{lookupQuery}"
                   </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-2xl shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 tracking-widest">Customer active</p>
                    <p className="text-sm font-black text-slate-700">Ready to credit account</p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={handleClearCustomer}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-500 hover:text-red-500 hover:border-red-200 transition-all tracking-wider"
                >
                  Change
                </button>
              </div>
            )}

            {/* Display Field: Name */}
            <div className="relative">
              <label className="absolute -top-2.5 left-6 bg-white px-2 text-[13px] text-slate-400 font-bold tracking-tight">Customer name</label>
              <div className={`w-full px-8 py-5 border rounded-2xl text-[16px] font-black transition-all ${selectedCustomer ? 'bg-[#f8fafc] border-slate-200 text-slate-800 shadow-sm' : 'bg-[#f1f5f9] border-slate-200 text-slate-300'}`}>
                {selectedCustomer ? `${selectedCustomer.last_name}, ${selectedCustomer.first_name}` : "Selection pending..."}
              </div>
            </div>

            {/* Display Field: Account number */}
            <div className="relative">
              <label className="absolute -top-2.5 left-6 bg-white px-2 text-[13px] text-slate-400 font-bold tracking-tight">Account number</label>
              <div className={`w-full px-8 py-5 border rounded-2xl text-[16px] font-black transition-all ${selectedCustomer ? 'bg-[#f8fafc] border-slate-200 text-slate-800 shadow-sm' : 'bg-[#f1f5f9] border-slate-200 text-slate-300'}`}>
                {selectedCustomer ? selectedCustomer.account_num : "Selection pending..."}
              </div>
            </div>

          </div>

          {/* Amount & Submitter Section */}
          <div className="space-y-8">
            <div className="relative group">
              <label className="absolute -top-2.5 left-6 bg-white px-2 text-[13px] text-slate-400 font-bold tracking-tight group-focus-within:text-slate-500">Deposit amount</label>
              <input 
                type="number" 
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="w-full px-8 py-5 bg-white border border-slate-200 rounded-2xl text-[24px] font-black text-slate-900 focus:outline-none focus:border-slate-300 transition-colors shadow-sm"
                required
                placeholder="0.00"
              />
            </div>

            <div className="relative group">
              <label className="absolute -top-2.5 left-6 bg-white px-2 text-[13px] text-slate-400 font-bold tracking-tight group-focus-within:text-slate-500">Deposit by</label>
              <input 
                type="text" 
                value={formData.depositBy}
                onChange={(e) => setFormData({...formData, depositBy: e.target.value})}
                className="w-full px-8 py-5 bg-white border border-slate-200 rounded-2xl text-[15px] font-medium text-slate-600 focus:outline-none focus:border-slate-300 transition-colors shadow-sm"
                placeholder="Name of the person Depositing (Optional)"
              />
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              disabled={loading || !selectedCustomer}
              className="bg-[#dcfce7] hover:bg-[#bbf7d0] text-[#166534] px-10 py-4 rounded-lg text-[13px] font-black tracking-widest shadow-md transition-all active:scale-95 disabled:bg-slate-100 disabled:text-slate-300 border border-transparent disabled:border-slate-200"
            >
              {loading ? "Processing..." : "Credit account"}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
