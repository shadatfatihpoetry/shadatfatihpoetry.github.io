import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { NovelCard } from '../components/NovelCard';
import { ActivePage } from '../types';
import { SEOHead } from '../components/SEOHead';
import { BookMarked, Search, ArrowUpDown } from 'lucide-react';

interface NovelsPageProps {
  onNavigate: (page: ActivePage) => void;
}

export function NovelsPage({ onNavigate }: NovelsPageProps) {
  const { novels, getChaptersForNovel } = useData();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');

  const publishedNovels = useMemo(() => novels.filter((n) => n.published), [novels]);

  const filteredNovels = useMemo(() => {
    let list = [...publishedNovels];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          (n.excerpt && n.excerpt.toLowerCase().includes(q)) ||
          (n.content && n.content.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'latest') {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else {
      list.sort((a, b) => (b.views || 0) - (a.views || 0));
    }

    return list;
  }, [publishedNovels, search, sortBy]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 min-h-screen">
      <SEOHead
        title="উপন্যাস সম্ভার"
        description="শাহাদাৎ ফাতিহ-এর দীর্ঘ কলেবরের ধারাবাহিক উপন্যাস। নদী, মাটি ও জীবনের বিস্তৃত আখ্যান।"
        canonicalPath="/novels"
      />

      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2b6777]/10 dark:bg-[#2b6777]/20 text-[#2b6777] dark:text-[#FFB4AB] text-xs font-semibold">
          <BookMarked className="w-3.5 h-3.5" />
          <span>দীর্ঘ আখ্যান</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#173b46] dark:text-[#FAF7F2]">
          উপন্যাস সম্ভার
        </h1>
        <p className="font-serif text-sm sm:text-base text-[#6E645B] dark:text-[#ABA298] leading-relaxed">
          ধারাবাহিক অধ্যায়ে বিভক্ত পূর্ণাঙ্গ উপন্যাস। চরিত্রের মনস্তাত্ত্বিক বিস্তার ও জীবনের গভীর দর্শনকে স্পর্শ করা সাহিত্যিক সৃষ্টি।
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#171514] border border-[#DCE7EA] dark:border-[#2C2724] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#8A8178] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="উপন্যাস খুঁজুন..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-[#E5DFD7] dark:border-[#332D29] bg-[#FAF8F5] dark:bg-[#1E1A18] text-[#173b46] dark:text-[#EEF5F7] placeholder-[#9E958C] focus:outline-hidden focus:border-[#2b6777]"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
          <span className="text-[#8A8178] flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" /> সাজান:
          </span>
          <button
            type="button"
            onClick={() => setSortBy('latest')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              sortBy === 'latest'
                ? 'bg-[#2b6777] text-white'
                : 'bg-[#F2ECE4] dark:bg-[#25201E] text-[#544D46] dark:text-[#BFB6AB]'
            }`}
          >
            নতুন
          </button>
          <button
            type="button"
            onClick={() => setSortBy('popular')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              sortBy === 'popular'
                ? 'bg-[#2b6777] text-white'
                : 'bg-[#F2ECE4] dark:bg-[#25201E] text-[#544D46] dark:text-[#BFB6AB]'
            }`}
          >
            জনপ্রিয়
          </button>
        </div>
      </div>

      {/* Novels List */}
      {filteredNovels.length > 0 ? (
        <div className="space-y-6">
          {filteredNovels.map((novel, index) => (
            <div
              key={novel.id}
              className="sf-premium-card"
              style={{
                animation: `sf-card-enter 650ms cubic-bezier(0.22, 1, 0.36, 1) ${index * 80}ms both`,
              }}
            >
              <NovelCard
                novel={novel}
                chapterCount={getChaptersForNovel(novel.id).length}
                onOpen={(id) => {
                  onNavigate({ type: 'novel-detail', id });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-[#171514] rounded-2xl border border-[#DCE7EA] dark:border-[#303D41]">
          <BookMarked className="w-10 h-10 text-[#2b6777] opacity-40 mx-auto mb-3" />
          <h3 className="font-serif text-xl font-bold text-[#173b46] dark:text-[#EEF5F7]">
            কোনো উপন্যাস খুঁজে পাওয়া যায়নি
          </h3>
          <p className="text-sm text-[#527785] dark:text-[#AFC4CA] mt-1">
            অন্য কোনো শিরোনাম লিখে চেষ্টা করুন।
          </p>
        </div>
      )}
    </div>
  );
}
