import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { StoryCard } from '../components/StoryCard';
import { ActivePage } from '../types';
import { SEOHead } from '../components/SEOHead';
import { BookOpen, Search, ArrowUpDown } from 'lucide-react';
import { toBengaliNumber } from '../utils/bengaliUtils';

interface StoriesPageProps {
  onNavigate: (page: ActivePage) => void;
}

export function StoriesPage({ onNavigate }: StoriesPageProps) {
  const { stories } = useData();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const publishedStories = useMemo(() => stories.filter((s) => s.published), [stories]);

  const filteredStories = useMemo(() => {
    let list = [...publishedStories];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          (s.excerpt && s.excerpt.toLowerCase().includes(q)) ||
          s.content.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'latest') {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === 'popular') {
      list.sort((a, b) => (b.views || 0) - (a.views || 0));
    }

    return list;
  }, [publishedStories, search, sortBy]);

  const totalPages = Math.ceil(filteredStories.length / itemsPerPage) || 1;
  const paginatedStories = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStories.slice(start, start + itemsPerPage);
  }, [filteredStories, currentPage, itemsPerPage]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 min-h-screen min-w-0 overflow-x-hidden sf-glow">
      <SEOHead
        title="গল্প সম্ভার"
        description="শাহাদাৎ ফাতিহ-এর প্রকাশিত ছোটগল্প সংকলন। জীবনের বহুমাত্রিক অভিজ্ঞতা ও মানবিক সম্পর্কের গভীর আখ্যান।"
        canonicalPath="/stories"
      />

      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2b6777]/10 dark:bg-[#2b6777]/20 text-[#2b6777] dark:text-[#8ec9bd] text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>কথাসাহিত্য</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#173b46] dark:text-[#F4F8F9]">
          গল্প সম্ভার
        </h1>
        <p className="font-serif text-sm sm:text-base text-[#527785] dark:text-[#AFC4CA] leading-relaxed">
          প্রতিটি ছোটগল্প জীবনের এক একটি খণ্ডচিত্র। সমাজ, মানুষ, মনস্তত্ত্ব ও সম্পর্কের টানাপোড়েন নিয়ে রচিত অনন্য গল্পসমূহ।
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="sf-glass sf-premium-card rounded-2xl p-4 sm:p-5 shadow-[0_10px_40px_rgba(43,103,119,0.06)]">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#527785] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="গল্প খুঁজুন..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-[#DCE7EA] dark:border-[#303D41] bg-white/80 dark:bg-[#171D1F]/80 text-[#173b46] dark:text-[#EEF5F7] placeholder-[#7F969D] focus:outline-hidden focus:border-[#2b6777] focus:ring-4 focus:ring-[#2b6777]/10 transition-all duration-300"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
            <span className="text-[#527785] flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" /> সাজান:
            </span>
            <button
              type="button"
              onClick={() => {
                setSortBy('latest');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all duration-300 ease-out hover:-translate-y-0.5 ${
                sortBy === 'latest'
                  ? 'bg-[#2b6777] text-white shadow-[0_6px_18px_rgba(43,103,119,0.22)]'
                  : 'bg-[#eaf1f3] dark:bg-[#202A2D] text-[#496770] dark:text-[#B7C8CD] hover:bg-[#dce9ed]'
              }`}
            >
              নতুন
            </button>
            <button
              type="button"
              onClick={() => {
                setSortBy('popular');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all duration-300 ease-out hover:-translate-y-0.5 ${
                sortBy === 'popular'
                  ? 'bg-[#2b6777] text-white shadow-[0_6px_18px_rgba(43,103,119,0.22)]'
                  : 'bg-[#eaf1f3] dark:bg-[#202A2D] text-[#496770] dark:text-[#B7C8CD] hover:bg-[#dce9ed]'
              }`}
            >
              জনপ্রিয়
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Stories */}
      {paginatedStories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedStories.map((story, index) => (
            <div
              key={story.id}
              className="sf-premium-card"
              style={{
                animation: `sf-card-enter 650ms cubic-bezier(0.22, 1, 0.36, 1) ${index * 70}ms both`,
              }}
            >
              <StoryCard
                story={story}
                onOpen={(id) => {
                  onNavigate({ type: 'story-detail', id });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 sf-glass rounded-2xl border border-[#DCE7EA] dark:border-[#303D41] shadow-[0_10px_40px_rgba(43,103,119,0.05)]">
          <BookOpen className="w-10 h-10 text-[#2b6777] opacity-40 mx-auto mb-3" />
          <h3 className="font-serif text-xl font-bold text-[#173b46] dark:text-[#EEF5F7]">
            কোনো গল্প খুঁজে পাওয়া যায়নি
          </h3>
          <p className="text-sm text-[#527785] dark:text-[#AFC4CA] mt-1">
            অনুগ্রহ করে অন্য কোনো শব্দ দিয়ে অনুসন্ধান করুন।
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-8">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => {
              setCurrentPage((p) => Math.max(1, p - 1));
              window.scrollTo({ top: 200, behavior: 'smooth' });
            }}
            className="px-4 py-2 rounded-xl text-xs font-medium border border-[#DCE7EA] dark:border-[#303D41] disabled:opacity-40 hover:bg-[#eaf1f3] dark:hover:bg-[#202A2D] hover:-translate-y-0.5 transition-all duration-300"
          >
            পূর্ববর্তী
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => {
                setCurrentPage(page);
                window.scrollTo({ top: 200, behavior: 'smooth' });
              }}
              className={`w-9 h-9 rounded-xl text-xs font-medium transition-all duration-300 ease-out hover:-translate-y-0.5 ${
                currentPage === page
                  ? 'bg-[#2b6777] text-white shadow-[0_6px_18px_rgba(43,103,119,0.22)] scale-105'
                  : 'border border-[#DCE7EA] dark:border-[#303D41] hover:bg-[#eaf1f3] dark:hover:bg-[#202A2D] hover:-translate-y-0.5'
              }`}
            >
              {toBengaliNumber(page)}
            </button>
          ))}
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => {
              setCurrentPage((p) => Math.min(totalPages, p + 1));
              window.scrollTo({ top: 200, behavior: 'smooth' });
            }}
            className="px-4 py-2 rounded-xl text-xs font-medium border border-[#DCE7EA] dark:border-[#303D41] disabled:opacity-40 hover:bg-[#eaf1f3] dark:hover:bg-[#202A2D] hover:-translate-y-0.5 transition-all duration-300"
          >
            পরবর্তী
          </button>
        </div>
      )}
    </div>
  );
}
