import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Mail, Lock, AlertCircle, ArrowLeft, Database, Key } from 'lucide-react';
import { SEOHead } from '../../components/SEOHead';
import { ActivePage } from '../../types';

interface AdminLoginProps {
  onNavigate: (page: ActivePage) => void;
}

export function AdminLogin({ onNavigate }: AdminLoginProps) {
  const { login, isAdmin, loading: authLoading, isLiveGoogleSheets } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already authenticated as admin, navigate directly to dashboard
  React.useEffect(() => {
    if (isAdmin && !authLoading) {
      onNavigate({ type: 'admin' });
    }
  }, [isAdmin, authLoading, onNavigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      onNavigate({ type: 'admin' });
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <SEOHead title="অ্যাডমিন লগইন" description="Shadat Fatih Poetry সাহিত্যিক অ্যাডমিন ড্যাশবোর্ড।" />

      <div className="w-full max-w-md bg-white dark:bg-[#181615] border border-[#EBE5DE] dark:border-[#2C2724] rounded-3xl p-8 shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#8C271E] text-white flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1C1A] dark:text-[#FAF7F2]">
            অ্যাডমিন প্রবেশদ্বার
          </h1>
          <p className="text-xs text-[#7A7167] dark:text-[#A8A096]">
            Shadat Fatih Poetry প্রকাশনা ও বিষয়বস্তু পরিচালনা
          </p>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mt-1 bg-[#FAF4ED] dark:bg-[#221E1C] border border-[#E8DFD4] dark:border-[#332D29]">
            <Database className="w-3 h-3 text-[#8C271E]" />
            <span>
              {isLiveGoogleSheets ? (
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                  Google Sheets সংযুক্ত
                </span>
              ) : (
                <span className="text-amber-700 dark:text-amber-400">
                  লোকাল/স্ট্যান্ডঅ্যালোন মোড সক্রিয়
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Error notice */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#4A433D] dark:text-[#C7C0B7] mb-1.5">
              ইমেইল অ্যাড্রেস
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#9A9187] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@shadatfatih.com"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-[#DED7CD] dark:border-[#38312C] bg-[#FAF8F5] dark:bg-[#1F1C1A] text-[#1F1C1A] dark:text-[#F0ECE7] focus:outline-hidden focus:border-[#8C271E]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4A433D] dark:text-[#C7C0B7] mb-1.5">
              পাসওয়ার্ড
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#9A9187] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-[#DED7CD] dark:border-[#38312C] bg-[#FAF8F5] dark:bg-[#1F1C1A] text-[#1F1C1A] dark:text-[#F0ECE7] focus:outline-hidden focus:border-[#8C271E]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#8C271E] hover:bg-[#A32E24] text-white text-sm font-medium transition-colors shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>প্রবেশ করা হচ্ছে...</span>
            ) : (
              <>
                <Key className="w-4 h-4" />
                <span>লগইন করুন</span>
              </>
            )}
          </button>
        </form>

        {/* Admin security note */}
        <div className="pt-2 border-t border-[#F0EBE4] dark:border-[#272321] space-y-3 text-center">
          <p className="text-[11px] text-[#8A8178]">
            অ্যাডমিন ইমেইল ও পাসওয়ার্ড Google Apps Script-এ নিরাপদভাবে সেট করা আছে।
          </p>

          <div className="flex items-center justify-between text-xs pt-1">
            <button
              type="button"
              onClick={() => onNavigate({ type: 'home' })}
              className="text-[#8A8178] hover:text-[#8C271E] flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>মূল সাইটে ফিরুন</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
