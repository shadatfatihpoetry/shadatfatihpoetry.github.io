import { useState, useMemo, useEffect, useRef } from 'react';
import { useData } from '../context/DataContext';
import { Search, X, BookOpen, Feather, BookMarked, ArrowRight } from 'lucide-react';
import { toBengaliNumber } from '../utils/bengaliUtils';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (type: 'poem-detail' | 'story-detail' | 'novel-detail', id: string) => void;
}

export function SearchModal({ isOpen, onClose, onNavigate }: SearchModalProps) {
  const { poems, stories, novels } = useData();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'poems' | 'stories' | 'novels'>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setQuery('');
      setActiveTab('all');
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Keyboard escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return {
        matchedPoems: [],
        matchedStories: [],
        matchedNovels: [],
        total: 0,
      };
    }

    const matchedPoems = poems.filter(
      (p) =>
        p.published &&
        (p.title.toLowerCase().includes(q) ||
          (p.excerpt && p.excerpt.toLowerCase().includes(q)) ||
          p.content.toLowerCase().includes(q))
    );

    const matchedStories = stories.filter(
      (s) =>
        s.published &&
        (s.title.toLowerCase().includes(q) ||
          (s.excerpt && s.excerpt.toLowerCase().includes(q)) ||
          s.content.toLowerCase().includes(q))
    );

    const matchedNovels = novels.filter(
      (n) =>
        n.published &&
        (n.title.toLowerCase().includes(q) ||
          (n.excerpt && n.excerpt.toLowerCase().includes(q)) ||
          (n.content && n.content.toLowerCase().includes(q)))
    );

    return {
      matchedPoems,
      matchedStories,
      matchedNovels,
      total: matchedPoems.length + matchedStories.length + matchedNovels.length,
    };
  }, [query, poems, stories, novels]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#181615] rounded-2xl shadow-2xl border border-[#E8E1D7] dark:border-[#2C2724] overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input bar */}
        <div className="p-4 sm:p-5 border-b border-[#EFECE8] dark:border-[#25211F] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#8C271E] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="কবিতা, গল্প বা উপন্যাসের নাম ও পংক্তি খুঁজুন..."
            className="w-full bg-transparent text-base sm:text-lg text-[#1F1C1A] dark:text-[#F0ECE7] placeholder-[#9E958C] focus:outline-hidden font-serif"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded hover:bg-[#F2ECE4] dark:hover:bg-[#2A2522] text-[#8C837A]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-xs px-2.5 py-1 rounded-md bg-[#F2ECE4] dark:bg-[#2A2522] text-[#635B53] dark:text-[#BDB4AA] font-sans"
          >
            ESC
          </button>
        </div>

        {/* Categories Tab Bar */}
        {query && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#FAF7F2] dark:bg-[#1F1C1A] border-b border-[#EFECE8] dark:border-[#25211F] overflow-x-auto text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-full transition-colors whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-[#8C271E] text-white'
                  : 'text-[#635B53] dark:text-[#BDB4AA] hover:bg-[#EFE9DF] dark:hover:bg-[#2C2724]'
              }`}
            >
              সকল ফলাফল ({toBengaliNumber(results.total)})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('poems')}
              className={`px-3 py-1 rounded-full transition-colors whitespace-nowrap ${
                activeTab === 'poems'
                  ? 'bg-[#8C271E] text-white'
                  : 'text-[#635B53] dark:text-[#BDB4AA] hover:bg-[#EFE9DF] dark:hover:bg-[#2C2724]'
              }`}
            >
              কবিতা ({toBengaliNumber(results.matchedPoems.length)})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('stories')}
              className={`px-3 py-1 rounded-full transition-colors whitespace-nowrap ${
                activeTab === 'stories'
                  ? 'bg-[#8C271E] text-white'
                  : 'text-[#635B53] dark:text-[#BDB4AA] hover:bg-[#EFE9DF] dark:hover:bg-[#2C2724]'
              }`}
            >
              গল্প ({toBengaliNumber(results.matchedStories.length)})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('novels')}
              className={`px-3 py-1 rounded-full transition-colors whitespace-nowrap ${
                activeTab === 'novels'
                  ? 'bg-[#8C271E] text-white'
                  : 'text-[#635B53] dark:text-[#BDB4AA] hover:bg-[#EFE9DF] dark:hover:bg-[#2C2724]'
              }`}
            >
              উপন্যাস ({toBengaliNumber(results.matchedNovels.length)})
            </button>
          </div>
        )}

        {/* Results List */}
        <div className="overflow-y-auto p-4 space-y-4 grow">
          {!query ? (
            <div className="text-center py-12 text-[#9E958C]">
              <Feather className="w-8 h-8 mx-auto mb-3 opacity-40 text-[#8C271E]" />
              <p className="font-serif text-sm">যেকোনো শব্দ বা বাক্য লিখে সাহিত্যকর্ম খুঁজুন</p>
            </div>
          ) : results.total === 0 ? (
            <div className="text-center py-12 text-[#9E958C]">
              <p className="font-serif text-base mb-1">কোনো ফলাফল পাওয়া যায়নি</p>
              <p className="text-xs">বানান পরীক্ষা করুন বা অন্য কোনো শব্দ দিয়ে অনুসন্ধান করুন।</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Poems Group */}
              {(activeTab === 'all' || activeTab === 'poems') && results.matchedPoems.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8C271E] dark:text-[#FFB4AB] mb-2 px-1">
                    <Feather className="w-3.5 h-3.5" />
                    <span>কবিতা ({toBengaliNumber(results.matchedPoems.length)})</span>
                  </div>
                  <div className="space-y-2">
                    {results.matchedPoems.map((poem) => (
                      <div
                        key={poem.id}
                        onClick={() => {
                          onClose();
                          onNavigate('poem-detail', poem.id);
                        }}
                        className="group flex items-start justify-between p-3 rounded-xl border border-[#F0EBE4] dark:border-[#272321] hover:border-[#8C271E]/40 hover:bg-[#FAF7F2] dark:hover:bg-[#201D1B] cursor-pointer transition-all"
                      >
                        <div>
                          <h4 className="font-serif font-bold text-base text-[#1F1C1A] dark:text-[#EDE8E3] group-hover:text-[#8C271E] dark:group-hover:text-[#E25C4F]">
                            {poem.title}
                          </h4>
                          <p className="text-xs text-[#7A7167] dark:text-[#A8A096] line-clamp-1 italic mt-0.5">
                            "{poem.excerpt || poem.content.slice(0, 80)}"
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#A8A096] group-hover:text-[#8C271E] shrink-0 ml-3 mt-1" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stories Group */}
              {(activeTab === 'all' || activeTab === 'stories') && results.matchedStories.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8C271E] dark:text-[#FFB4AB] mb-2 px-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>গল্প ({toBengaliNumber(results.matchedStories.length)})</span>
                  </div>
                  <div className="space-y-2">
                    {results.matchedStories.map((story) => (
                      <div
                        key={story.id}
                        onClick={() => {
                          onClose();
                          onNavigate('story-detail', story.id);
                        }}
                        className="group flex items-start justify-between p-3 rounded-xl border border-[#F0EBE4] dark:border-[#272321] hover:border-[#8C271E]/40 hover:bg-[#FAF7F2] dark:hover:bg-[#201D1B] cursor-pointer transition-all"
                      >
                        <div>
                          <h4 className="font-serif font-bold text-base text-[#1F1C1A] dark:text-[#EDE8E3] group-hover:text-[#8C271E] dark:group-hover:text-[#E25C4F]">
                            {story.title}
                          </h4>
                          <p className="text-xs text-[#7A7167] dark:text-[#A8A096] line-clamp-1 mt-0.5">
                            {story.excerpt || story.content.slice(0, 80)}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#A8A096] group-hover:text-[#8C271E] shrink-0 ml-3 mt-1" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Novels Group */}
              {(activeTab === 'all' || activeTab === 'novels') && results.matchedNovels.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8C271E] dark:text-[#FFB4AB] mb-2 px-1">
                    <BookMarked className="w-3.5 h-3.5" />
                    <span>উপন্যাস ({toBengaliNumber(results.matchedNovels.length)})</span>
                  </div>
                  <div className="space-y-2">
                    {results.matchedNovels.map((novel) => (
                      <div
                        key={novel.id}
                        onClick={() => {
                          onClose();
                          onNavigate('novel-detail', novel.id);
                        }}
                        className="group flex items-start justify-between p-3 rounded-xl border border-[#F0EBE4] dark:border-[#272321] hover:border-[#8C271E]/40 hover:bg-[#FAF7F2] dark:hover:bg-[#201D1B] cursor-pointer transition-all"
                      >
                        <div>
                          <h4 className="font-serif font-bold text-base text-[#1F1C1A] dark:text-[#EDE8E3] group-hover:text-[#8C271E] dark:group-hover:text-[#E25C4F]">
                            {novel.title}
                          </h4>
                          <p className="text-xs text-[#7A7167] dark:text-[#A8A096] line-clamp-1 mt-0.5">
                            {novel.excerpt || novel.content?.slice(0, 80) || ''}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#A8A096] group-hover:text-[#8C271E] shrink-0 ml-3 mt-1" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
