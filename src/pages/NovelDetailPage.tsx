import { useEffect, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { SEOHead } from '../components/SEOHead';
import { ActivePage } from '../types';
import { Eye, Calendar, User, ArrowLeft, BookOpen, Layers, PlayCircle } from 'lucide-react';
import { toBengaliNumber, formatBengaliDate } from '../utils/bengaliUtils';

interface NovelDetailPageProps {
  id: string;
  onNavigate: (page: ActivePage) => void;
}

export function NovelDetailPage({ id, onNavigate }: NovelDetailPageProps) {
  const { novels, getChaptersForNovel, incrementNovelViews } = useData();
  const { isAdmin } = useAuth();

  const novel = useMemo(() => novels.find((n) => n.id === id), [novels, id]);
  const isAccessible = Boolean(novel && (novel.published || isAdmin));

  const chapters = useMemo(() => {
    if (!novel || !isAccessible) return [];
    const all = getChaptersForNovel(novel.id);
    return isAdmin ? all : all.filter((c) => c.published);
  }, [novel, isAccessible, isAdmin, getChaptersForNovel]);

  // Safely increment novel views once
  useEffect(() => {
    if (id && isAccessible && novel?.published) {
      incrementNovelViews(id);
    }
  }, [id, isAccessible, novel?.published, incrementNovelViews]);

  if (!novel || !isAccessible) {
    return (
      <div className="max-w-2xl mx-auto py-24 px-4 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-[#1F1C1A] dark:text-[#F3EFEB]">
          উপন্যাসটি খুঁজে পাওয়া যায়নি
        </h2>
        <p className="text-sm text-[#736B63] dark:text-[#A8A096]">
          কাঙ্ক্ষিত উপন্যাসটির তথ্য পাওয়া যায়নি।
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

  const firstChapter = chapters.length > 0 ? chapters[0] : null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 min-h-screen">
      <SEOHead
        title={novel.title}
        description={novel.excerpt || `${novel.title} — ধারাবাহিক উপন্যাস`}
        ogImage={novel.cover_url || undefined}
        canonicalPath={`/novel/${novel.id}`}
      />

      {/* Back button */}
      <div>
        <button
          type="button"
          onClick={() => onNavigate({ type: 'novels' })}
          className="inline-flex items-center gap-1.5 text-xs text-[#7A7167] dark:text-[#A69E93] hover:text-[#8C271E] dark:hover:text-[#FFB4AB] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>সকল উপন্যাসে ফিরে যান</span>
        </button>
      </div>

      {/* Novel Header Info */}
      <section className="bg-white dark:bg-[#181615] border border-[#EBE5DE] dark:border-[#2C2724] rounded-3xl p-6 sm:p-10 shadow-xs flex flex-col md:flex-row gap-8 items-start">
        {/* Large Cover */}
        <div className="w-full md:w-72 h-80 md:h-96 shrink-0 rounded-2xl overflow-hidden shadow-lg border border-[#E6DFD6] dark:border-[#2C2724] bg-[#EFECE8] dark:bg-[#221E1C]">
          {novel.cover_url ? (
            <img
              src={novel.cover_url}
              alt={novel.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-linear-to-b from-[#E7DACD] to-[#CFBCAB] text-[#8C271E] font-serif text-3xl">
              উপন্যাস
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-4 grow">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-[#8C271E]/10 dark:bg-[#8C271E]/20 text-[#8C271E] dark:text-[#FFB4AB]">
              ধারাবাহিক উপন্যাস
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1F1C1A] dark:text-[#FAF7F2] leading-tight">
            {novel.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-[#8A8178] dark:text-[#A39A90] pt-1 border-b border-[#F0EBE4] dark:border-[#25201E] pb-4">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-[#8C271E]" />
              <span className="font-medium text-[#4D453E] dark:text-[#DDD7D0]">শাহাদাৎ ফাতিহ</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatBengaliDate(novel.created_at)}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              <span>মোট {toBengaliNumber(chapters.length)} টি অধ্যায়</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              <span>{toBengaliNumber(novel.views || 0)} পাঠক</span>
            </span>
          </div>

          <div className="space-y-2 pt-2">
            <h3 className="font-serif font-bold text-base text-[#1F1C1A] dark:text-[#FAF7F2]">
              কাহিনী সংক্ষেপ:
            </h3>
            <p className="font-serif text-[#524A42] dark:text-[#C7C0B7] text-sm sm:text-base leading-relaxed">
              {novel.excerpt || novel.content || 'কাহিনী সংক্ষেপ এখনো যুক্ত করা হয়নি।'}
            </p>
          </div>

          {firstChapter && (
            <div className="pt-4">
              <button
                type="button"
                onClick={() => {
                  onNavigate({
                    type: 'chapter-detail',
                    novelId: novel.id,
                    chapterNumber: firstChapter.chapter_number,
                  });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#8C271E] hover:bg-[#A32E24] text-white text-sm font-medium transition-all shadow-md hover:shadow-lg"
              >
                <PlayCircle className="w-4 h-4" />
                <span>প্রথম অধ্যায় থেকে পড়া শুরু করুন</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Chapters Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#EBE5DE] dark:border-[#262220]">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1C1A] dark:text-[#FAF7F2] flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-[#8C271E]" />
              অধ্যায়সমূহ
            </h2>
            <p className="text-xs text-[#8A8178] dark:text-[#A39A90] mt-1">
              ধারাবাহিকভাবে যেকোনো অধ্যায়ে ক্লিক করে পড়া শুরু করুন
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#FAF4ED] dark:bg-[#25201E] border border-[#E9DFD3] dark:border-[#38312D] text-[#8C271E] dark:text-[#FFB4AB]">
            {toBengaliNumber(chapters.length)} টি পর্ব
          </span>
        </div>

        {chapters.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {chapters.map((ch) => (
              <div
                key={ch.id}
                onClick={() => {
                  onNavigate({
                    type: 'chapter-detail',
                    novelId: novel.id,
                    chapterNumber: ch.chapter_number,
                  });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="group cursor-pointer p-5 rounded-2xl border border-[#EBE5DE] dark:border-[#272321] bg-white dark:bg-[#181615] hover:border-[#8C271E]/40 hover:bg-[#FAF7F2] dark:hover:bg-[#201D1B] transition-all flex items-center justify-between"
              >
                <div className="space-y-1 grow pr-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#8C271E] dark:text-[#FFB4AB]">
                    <span>অধ্যায় {toBengaliNumber(ch.chapter_number)}</span>
                    {ch.created_at && (
                      <span className="text-[11px] text-[#9A9187] font-normal">
                        • {formatBengaliDate(ch.created_at)}
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-[#1F1C1A] dark:text-[#EDE8E3] group-hover:text-[#8C271E] dark:group-hover:text-[#FFB4AB] transition-colors leading-snug">
                    {ch.title}
                  </h3>
                  <p className="text-xs text-[#7A7167] dark:text-[#A8A096] line-clamp-1">
                    {ch.content.slice(0, 70)}...
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#FAF4ED] dark:bg-[#25201E] group-hover:bg-[#8C271E] text-[#8C271E] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                  <PlayCircle className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-[#181615] rounded-2xl border border-[#EBE5DE] dark:border-[#262220]">
            <p className="font-serif text-[#7A7167] dark:text-[#A8A096]">
              এই উপন্যাসের অধ্যায়সমূহ শীঘ্রই প্রকাশিত হবে।
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
