import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { ActivePage } from '../types';
import { Search, Sun, Moon, Menu, X, Feather, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  onOpenSearch: () => void;
}

export function Navbar({ activePage, onNavigate, onOpenSearch }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'হোম', type: 'home' as const },
    { label: 'কবিতা', type: 'archive' as const },
    { label: 'গল্প', type: 'stories' as const },
    { label: 'উপন্যাস', type: 'novels' as const },
    { label: 'লেখক', type: 'author' as const },
    { label: 'আমাদের সম্পর্কে', type: 'about' as const },
  ];

  const isActive = (type: string) => activePage.type === type;

  const handleLinkClick = (type: ActivePage['type']) => {
    onNavigate({ type } as ActivePage);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF8F5]/90 dark:bg-[#121110]/90 backdrop-blur-md border-b border-[#EBE5DE] dark:border-[#24201E] transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <div
            onClick={() => handleLinkClick('home')}
            className="cursor-pointer flex items-center gap-2.5 select-none group"
          >
            <span className="w-9 h-9 rounded-xl bg-[#8C271E] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <Feather className="w-4 h-4" />
            </span>
            <div className="flex flex-col">
              <span className="font-brand font-semibold text-base sm:text-lg tracking-wide text-[#1F1C1A] dark:text-[#F3EFEB] group-hover:text-[#8C271E] dark:group-hover:text-[#E25C4F] transition-colors leading-tight">
                Shadat Fatih Poetry
              </span>
              <span className="text-[12px] text-[#8C271E] dark:text-[#FFB4AB] font-serif font-medium leading-tight">
                শাহাদাৎ ফাতিহ
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((item) => (
              <button
                key={item.type}
                type="button"
                onClick={() => handleLinkClick(item.type)}
                className={`px-3.5 py-1.5 rounded-lg text-[15px] font-medium transition-all ${
                  isActive(item.type)
                    ? 'text-[#8C271E] dark:text-[#FFB4AB] bg-[#8C271E]/10 dark:bg-[#8C271E]/20'
                    : 'text-[#544D46] dark:text-[#B8B0A6] hover:text-[#1F1C1A] dark:hover:text-white hover:bg-[#EFE9DF]/50 dark:hover:bg-[#25201E]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right Utilities */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            {/* Search Trigger */}
            <button
              type="button"
              onClick={onOpenSearch}
              className="p-2 sm:px-3 sm:py-2 rounded-xl border border-[#E5DFD7] dark:border-[#2C2724] bg-white/60 dark:bg-[#1C1816] text-[#544D46] dark:text-[#C7C0B7] hover:text-[#8C271E] dark:hover:text-[#FFB4AB] hover:border-[#8C271E]/40 transition-colors flex items-center gap-2"
              title="সাহিত্যকর্ম খুঁজুন"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline text-xs text-[#8A8178]">খুঁজুন...</span>
            </button>

            {/* Dark/Light Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-[#E5DFD7] dark:border-[#2C2724] bg-white/60 dark:bg-[#1C1816] text-[#544D46] dark:text-[#C7C0B7] hover:text-[#8C271E] dark:hover:text-[#FFB4AB] transition-colors"
              title={theme === 'dark' ? 'উজ্জ্বল মোড' : 'ডার্ক মোড'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-700" />
              )}
            </button>

            {/* Admin Dashboard shortcut */}
            <button
              type="button"
              onClick={() => handleLinkClick('admin')}
              className={`p-2 rounded-xl border transition-colors ${
                isActive('admin')
                  ? 'bg-[#8C271E] text-white border-[#8C271E]'
                  : 'border-[#E5DFD7] dark:border-[#2C2724] bg-white/60 dark:bg-[#1C1816] text-[#544D46] dark:text-[#C7C0B7] hover:text-[#8C271E]'
              }`}
              title="অ্যাডমিন প্যানেল"
            >
              <ShieldCheck className={`w-4 h-4 ${isAdmin ? 'text-emerald-500' : ''}`} />
            </button>

            {/* Mobile menu hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl border border-[#E5DFD7] dark:border-[#2C2724] bg-white/60 dark:bg-[#1C1816] text-[#544D46] dark:text-[#C7C0B7]"
              title="মেনু"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FAF8F5] dark:bg-[#171514] border-b border-[#EBE5DE] dark:border-[#24201E] px-4 pt-2 pb-6 space-y-1 shadow-lg">
          {navLinks.map((item) => (
            <button
              key={item.type}
              type="button"
              onClick={() => handleLinkClick(item.type)}
              className={`w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                isActive(item.type)
                  ? 'bg-[#8C271E]/10 dark:bg-[#8C271E]/20 text-[#8C271E] dark:text-[#FFB4AB]'
                  : 'text-[#4A433D] dark:text-[#D4CCC2] hover:bg-[#EFE9DF]/50 dark:hover:bg-[#201C1A]'
              }`}
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleLinkClick('admin')}
            className="w-full text-left px-4 py-3 rounded-xl text-base font-medium text-[#8C271E] dark:text-[#FFB4AB] flex items-center justify-between pt-3 border-t border-[#EFECE8] dark:border-[#25211F]"
          >
            <span>অ্যাডমিন ড্যাশবোর্ড</span>
            <ShieldCheck className="w-4 h-4" />
          </button>
        </div>
      )}
    </header>
  );
}
