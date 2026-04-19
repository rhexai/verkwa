"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);

  const quickActions = [
    { name: "Deposit", icon: "deposit", href: "/dashboard/transactions/deposit", color: "text-green-600" },
    { name: "Withdrawal", icon: "withdrawal", href: "/dashboard/transactions/withdrawal", color: "text-green-600" },
    { name: "Loan Request", icon: "loan-req", href: "/dashboard/loans/request", color: "text-green-700" },
    { name: "Loan Payment", icon: "loan-pay", href: "/dashboard/loans/payment", color: "text-green-600" },
    { name: "Complaint", icon: "complaint", href: "/dashboard/business/complaints/new", color: "text-green-600" },
    { name: "Add Member", icon: "user-plus", href: "/dashboard/accounts/add", color: "text-green-800" },
  ];

  const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: "layout-dashboard" },
    { name: "Accounts", href: "/dashboard/accounts", icon: "users" },
    { name: "Transactions", href: "/dashboard/transactions", icon: "receipt" },
    { name: "Access", href: "/dashboard/access", icon: "lock" },
    { name: "Business", href: "/dashboard/business", icon: "briefcase" },
    { name: "Accounting", href: "/dashboard/accounting", icon: "calculator" },
    { name: "Ledgers", href: "/dashboard/ledgers", icon: "folder" },
    { name: "Reports", href: "/dashboard/reports", icon: "bar-chart-2" },
    { name: "Sms", href: "/dashboard/sms", icon: "message-square" },
    { name: "Settings", href: "/dashboard/settings", icon: "settings" },
    { name: "System", href: "/dashboard/system", icon: "cpu" },
  ];

  // Map strict strings for the URL paths matching screenshots perfectly
  const getPageTitle = () => {
    switch (pathname) {
      case '/dashboard': return 'Dashboard';
      case '/dashboard/access': return 'Access Control';
      case '/dashboard/business': return 'Business Data';
      case '/dashboard/ledgers': return 'Ledgers';
      case '/dashboard/sms': return 'SMS';
      case '/dashboard/settings': return 'Settings';
    }
    return pathname.split('/').pop()?.replace(/-/g, ' ');
  };

  return (
    <div className="flex h-screen bg-[#f5f7f9] overflow-hidden font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-[240px] bg-[#f8f9fa] flex flex-col flex-shrink-0 z-20">
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 mt-2">
          <div className="space-y-0.5">
            <h1 className="text-xl font-black text-fuchsia-900 tracking-tight leading-none">Verkwa Susu</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Owners</p>
          </div>
        </div>

        {/* Links Area */}
        <div className="flex-1 overflow-y-auto pt-6 pb-8 space-y-1 scrollbar-hide">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.name} 
                href={link.href}
                className={`flex items-center gap-4 px-6 py-2.5 text-sm transition-all duration-200 group ${
                  isActive 
                  ? "bg-fuchsia-50/70 border-r-4 border-fuchsia-900 text-fuchsia-900 font-bold" 
                  : "text-slate-600 font-medium hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <div className={`w-5 h-5 flex items-center justify-center transition-colors ${
                  isActive ? "text-fuchsia-800" : "text-slate-400 group-hover:text-fuchsia-600"
                }`}>
                  {link.icon === 'layout-dashboard' && <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>}
                  {link.icon === 'users' && <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
                  {link.icon === 'receipt' && <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17V7"/></svg>}
                  {link.icon === 'lock' && <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
                  {link.icon === 'briefcase' && <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>}
                  {link.icon === 'calculator' && <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>}
                  {link.icon === 'folder' && <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>}
                  {link.icon === 'bar-chart-2' && <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/></svg>}
                  {link.icon === 'message-square' && <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
                  {link.icon === 'settings' && <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>}
                  {link.icon === 'cpu' && <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/></svg>}
                </div>
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Logout Area */}
        <div className="px-6 py-6 border-t border-slate-200/60 bg-white">
          <button className="w-full flex justify-center items-center gap-2 px-4 py-3 rounded text-[#e04536] bg-[#feeceb] font-bold text-sm tracking-wide transition-colors">
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN LAYOUT */}
      <div className="flex-1 flex flex-col min-w-0 bg-white relative">
        
        {/* Renew Plan Banner */}
        <div className="bg-black flex items-center justify-between px-6 py-2.5 text-xs font-bold z-30">
          <div className="flex items-center gap-3">
            <span className="text-[#32b846]">Renew plan in 4 days</span>
            <Link href="#" className="uppercase tracking-widest text-[#5ce06f] hover:text-[#7ae689] transition-colors">RENEW NOW</Link>
          </div>
          <button className="text-white hover:text-red-400 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        {/* Top Navigation */}
        <header className="h-[72px] bg-white border-b border-slate-200 z-20 flex items-center justify-between px-8 w-full">
          <h2 className="text-[22px] font-black text-fuchsia-900 tracking-tight capitalize">
            {getPageTitle()}
          </h2>

          <div className="flex items-center gap-6">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search customer by surname ..." 
                className="w-72 lg:w-80 px-5 py-2.5 bg-white border border-slate-200 rounded-full text-sm font-medium focus:outline-none focus:border-fuchsia-300 transition-colors placeholder:text-slate-300 text-slate-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]"
              />
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setIsQuickActionOpen(!isQuickActionOpen)}
                className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all active:scale-95 ${
                  isQuickActionOpen ? "bg-fuchsia-100 border-fuchsia-300 text-fuchsia-900" : "bg-white border-slate-300 text-slate-500 hover:text-slate-800 hover:border-slate-400"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${isQuickActionOpen ? 'rotate-45' : ''}`}><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              </button>

              {/* QUICK ACTIONS DROPDOWN */}
              {isQuickActionOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right">
                  <div className="py-2">
                    {quickActions.map((action) => (
                      <Link 
                        key={action.name}
                        href={action.href}
                        onClick={() => setIsQuickActionOpen(false)}
                        className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50 transition-colors group"
                      >
                        <div className={`w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center transition-colors group-hover:bg-white border border-transparent group-hover:border-slate-200 ${action.color}`}>
                          {action.icon === 'deposit' && <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m16 12-4 4-4-4"/><path d="M12 8v8"/></svg>}
                          {action.icon === 'withdrawal' && <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m8 12 4-4 4 4"/><path d="M12 16V8"/></svg>}
                          {action.icon === 'loan-req' && <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 15h2a2 2 0 1 0 0-4h-3c-1.1 0-2-.9-2-2s.9-2 2-2h2"/><path d="M12 5v14"/><path d="M7 15l-3-3 3-3"/><path d="M17 9l3 3-3 3"/></svg>}
                          {action.icon === 'loan-pay' && <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 12h.01"/><path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><path d="M22 13a10 10 0 1 1-20 0"/><path d="m15 13-3 3-3-3"/></svg>}
                          {action.icon === 'complaint' && <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z"/><path d="M15 3v5h5"/><path d="m7 11 2 2 4-4"/></svg>}
                          {action.icon === 'user-plus' && <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>}
                        </div>
                        <span className="text-[14px] font-bold text-slate-700">{action.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <UserButton afterSignOutUrl="/" />
          </div>
        </header>

        {/* Inject Dashboard Pages here */}
        <main className="flex-1 overflow-y-auto w-full bg-[#f9fafb] p-8">
          {children}
        </main>
      </div>

    </div>
  );
}
