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
      <div className="max-w-2xl mx-auto py-24 px-4 text-center space-y-4 sf-glass rounded-3xl">
        <h2 className="font-serif text-2xl font-bold text-[#173b46] dark:text-[#EEF5F7]">
          উপন্যাসটি খুঁজে পাওয়া যায়নি
        </h2>
        <p className="text-sm text-[#527785] dark:text-[#AFC4CA]">
          কাঙ্ক্ষিত উপন্যাসটির তথ্য পাওয়া যায়নি।
        </p>
        <button
          type="button"
          onClick={() => onNavigate({ type: 'novels' })}
          className="px-5 py-2.5 rounded-xl bg-[#2b6777] text-white text-sm font-medium sf-premium-button"
        >
          সকল উপন্যাস দেখুন
        </button>
      </div>
    );
  }

  const firstChapter = chapters.length > 0 ? chapters[0] : null;

  return (
    <div className="w-full min-w-0 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 min-h-screen sf-glow">
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
          className="inline-flex items-center gap-1.5 text-xs text-[#527785] dark:text-[#AFC4CA] hover:text-[#2b6777] dark:hover:text-[#52ab98] transition-all duration-300"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>সকল উপন্যাসে ফিরে যান</span>
        </button>
      </div>

      {/* Novel Header Info */}
      <section className="sf-glass sf-premium-card border border-[#DCE7EA] dark:border-[#303D41] rounded-3xl p-6 sm:p-10 shadow-[0_20px_60px_rgba(43,103,119,0.07)] flex flex-col md:flex-row gap-8 items-start">
        {/* Large Cover */}
        <div className="w-full md:w-72 h-80 md:h-96 shrink-0 rounded-2xl overflow-hidden shadow-[0_18px_50px_rgba(43,103,119,0.12)] border border-[#DCE7EA] dark:border-[#303D41] bg-[#EAF3F5] dark:bg-[#1D292D]">
          {novel.cover_url ? (
            <img
              src={novel.cover_url}
              alt={novel.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-linear-to-b from-[#DCECEF] to-[#BFD7DD] text-[#2b6777] font-serif text-3xl">
              উপন্যাস
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-4 grow">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-[#2b6777]/10 dark:bg-[#2b6777]/20 text-[#2b6777] dark:text-[#8ec9bd]">
              ধারাবাহিক উপন্যাস
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#173b46] dark:text-[#EEF5F7] leading-tight">
            {novel.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-[#527785] dark:text-[#AFC4CA] pt-1 border-b border-[#DCE7EA] dark:border-[#303D41] pb-4">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-[#2b6777]" />
              <span className="font-medium text-[#365966] dark:text-[#D5E3E7]">শাহাদাৎ ফাতিহ</span>
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
            <h3 className="font-serif font-bold text-base text-[#173b46] dark:text-[#EEF5F7]">
              কাহিনী সংক্ষেপ:
            </h3>
            <p className="font-serif text-[#365966] dark:text-[#D5E3E7] text-sm sm:text-base leading-relaxed">
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
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#2b6777] hover:bg-[#245867] text-white text-sm font-medium sf-premium-button transition-all shadow-[0_10px_30px_rgba(43,103,119,0.18)] hover:shadow-[0_16px_40px_rgba(43,103,119,0.25)] hover:-translate-y-0.5 active:scale-[0.98]"
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
        <div className="flex items-center justify-between pb-3 border-b border-[#DCE7EA] dark:border-[#303D41]">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#173b46] dark:text-[#EEF5F7] flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-[#2b6777]" />
              অধ্যায়সমূহ
            </h2>
            <p className="text-xs text-[#527785] dark:text-[#AFC4CA] mt-1">
              ধারাবাহিকভাবে যেকোনো অধ্যায়ে ক্লিক করে পড়া শুরু করুন
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#FAF4ED] dark:bg-[#25201E] border border-[#E9DFD3] dark:border-[#38312D] text-[#2b6777] dark:text-[#FFB4AB]">
            {toBengaliNumber(chapters.length)} টি পর্ব
          </span>
        </div>

        {chapters.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {chapters.map((ch, index) => (
              <div
                style={{
                  animation: `sf-card-enter 650ms cubic-bezier(0.22, 1, 0.36, 1) ${index * 70}ms both`,
                }}
                key={ch.id}
                onClick={() => {
                  onNavigate({
                    type: 'chapter-detail',
                    novelId: novel.id,
                    chapterNumber: ch.chapter_number,
                  });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="group cursor-pointer sf-glass p-5 rounded-2xl border border-[#DCE7EA] dark:border-[#303D41] hover:border-[#2b6777]/40 hover:bg-[#F2F8F9] dark:hover:bg-[#1D292D] hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(43,103,119,0.10)] transition-all duration-300 flex items-center justify-between"
              >
                <div className="space-y-1 grow pr-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#2b6777] dark:text-[#FFB4AB]">
                    <span>অধ্যায় {toBengaliNumber(ch.chapter_number)}</span>
                    {ch.created_at && (
                      <span className="text-[11px] text-[#7C9AA3] font-normal">
                        • {formatBengaliDate(ch.created_at)}
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-[#1F1C1A] dark:text-[#EDE8E3] group-hover:text-[#2b6777] dark:group-hover:text-[#FFB4AB] transition-colors leading-snug">
                    {ch.title}
                  </h3>
                  <p className="text-xs text-[#527785] dark:text-[#AFC4CA] line-clamp-1">
                    {ch.content.slice(0, 70)}...
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#FAF4ED] dark:bg-[#25201E] group-hover:bg-[#8C271E] text-[#2b6777] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                  <PlayCircle className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 sf-glass rounded-2xl border border-[#DCE7EA] dark:border-[#303D41] shadow-[0_10px_40px_rgba(43,103,119,0.05)]">
            <p className="font-serif text-[#527785] dark:text-[#AFC4CA]">
              এই উপন্যাসের অধ্যায়সমূহ শীঘ্রই প্রকাশিত হবে।
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
