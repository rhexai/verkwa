"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function WithdrawalFormPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [formData, setFormData] = useState({
    amount: "",
    withdrawnBy: ""
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchQuery.length > 1) {
      const searchItems = async () => {
        const { data } = await supabase
          .from('customers')
          .select('*')
          .or(`last_name.ilike.%${searchQuery}%,first_name.ilike.%${searchQuery}%,account_num.ilike.%${searchQuery}%`)
          .limit(5);
        
        setSearchResults(data || []);
      };
      searchItems();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleSelectCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return alert("Please select a customer first.");
    if (!isLoaded || !user) return alert("Authentication error.");
    
    setLoading(true);

    try {
      // 1. Get staff record from Supabase based on Clerk ID
      const { data: staff, error: staffError } = await supabase
        .from('employees')
        .select('id, branch_id')
        .eq('clerk_id', user.id)
        .single();

      if (staffError || !staff) {
        throw new Error("Staff record not found. Please ensure you are registered as an employee.");
      }

      // 2. Insert transaction
      const { error } = await supabase
        .from('transactions')
        .insert([
          {
            type: 'Withdrawal',
            amount: Number(formData.amount),
            customer_id: selectedCustomer.id,
            staff_id: staff.id,
            branch_id: staff.branch_id || selectedCustomer.branch_id,
            deposit_by: formData.withdrawnBy, 
            status: 'approved'
          }
        ]);

      if (error) throw error;

      router.push("/dashboard/transactions");
    } catch (error: any) {
      alert("Error processing withdrawal: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-[18px] font-black tracking-tight text-slate-900">
        <Link href="/dashboard/transactions" className="hover:underline">Transactions</Link>
        <span className="text-slate-400 font-medium">›</span>
        <span className="text-slate-900">Withdrawal Form</span>
      </div>

      <div className="bg-white border border-[#e5e7eb] shadow-sm rounded-2xl overflow-hidden p-8 font-plus-jakarta-sans">
        
        <form onSubmit={handleWithdrawal} className="max-w-4xl space-y-10 relative">
          
          <div className="bg-[#f8fafc] border border-slate-200 rounded-2xl p-8 space-y-8 shadow-sm">
            <div className="relative group">
              <label className="absolute -top-2.5 left-4 bg-[#f8fafc] px-2 text-[13px] text-slate-500 font-bold group-focus-within:text-slate-500 transition-colors">Search by surname or account</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={selectedCustomer ? `${selectedCustomer.last_name}, ${selectedCustomer.first_name}` : "Begin typing name or account number..."}
                  className="w-full px-6 py-4 bg-white border border-slate-300 rounded-xl text-[15px] font-medium focus:outline-none focus:border-slate-300 transition-colors"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                </div>
              </div>

              {searchResults.length > 0 && (
                <div className="absolute w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden">
                  {searchResults.map(res => (
                    <button 
                      key={res.id}
                      type="button"
                      onClick={() => handleSelectCustomer(res)}
                      className="w-full px-6 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 flex justify-between items-center"
                    >
                      <div>
                        <p className="text-sm font-bold text-slate-800">{res.last_name}, {res.first_name}</p>
                        <p className="text-[11px] font-bold text-slate-500 tracking-widest">{res.account_num}</p>
                      </div>
                      <span className="text-xs font-bold text-slate-400">Select</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <label className="absolute -top-2.5 left-4 bg-[#f8fafc] px-2 text-[13px] text-slate-500 font-bold">Customer name</label>
              <div className="w-full px-6 py-4 bg-white border border-slate-200 rounded-xl text-[15px] font-black text-slate-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                {selectedCustomer ? `${selectedCustomer.last_name}, ${selectedCustomer.first_name}` : "---"}
              </div>
            </div>

            <div className="relative">
              <label className="absolute -top-2.5 left-4 bg-[#f8fafc] px-2 text-[13px] text-slate-500 font-bold">Account number</label>
              <div className="w-full px-6 py-4 bg-white border border-slate-200 rounded-xl text-[15px] font-black text-slate-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                {selectedCustomer ? selectedCustomer.account_num : "---"}
              </div>
            </div>
          </div>

          <div className="space-y-8 px-2">
            <div className="relative group">
              <label className="absolute -top-2.5 left-4 bg-white px-2 text-[13px] text-slate-500 font-bold group-focus-within:text-slate-500 transition-colors">Withdrawal amount</label>
              <input 
                type="number" 
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="w-full px-6 py-4 bg-white border border-slate-200 rounded-xl text-[18px] font-black text-slate-900 focus:outline-none focus:border-slate-300 transition-colors"
                required
              />
            </div>

            <div className="relative group">
              <label className="absolute -top-2.5 left-4 bg-white px-2 text-[13px] text-slate-500 font-bold group-focus-within:text-slate-500 transition-colors">Withdrawn by</label>
              <input 
                type="text" 
                value={formData.withdrawnBy}
                onChange={(e) => setFormData({...formData, withdrawnBy: e.target.value})}
                className="w-full px-6 py-4 bg-white border border-slate-300 rounded-xl text-[15px] font-medium focus:outline-none focus:border-slate-300 transition-colors"
                placeholder="Name of person receiving cash"
              />
            </div>
          </div>

          <div className="px-2 pt-4">
            <button 
              type="submit"
              disabled={loading || !selectedCustomer}
              className="bg-[#feeceb] hover:bg-[#fecaca] text-[#e04536] px-10 py-4 rounded-xl text-[14px] font-black tracking-widest shadow-lg shadow-red-900/5 transition-all active:scale-95 disabled:bg-slate-100 disabled:text-slate-400"
            >
              {loading ? "Processing..." : "Debit account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
