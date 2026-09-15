import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { ReadingSettings } from '../types';
import { Sun, Moon, Share2, Copy, Check, Type, Maximize2 } from 'lucide-react';

interface ReadingToolbarProps {
  settings: ReadingSettings;
  onUpdateSettings: (updates: Partial<ReadingSettings>) => void;
  rawTextToCopy: string;
  title: string;
}

export function ReadingToolbar({
  settings,
  onUpdateSettings,
  rawTextToCopy,
  title,
}: ReadingToolbarProps) {
  const { theme, toggleTheme } = useTheme();
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${title}\n— শাহাদাৎ ফাতিহ\n\n${rawTextToCopy}\n\n(উৎস: Shadat Fatih Poetry)`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${title} — Shadat Fatih Poetry`,
          text: `শাহাদাৎ ফাতিহ-এর সাহিত্যকর্ম পড়ুন: ${title}`,
          url: window.location.href,
        });
      } catch {
        // user cancelled or unsupported
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      setShared(true);
      setTimeout(() => setShared(false), 2500);
    }
  };

  const cycleFontSize = () => {
    const order: ReadingSettings['fontSize'][] = ['small', 'normal', 'large', 'extra-large'];
    const currentIndex = order.indexOf(settings.fontSize);
    const nextIndex = (currentIndex + 1) % order.length;
    onUpdateSettings({ fontSize: order[nextIndex] });
  };

  const cycleWidth = () => {
    const order: ReadingSettings['readingWidth'][] = ['narrow', 'medium', 'wide'];
    const currentIndex = order.indexOf(settings.readingWidth);
    const nextIndex = (currentIndex + 1) % order.length;
    onUpdateSettings({ readingWidth: order[nextIndex] });
  };

  const fontSizeLabels: Record<ReadingSettings['fontSize'], string> = {
    small: 'ছোট',
    normal: 'সাধারণ',
    large: 'বড়',
    'extra-large': 'বৃহৎ',
  };

  const widthLabels: Record<ReadingSettings['readingWidth'], string> = {
    narrow: 'সংকীর্ণ',
    medium: 'মাঝারি',
    wide: 'প্রশস্ত',
  };

  return (
    <aside aria-label="Reading Controls" className="sticky top-20 z-20 py-2.5 px-4 mb-8 bg-[#FAF8F5]/90 dark:bg-[#151312]/90 backdrop-blur-md border-y border-[#EBE5DE] dark:border-[#262220]">
      <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Typography Controls */}
        <div className="flex items-center gap-2">
          {/* Font Size button */}
          <button
            type="button"
            onClick={cycleFontSize}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E0D8CE] dark:border-[#332D29] bg-white dark:bg-[#1E1A18] hover:bg-[#F2ECE4] dark:hover:bg-[#282320] text-[#3D352F] dark:text-[#D4CCC2] transition-colors"
            title="হরফের আকার পরিবর্তন করুন"
          >
            <Type className="w-3.5 h-3.5" />
            <span>হরফ: {fontSizeLabels[settings.fontSize]}</span>
          </button>

          {/* Reading Width button */}
          <button
            type="button"
            onClick={cycleWidth}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E0D8CE] dark:border-[#332D29] bg-white dark:bg-[#1E1A18] hover:bg-[#F2ECE4] dark:hover:bg-[#282320] text-[#3D352F] dark:text-[#D4CCC2] transition-colors"
            title="পঠন প্রস্থ পরিবর্তন করুন"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>প্রস্থ: {widthLabels[settings.readingWidth]}</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E0D8CE] dark:border-[#332D29] bg-white dark:bg-[#1E1A18] hover:bg-[#F2ECE4] dark:hover:bg-[#282320] text-[#3D352F] dark:text-[#D4CCC2] transition-colors"
            title="থিম পরিবর্তন"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">উজ্জ্বল মোড</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-700" />
                <span className="hidden sm:inline">ডার্ক মোড</span>
              </>
            )}
          </button>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E0D8CE] dark:border-[#332D29] bg-white dark:bg-[#1E1A18] hover:bg-[#F2ECE4] dark:hover:bg-[#282320] text-[#3D352F] dark:text-[#D4CCC2] transition-colors"
            title="অনুলিপি বা কপি করুন"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600 font-medium">কপি হয়েছে!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>কপি করুন</span>
              </>
            )}
          </button>

          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#8C271E]/30 dark:border-[#C94A3D]/40 bg-[#8C271E]/5 dark:bg-[#8C271E]/10 hover:bg-[#8C271E]/15 text-[#8C271E] dark:text-[#FFB4AB] font-medium transition-colors"
            title="শেয়ার করুন"
          >
            {shared ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>লিংক কপি হয়েছে</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>শেয়ার</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
