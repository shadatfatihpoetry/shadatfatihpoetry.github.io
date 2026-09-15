import { useState, useMemo, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { ReadingToolbar } from '../components/ReadingToolbar';
import { SEOHead } from '../components/SEOHead';
import { ActivePage, ReadingSettings } from '../types';
import { ArrowLeft, ArrowRight, List, BookOpen, Calendar, Eye } from 'lucide-react';
import { toBengaliNumber, formatBengaliDate } from '../utils/bengaliUtils';

interface ChapterReadingPageProps {
  novelId: string;
  chapterNumber: number;
  onNavigate: (page: ActivePage) => void;
}

export function ChapterReadingPage({
  novelId,
  chapterNumber,
  onNavigate,
}: ChapterReadingPageProps) {
  const { novels, getChaptersForNovel, incrementChapterViews } = useData();
  const { isAdmin } = useAuth();

  const [settings, setSettings] = useState<ReadingSettings>(() => {
    const saved = localStorage.getItem('shadat_reading_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return { fontSize: 'normal', readingWidth: 'medium' };
  });

  const [showChapterDrawer, setShowChapterDrawer] = useState(false);

  const novel = useMemo(() => novels.find((n) => n.id === novelId), [novels, novelId]);
  const isNovelAccessible = Boolean(novel && (novel.published || isAdmin));

  const allNovelChapters = useMemo(() => {
    if (!novel || !isNovelAccessible) return [];
    const all = getChaptersForNovel(novel.id);
    return (isAdmin ? all : all.filter((c) => c.published))
      .sort((a, b) => a.chapter_number - b.chapter_number);
  }, [novel, isNovelAccessible, isAdmin, getChaptersForNovel]);

  const currentIndex = useMemo(() => {
    return allNovelChapters.findIndex((c) => c.chapter_number === chapterNumber);
  }, [allNovelChapters, chapterNumber]);

  const chapter = currentIndex !== -1 ? allNovelChapters[currentIndex] : undefined;
  const prev = currentIndex > 0 ? allNovelChapters[currentIndex - 1] : undefined;
  const next = currentIndex < allNovelChapters.length - 1 ? allNovelChapters[currentIndex + 1] : undefined;

  // Safely increment chapter views
  useEffect(() => {
    if (chapter?.id && chapter.published && novel?.published) {
      incrementChapterViews(chapter.id);
    }
  }, [chapter?.id, chapter?.published, novel?.published, incrementChapterViews]);

  const handleUpdateSettings = (updates: Partial<ReadingSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem('shadat_reading_settings', JSON.stringify(next));
      return next;
    });
  };

  if (!novel || !isNovelAccessible || !chapter) {
    return (
      <div className="max-w-2xl mx-auto py-24 px-4 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-[#1F1C1A] dark:text-[#F3EFEB]">
          অধ্যায়টি খুঁজে পাওয়া যায়নি
        </h2>
        <p className="text-sm text-[#736B63] dark:text-[#A8A096]">
          কাঙ্ক্ষিত অধ্যায়টি উপলব্ধ নেই বা মুছে ফেলা হয়েছে।
        </p>
        <button
          type="button"
          onClick={() => onNavigate({ type: 'novels' })}
          className="px-5 py-2.5 rounded-xl bg-[#8C271E] text-white text-sm font-medium"
        >
          সকল উপন্যাস দেখুন
        </button>
      </div>
    );
  }

  const widthClasses = {
    narrow: 'max-w-xl',
    medium: 'max-w-2xl',
    wide: 'max-w-3xl',
  }[settings.readingWidth];

  const fontSizeClasses = {
    small: 'text-base sm:text-[17px] leading-relaxed',
    normal: 'text-lg sm:text-[19px] leading-relaxed',
    large: 'text-xl sm:text-[21px] leading-relaxed',
    'extra-large': 'text-2xl sm:text-[25px] leading-relaxed',
  }[settings.fontSize];

  return (
    <div className="min-h-screen pb-20">
      <SEOHead
        title={`${chapter.title} — ${novel.title}`}
        description={`${novel.title}-এর অধ্যায় ${toBengaliNumber(chapter.chapter_number)}: ${chapter.title}`}
        ogImage={novel.cover_url || undefined}
        canonicalPath={`/novel/${novel.id}/chapter/${chapter.chapter_number}`}
      />

      {/* Reading Controls Toolbar */}
      <ReadingToolbar
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        rawTextToCopy={chapter.content}
        title={`${novel.title} — অধ্যায় ${toBengaliNumber(chapter.chapter_number)}: ${chapter.title}`}
      />

      <main className={`mx-auto px-4 sm:px-6 transition-all duration-300 ${widthClasses}`}>
        {/* Navigation Breadcrumb / Back */}
        <div className="flex items-center justify-between mb-8 text-xs text-[#7A7167] dark:text-[#A69E93]">
          <button
            type="button"
            onClick={() => onNavigate({ type: 'novel-detail', id: novel.id })}
            className="inline-flex items-center gap-1.5 hover:text-[#8C271E] dark:hover:text-[#FFB4AB] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>উপন্যাসের মূল পাতা: <strong className="font-serif">{novel.title}</strong></span>
          </button>

          {/* Chapters quick picker button */}
          <button
            type="button"
            onClick={() => setShowChapterDrawer(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-[#E0D8CE] dark:border-[#332D29] bg-white dark:bg-[#1C1816] hover:border-[#8C271E]/50 text-[#8C271E] dark:text-[#FFB4AB] font-medium transition-colors"
          >
            <List className="w-3.5 h-3.5" />
            <span>অধ্যায় তালিকা</span>
          </button>
        </div>

        {/* Chapter Header */}
        <header className="text-center space-y-3 mb-10 pb-6 border-b border-[#EBE5DE] dark:border-[#262220]">
          <div
            onClick={() => onNavigate({ type: 'novel-detail', id: novel.id })}
            className="cursor-pointer inline-block text-xs font-semibold uppercase tracking-widest text-[#8C271E] dark:text-[#FFB4AB] hover:underline"
          >
            {novel.title}
          </div>

          <h2 className="text-sm sm:text-base font-semibold text-[#8C271E] dark:text-[#FFB4AB] tracking-wide">
            অধ্যায় {toBengaliNumber(chapter.chapter_number)}
          </h2>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#1F1C1A] dark:text-[#FAF7F2] leading-tight">
            {chapter.title}
          </h1>

          <div className="flex items-center justify-center gap-4 text-xs text-[#8A8178] dark:text-[#A39A90] pt-2">
            <span>লেখক: <strong className="font-medium text-[#4D453E] dark:text-[#DDD7D0]">শাহাদাৎ ফাতিহ</strong></span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatBengaliDate(chapter.created_at)}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              <span>{toBengaliNumber(chapter.views || 0)} পাঠ</span>
            </span>
          </div>
        </header>

        {/* Chapter Content with Bengali Line Breaks Preserved */}
        <article className="bg-white/60 dark:bg-[#181615]/60 border border-[#EBE5DE]/80 dark:border-[#282422]/80 rounded-3xl p-6 sm:p-12 shadow-xs backdrop-blur-xs">
          <div
            className={`chapter-content text-[#2A2522] dark:text-[#ECE7E1] space-y-6 ${fontSizeClasses}`}
            style={{ fontFamily: "'Noto Serif Bengali', serif" }}
          >
            {chapter.content}
          </div>

          <div className="mt-12 pt-6 border-t border-[#EAE4DC] dark:border-[#282422] flex justify-between items-center text-xs text-[#786E64] dark:text-[#A89E94]">
            <span className="font-serif italic">— অধ্যায় {toBengaliNumber(chapter.chapter_number)} সমাপ্ত</span>
            <span>{novel.title}</span>
          </div>
        </article>

        {/* Sequential Navigation: Prev Chapter, Chapters List, Next Chapter */}
        <nav aria-label="অধ্যায় অনুক্রম" className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Previous Chapter */}
          {prev ? (
            <button
              type="button"
              onClick={() => {
                onNavigate({
                  type: 'chapter-detail',
                  novelId: novel.id,
                  chapterNumber: prev.chapter_number,
                });
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="p-3.5 rounded-xl border border-[#E5DFD7] dark:border-[#2C2724] bg-white dark:bg-[#181615] hover:border-[#8C271E]/40 text-left group transition-all"
            >
              <span className="text-[11px] text-[#8A8178] flex items-center gap-1 mb-0.5">
                <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
                পূর্ববর্তী অধ্যায়
              </span>
              <span className="font-serif font-bold text-xs sm:text-sm text-[#1F1C1A] dark:text-[#EDE8E3] group-hover:text-[#8C271E] dark:group-hover:text-[#FFB4AB] line-clamp-1">
                অধ্যায় {toBengaliNumber(prev.chapter_number)}: {prev.title}
              </span>
            </button>
          ) : (
            <div className="p-3.5 rounded-xl border border-dashed border-[#E5DFD7]/60 dark:border-[#2C2724]/60 text-center text-xs text-[#A8A096] flex items-center justify-center">
              এটি প্রথম অধ্যায়
            </div>
          )}

          {/* Jump to List */}
          <button
            type="button"
            onClick={() => onNavigate({ type: 'novel-detail', id: novel.id })}
            className="p-3.5 rounded-xl border border-[#E5DFD7] dark:border-[#2C2724] bg-white dark:bg-[#181615] hover:bg-[#FAF6F0] dark:hover:bg-[#201D1B] text-center transition-colors flex flex-col items-center justify-center"
          >
            <BookOpen className="w-4 h-4 text-[#8C271E] mb-1" />
            <span className="text-xs font-semibold text-[#1F1C1A] dark:text-[#FAF7F2]">
              অধ্যায় তালিকা
            </span>
          </button>

          {/* Next Chapter */}
          {next ? (
            <button
              type="button"
              onClick={() => {
                onNavigate({
                  type: 'chapter-detail',
                  novelId: novel.id,
                  chapterNumber: next.chapter_number,
                });
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="p-3.5 rounded-xl border border-[#E5DFD7] dark:border-[#2C2724] bg-white dark:bg-[#181615] hover:border-[#8C271E]/40 text-right group transition-all"
            >
              <span className="text-[11px] text-[#8A8178] flex items-center justify-end gap-1 mb-0.5">
                পরবর্তী অধ্যায়
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
              <span className="font-serif font-bold text-xs sm:text-sm text-[#1F1C1A] dark:text-[#EDE8E3] group-hover:text-[#8C271E] dark:group-hover:text-[#FFB4AB] line-clamp-1">
                অধ্যায় {toBengaliNumber(next.chapter_number)}: {next.title}
              </span>
            </button>
          ) : (
            <div className="p-3.5 rounded-xl border border-dashed border-[#E5DFD7]/60 dark:border-[#2C2724]/60 text-center text-xs text-[#A8A096] flex items-center justify-center">
              এটি সর্বশেষ অধ্যায়
            </div>
          )}
        </nav>
      </main>

      {/* Chapter Selection Drawer/Modal */}
      {showChapterDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#181615] rounded-2xl p-6 border border-[#E8E1D7] dark:border-[#2C2724] shadow-2xl max-h-[75vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-[#EFECE8] dark:border-[#25201E]">
              <h3 className="font-serif font-bold text-lg text-[#1F1C1A] dark:text-[#FAF7F2]">
                অধ্যায় নির্বাচন করুন
              </h3>
              <button
                type="button"
                onClick={() => setShowChapterDrawer(false)}
                className="text-xs px-2.5 py-1 rounded-md bg-[#F2ECE4] dark:bg-[#2A2522] text-[#635B53] dark:text-[#BDB4AA]"
              >
                বন্ধ করুন
              </button>
            </div>
            <div className="overflow-y-auto py-3 space-y-2 grow">
              {allNovelChapters.map((ch) => {
                const isCurrent = ch.chapter_number === chapter.chapter_number;
                return (
                  <div
                    key={ch.id}
                    onClick={() => {
                      setShowChapterDrawer(false);
                      onNavigate({
                        type: 'chapter-detail',
                        novelId: novel.id,
                        chapterNumber: ch.chapter_number,
                      });
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`p-3 rounded-xl cursor-pointer text-sm transition-colors flex items-center justify-between ${
                      isCurrent
                        ? 'bg-[#8C271E] text-white font-medium'
                        : 'hover:bg-[#FAF4ED] dark:hover:bg-[#201D1B] text-[#3D352F] dark:text-[#DDD7D0] border border-[#F0EBE4] dark:border-[#272321]'
                    }`}
                  >
                    <span>
                      অধ্যায় {toBengaliNumber(ch.chapter_number)}: {ch.title}
                    </span>
                    {isCurrent && <span className="text-xs bg-white/20 px-2 py-0.5 rounded">পড়ছেন</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
