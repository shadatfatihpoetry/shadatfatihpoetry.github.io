import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { PoemCard } from '../components/PoemCard';
import { ActivePage } from '../types';
import { SEOHead } from '../components/SEOHead';
import { Feather, Search, ArrowUpDown } from 'lucide-react';
import { toBengaliNumber } from '../utils/bengaliUtils';

interface PoemsPageProps {
  onNavigate: (page: ActivePage) => void;
}

export function PoemsPage({ onNavigate }: PoemsPageProps) {
  const { poems } = useData();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filter only published
  const publishedPoems = useMemo(() => poems.filter((p) => p.published), [poems]);

  // Filter and sort
  const filteredPoems = useMemo(() => {
    let list = [...publishedPoems];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.excerpt && p.excerpt.toLowerCase().includes(q)) ||
          p.content.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'latest') {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === 'popular') {
      list.sort((a, b) => (b.views || 0) - (a.views || 0));
    }

    return list;
  }, [publishedPoems, search, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredPoems.length / itemsPerPage) || 1;
  const paginatedPoems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPoems.slice(start, start + itemsPerPage);
  }, [filteredPoems, currentPage, itemsPerPage]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 min-h-screen">
      <SEOHead
        title="কবিতা সম্ভার"
        description="শাহাদাৎ ফাতিহ-এর সকল প্রকাশিত বাংলা কবিতা। প্রেম, বিরহ, প্রকৃতি ও জীবনের নিবিড় অনুভূতির পংক্তিমালা।"
        canonicalPath="/poems"
      />

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8C271E]/10 dark:bg-[#8C271E]/20 text-[#8C271E] dark:text-[#FFB4AB] text-xs font-semibold">
          <Feather className="w-3.5 h-3.5" />
          <span>কাব্য কানন</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#1F1C1A] dark:text-[#FAF7F2]">
          কবিতা সম্ভার
        </h1>
        <p className="font-serif text-sm sm:text-base text-[#6E645B] dark:text-[#ABA298] leading-relaxed">
          প্রতিটি কবিতা হৃদয়ের স্পন্দনকে ভাষায় রূপ দেওয়ার এক নিবিষ্ট প্রয়াস। খুঁজে নিন আপনার অনুভূতির সাথে মিশে যাওয়া প্রিয় পংক্তিমালা।
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#181615] border border-[#EBE5DE] dark:border-[#2C2724] rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#8A8178] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="কবিতা খুঁজুন..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-[#E5DFD7] dark:border-[#332D29] bg-[#FAF8F5] dark:bg-[#1E1A18] text-[#1F1C1A] dark:text-[#EFECE8] placeholder-[#9E958C] focus:outline-hidden focus:border-[#8C271E]"
            />
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
            <span className="text-[#8A8178] flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" /> সাজান:
            </span>
            <button
              type="button"
              onClick={() => {
                setSortBy('latest');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                sortBy === 'latest'
                  ? 'bg-[#8C271E] text-white'
                  : 'bg-[#F2ECE4] dark:bg-[#25201E] text-[#544D46] dark:text-[#BFB6AB]'
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
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                sortBy === 'popular'
                  ? 'bg-[#8C271E] text-white'
                  : 'bg-[#F2ECE4] dark:bg-[#25201E] text-[#544D46] dark:text-[#BFB6AB]'
              }`}
            >
              জনপ্রিয়
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Poems */}
      {paginatedPoems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedPoems.map((poem) => (
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
      ) : (
        <div className="text-center py-20 bg-white dark:bg-[#181615] rounded-2xl border border-[#EBE5DE] dark:border-[#262220]">
          <Feather className="w-10 h-10 text-[#8C271E] opacity-40 mx-auto mb-3" />
          <h3 className="font-serif text-xl font-bold text-[#1F1C1A] dark:text-[#EFECE8]">
            কোনো কবিতা খুঁজে পাওয়া যায়নি
          </h3>
          <p className="text-sm text-[#736B63] dark:text-[#A8A096] mt-1">
            অনুগ্রহ করে অন্য কোনো শব্দ দিয়ে চেষ্টা করুন।
          </p>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-8">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => {
              setCurrentPage((p) => Math.max(1, p - 1));
              window.scrollTo({ top: 200, behavior: 'smooth' });
            }}
            className="px-4 py-2 rounded-xl text-xs font-medium border border-[#E5DFD7] dark:border-[#332D29] disabled:opacity-40 hover:bg-[#F2ECE4] dark:hover:bg-[#221E1C]"
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
              className={`w-9 h-9 rounded-xl text-xs font-medium transition-colors ${
                currentPage === page
                  ? 'bg-[#8C271E] text-white'
                  : 'border border-[#E5DFD7] dark:border-[#332D29] hover:bg-[#F2ECE4] dark:hover:bg-[#221E1C]'
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
            className="px-4 py-2 rounded-xl text-xs font-medium border border-[#E5DFD7] dark:border-[#332D29] disabled:opacity-40 hover:bg-[#F2ECE4] dark:hover:bg-[#221E1C]"
          >
            পরবর্তী
          </button>
        </div>
      )}
    </div>
  );
}
