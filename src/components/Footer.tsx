import { Feather, Heart, Shield } from 'lucide-react';
import { ActivePage } from '../types';

interface FooterProps {
  onNavigate: (page: ActivePage) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-[#F3EFEA] dark:bg-[#0D0C0B] border-t border-[#E5DFD7] dark:border-[#211E1C] mt-24 text-[#5A524A] dark:text-[#A69E94] transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-[#8C271E] flex items-center justify-center text-white shrink-0 shadow-xs">
                <Feather className="w-4 h-4" />
              </span>
              <div>
                <span className="font-brand font-bold text-lg tracking-wide text-[#1F1C1A] dark:text-[#F3EFEB] block leading-tight">
                  Shadat Fatih Poetry
                </span>
                <span className="text-xs text-[#8C271E] dark:text-[#FFB4AB] font-serif font-medium">
                  শাহাদাৎ ফাতিহ
                </span>
              </div>
            </div>
            <p className="font-serif text-sm leading-relaxed max-w-md text-[#61584F] dark:text-[#BDB4A8]">
              বাংলা সাহিত্যের মাধুর্য ও আবেগকে আধুনিক রুচিসম্মত ডিজিটাল পরিসরে তুলে ধরার এক আন্তরিক প্রয়াস। প্রতিটি পংক্তি ও উপাখ্যান মানুষের ভেতরের অব্যক্ত কথাকে স্পর্শ করতে চায়।
            </p>
            <div className="text-xs text-[#8A8178] italic font-serif">
              "কবিতা তো কেবল ছন্দ নয়, আত্মার নিঃশব্দ চিৎকার।"
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif font-bold text-sm text-[#1F1C1A] dark:text-[#EDE8E3] mb-4">
              সাহিত্য সূচি
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate({ type: 'poems' })}
                  className="hover:text-[#8C271E] dark:hover:text-[#FFB4AB] transition-colors"
                >
                  নির্বাচিত কবিতা
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate({ type: 'stories' })}
                  className="hover:text-[#8C271E] dark:hover:text-[#FFB4AB] transition-colors"
                >
                  ছোটগল্প সম্ভার
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate({ type: 'novels' })}
                  className="hover:text-[#8C271E] dark:hover:text-[#FFB4AB] transition-colors"
                >
                  ধারাবাহিক উপন্যাস
                </button>
              </li>
            </ul>
          </div>

          {/* Platform & Admin */}
          <div>
            <h4 className="font-serif font-bold text-sm text-[#1F1C1A] dark:text-[#EDE8E3] mb-4">
              পরিচিতি ও তথ্য
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate({ type: 'author' })}
                  className="hover:text-[#8C271E] dark:hover:text-[#FFB4AB] transition-colors"
                >
                  লেখক পরিচিতি
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate({ type: 'about' })}
                  className="hover:text-[#8C271E] dark:hover:text-[#FFB4AB] transition-colors"
                >
                  আমাদের সম্পর্কে
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate({ type: 'admin' })}
                  className="inline-flex items-center gap-1.5 text-xs text-[#8C271E] dark:text-[#FFB4AB] hover:underline"
                >
                  <Shield className="w-3.5 h-3.5" />
                  অ্যাডমিন ড্যাশবোর্ড
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-[#E2DDD5] dark:border-[#1E1B19] flex flex-col sm:flex-row items-center justify-between text-xs text-[#8A8178] gap-4">
          <p>© ২০২৬ Shadat Fatih Poetry • শাহাদাৎ ফাতিহ। সর্বস্বত্ব সংরক্ষিত।</p>
          <div className="flex items-center gap-1">
            <span>বাংলা সাহিত্যের প্রতি গভীর ভালোবাসায় নির্মিত</span>
            <Heart className="w-3 h-3 text-[#8C271E] fill-current" />
          </div>
        </div>
      </div>
    </footer>
  );
}
