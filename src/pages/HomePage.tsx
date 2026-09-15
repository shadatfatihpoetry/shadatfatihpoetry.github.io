import { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { PoemCard } from '../components/PoemCard';
import { StoryCard } from '../components/StoryCard';
import { NovelCard } from '../components/NovelCard';
import { ActivePage } from '../types';
import { SEOHead } from '../components/SEOHead';
import { Feather, BookOpen, Sparkles, Flame, ArrowRight, User } from 'lucide-react';
import { toBengaliNumber } from '../utils/bengaliUtils';

interface HomePageProps {
  onNavigate: (page: ActivePage) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const { poems, stories, novels, getChaptersForNovel } = useData();

  // Published only
  const publishedPoems = useMemo(() => poems.filter((p) => p.published), [poems]);
  const publishedStories = useMemo(() => stories.filter((s) => s.published), [stories]);
  const publishedNovels = useMemo(() => novels.filter((n) => n.published), [novels]);

  // Featured poetry (top viewed or first 3)
  const featuredPoems = useMemo(() => {
    return [...publishedPoems].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 3);
  }, [publishedPoems]);

  // Latest
  const latestPoems = useMemo(() => publishedPoems.slice(0, 4), [publishedPoems]);
  const latestStories = useMemo(() => publishedStories.slice(0, 3), [publishedStories]);
  const latestNovels = useMemo(() => publishedNovels.slice(0, 2), [publishedNovels]);

  // Popular Content (top view count across all content)
  const popularItems = useMemo(() => {
    const p = publishedPoems.map((item) => ({ ...item, contentType: 'poem' as const }));
    const s = publishedStories.map((item) => ({ ...item, contentType: 'story' as const }));
    const n = publishedNovels.map((item) => ({ ...item, contentType: 'novel' as const }));
    return [...p, ...s, ...n].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
  }, [publishedPoems, publishedStories, publishedNovels]);

  return (
    <div className="min-h-screen space-y-20 pb-16">
      <SEOHead
        title="প্রচ্ছদ"
        description="Shadat Fatih Poetry — বাংলা সাহিত্যের আধুনিক ডিজিটাল প্রকাশনা। শাহাদাৎ ফাতিহ-এর নির্বাচিত কবিতা, গল্প ও উপন্যাস।"
      />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 md:py-28 border-b border-[#c8d8e4] dark:border-[#2b6777]">
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[radial-gradient(#2b6777_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#2b6777]/5 dark:bg-[#52ab98]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2b6777]/10 dark:bg-[#2b6777]/20 text-[#2b6777] dark:text-[#52ab98] text-xs font-semibold mb-6 tracking-wide">
            <Feather className="w-3.5 h-3.5" />
            <span>শাহাদাৎ ফাতিহ সাহিত্য সম্ভার</span>
          </div>

          <h1 className="font-brand text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#2b6777] dark:text-[#FAF7F2] mb-2">
            Shadat Fatih Poetry
          </h1>

          <p className="font-serif text-2xl sm:text-3xl text-[#2b6777] dark:text-[#52ab98] font-bold tracking-normal mb-3">
            শাহাদাৎ ফাতিহ
          </p>

          <p className="font-serif text-base sm:text-lg text-[#8A8178] dark:text-[#A39A90] font-medium tracking-wide mb-6">
            কবিতা • গল্প • উপন্যাস
          </p>

          <p className="font-serif text-base sm:text-lg text-[#5E554D] dark:text-[#BDB4AA] max-w-2xl mx-auto leading-relaxed mb-10">
            শব্দ যখন মনের গহীনে আঁকা অনুভূতির রূপ নেয়, তখনই জন্ম নেয় খাঁটি সাহিত্য। হৃদয়ের নিভৃত কুটিরে রচিত কবিতা, রক্তমাংসের উপাখ্যানে বোনা ছোটগল্প ও জীবনের বিশাল ক্যানভাসে রচিত উপন্যাস পড়ার এক শান্তিময় আঙিনা।
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => {
                onNavigate({ type: 'poems' });
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#2b6777] hover:bg-[#A32E24] text-white font-medium text-base shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <Feather className="w-4 h-4" />
              <span>কবিতা পড়ুন</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onNavigate({ type: 'novels' });
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white dark:bg-[#1E1A18] hover:bg-[#F4ECE3] dark:hover:bg-[#2A2421] text-[#2C2724] dark:text-[#EAE5DE] border border-[#DDD5CB] dark:border-[#352F2B] font-medium text-base shadow-xs hover:shadow-md transition-all duration-200"
            >
              <BookOpen className="w-4 h-4 text-[#2b6777]" />
              <span>উপন্যাস পড়ুন</span>
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        {/* FEATURED POETRY */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs text-[#2b6777] dark:text-[#52ab98] font-bold tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>নির্বাচিত রচনা</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2b6777] dark:text-[#FAF7F2]">
                নির্বাচিত কবিতা
              </h2>
              <p className="text-sm text-[#736B63] dark:text-[#A8A096] mt-1">
                বিশেষভাবে সংকলিত ও গভীর অনুভূতিসমৃদ্ধ কিছু পংক্তিমালা
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onNavigate({ type: 'poems' });
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2b6777] dark:text-[#52ab98] hover:underline"
            >
              <span>সব কবিতা দেখুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredPoems.map((poem) => (
              <PoemCard
                key={poem.id}
                poem={poem}
                onOpen={(id) => {
                  onNavigate({ type: 'poem-detail', id });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            ))}
          </div>
        </section>

        {/* LATEST NOVELS */}
        {latestNovels.length > 0 && (
          <section className="bg-linear-to-b from-[#F5EFE9]/40 to-transparent dark:from-[#1A1715]/40 dark:to-transparent rounded-3xl p-6 sm:p-10 border border-[#c8d8e4]/80 dark:border-[#282321]/80">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
              <div>
                <span className="text-xs font-bold text-[#2b6777] dark:text-[#52ab98] tracking-wider">
                  ধারাবাহিক আখ্যান
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2b6777] dark:text-[#FAF7F2] mt-1">
                  সাম্প্রতিক উপন্যাস
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  onNavigate({ type: 'novels' });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2b6777] dark:text-[#52ab98] hover:underline"
              >
                <span>সব উপন্যাস</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-6">
              {latestNovels.map((novel) => (
                <NovelCard
                  key={novel.id}
                  novel={novel}
                  chapterCount={getChaptersForNovel(novel.id).length}
                  onOpen={(id) => {
                    onNavigate({ type: 'novel-detail', id });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {/* LATEST POEMS & LATEST STORIES DUAL SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Latest Poems */}
          <section>
            <div className="flex items-center justify-between mb-8 pb-3 border-b border-[#c8d8e4] dark:border-[#262220]">
              <h2 className="font-serif text-2xl font-bold text-[#2b6777] dark:text-[#FAF7F2] flex items-center gap-2">
                <Feather className="w-5 h-5 text-[#2b6777]" />
                নতুন প্রকাশিত কবিতা
              </h2>
              <button
                type="button"
                onClick={() => onNavigate({ type: 'poems' })}
                className="text-xs font-medium text-[#2b6777] dark:text-[#52ab98] hover:underline"
              >
                সকল কবিতা
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {latestPoems.map((poem) => (
                <PoemCard
                  key={poem.id}
                  poem={poem}
                  onOpen={(id) => {
                    onNavigate({ type: 'poem-detail', id });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              ))}
            </div>
          </section>

          {/* Latest Stories */}
          <section>
            <div className="flex items-center justify-between mb-8 pb-3 border-b border-[#c8d8e4] dark:border-[#262220]">
              <h2 className="font-serif text-2xl font-bold text-[#2b6777] dark:text-[#FAF7F2] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#2b6777]" />
                নতুন ছোটগল্প
              </h2>
              <button
                type="button"
                onClick={() => onNavigate({ type: 'stories' })}
                className="text-xs font-medium text-[#2b6777] dark:text-[#52ab98] hover:underline"
              >
                সকল গল্প
              </button>
            </div>
            <div className="space-y-6">
              {latestStories.map((story) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  onOpen={(id) => {
                    onNavigate({ type: 'story-detail', id });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              ))}
            </div>
          </section>
        </div>

        {/* POPULAR CONTENT SECTION */}
        <section className="bg-white dark:bg-[#171514] border border-[#c8d8e4] dark:border-[#262220] rounded-2xl p-6 sm:p-10 shadow-xs">
          <div className="flex items-center gap-2.5 mb-6 text-[#2b6777] dark:text-[#52ab98]">
            <Flame className="w-5 h-5" />
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2b6777] dark:text-[#FAF7F2]">
              পাঠকপ্রিয় রচনা
            </h2>
          </div>
          <p className="text-sm text-[#736B63] dark:text-[#A8A096] mb-8 -mt-3">
            সর্বাধিক পঠিত ও প্রশংসিত সাহিত্যকর্মের সংকলন
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularItems.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => {
                  if (item.contentType === 'poem') onNavigate({ type: 'poem-detail', id: item.id });
                  else if (item.contentType === 'story') onNavigate({ type: 'story-detail', id: item.id });
                  else onNavigate({ type: 'novel-detail', id: item.id });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="group cursor-pointer p-5 rounded-xl border border-[#F2ECE4] dark:border-[#272321] hover:border-[#2b6777]/40 hover:bg-[#FAF7F2] dark:hover:bg-[#1E1A18] transition-all flex items-start gap-4"
              >
                <span className="font-brand font-bold text-2xl text-[#2b6777]/30 group-hover:text-[#2b6777] transition-colors">
                  0{idx + 1}
                </span>
                <div className="space-y-1 grow">
                  <div className="flex items-center justify-between text-xs text-[#8A8178]">
                    <span className="font-medium text-[#2b6777] dark:text-[#52ab98]">
                      {item.contentType === 'poem' ? 'কবিতা' : item.contentType === 'story' ? 'গল্প' : 'উপন্যাস'}
                    </span>
                    <span>{toBengaliNumber(item.views || 0)} পাঠক</span>
                  </div>
                  <h3 className="font-serif font-bold text-lg text-[#2b6777] dark:text-[#EFECE8] group-hover:text-[#2b6777] transition-colors leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#736B63] dark:text-[#A8A096] line-clamp-2">
                    {item.excerpt || ('content' in item && item.content ? item.content.slice(0, 100) : '')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* AUTHOR INTRODUCTION SECTION */}
        <section className="bg-linear-to-br from-[#F5EFE9] to-[#E9DFD5] dark:from-[#1E1A18] dark:to-[#141211] rounded-3xl p-8 sm:p-12 border border-[#E3DBD0] dark:border-[#2E2824]">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="shrink-0 relative">
              <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl overflow-hidden shadow-xl border-4 border-white dark:border-[#2C2724] bg-linear-to-b from-[#C9BDB0] to-[#8C7D6F] flex items-center justify-center text-white">
                <img
                  src="/images/shadat.png"
                  alt="শাহাদাৎ ফাতিহ"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-3 -right-3 px-3 py-1 bg-[#2b6777] text-white text-xs font-semibold rounded-full shadow-md">
                কবি ও কথাশিল্পী
              </div>
            </div>

            <div className="text-center md:text-left space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[#2b6777] dark:text-[#52ab98]">
                লেখক পরিচিতি
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2b6777] dark:text-[#FAF7F2]">
                শাহাদাৎ ফাতিহ
              </h2>
              <p className="font-serif text-[#524A42] dark:text-[#C7C0B7] text-base leading-relaxed">
                সমকালীন বাংলা সাহিত্যের এক সংবেদনশীল কণ্ঠস্বর। তাঁর কবিতায় নদীর অববাহিকার মায়া, ধূলিধূসর অপরাহ্নের স্মৃতি ও মানবজীবনের অনন্ত একাকিত্ব গভীর ব্যঞ্জনায় উন্মোচিত হয়। গল্প ও উপন্যাসে তিনি প্রান্তিক মানুষ ও সমাজের অন্তর্নিহিত দ্বন্দ্বকে দরদী তুলিতে ফুটিয়ে তোলেন।
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onNavigate({ type: 'author' });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2b6777] hover:bg-[#A32E24] text-white text-sm font-medium transition-colors shadow-sm"
                >
                  <span>লেখক সম্পর্কে জানুন</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
