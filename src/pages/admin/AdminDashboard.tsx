import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { ActivePage, Poem, Story, Novel, Chapter } from '../../types';
import { SEOHead } from '../../components/SEOHead';
import { AdminPoemModal } from './AdminPoemModal';
import { AdminStoryModal } from './AdminStoryModal';
import { AdminNovelModal } from './AdminNovelModal';
import { AdminChapterModal } from './AdminChapterModal';
import { toBengaliNumber, formatBengaliDate } from '../../utils/bengaliUtils';
import {
  Feather,
  BookOpen,
  BookMarked,
  Eye,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  LogOut,
  ArrowLeft,
  Layers,
  Search,
  ExternalLink,
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (page: ActivePage) => void;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const { user, logout, isLiveGoogleSheets } = useAuth();
  const {
    poems,
    stories,
    novels,
    chapters,
    deletePoem,
    deleteStory,
    deleteNovel,
    deleteChapter,
    updatePoem,
    updateStory,
    updateNovel,
    updateChapter,
    getChaptersForNovel,
    refreshData,
  } = useData();

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Active Admin Section
  const [activeTab, setActiveTab] = useState<'poems' | 'stories' | 'novels'>('poems');
  const [search, setSearch] = useState('');

  // Selected Novel for managing chapters
  const [managingNovel, setManagingNovel] = useState<Novel | null>(null);

  // Modals state
  const [isPoemModalOpen, setIsPoemModalOpen] = useState(false);
  const [editingPoem, setEditingPoem] = useState<Poem | null>(null);

  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);

  const [isNovelModalOpen, setIsNovelModalOpen] = useState(false);
  const [editingNovel, setEditingNovel] = useState<Novel | null>(null);

  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);

  // Statistics calculation
  const stats = useMemo(() => {
    const totalViews =
      poems.reduce((sum, p) => sum + (p.views || 0), 0) +
      stories.reduce((sum, s) => sum + (s.views || 0), 0) +
      novels.reduce((sum, n) => sum + (n.views || 0), 0);

    const publishedCount =
      poems.filter((p) => p.published).length +
      stories.filter((s) => s.published).length +
      novels.filter((n) => n.published).length +
      chapters.filter((c) => c.published).length;

    const draftCount =
      poems.filter((p) => !p.published).length +
      stories.filter((s) => !s.published).length +
      novels.filter((n) => !n.published).length +
      chapters.filter((c) => !c.published).length;

    return {
      poems: poems.length,
      stories: stories.length,
      novels: novels.length,
      chapters: chapters.length,
      totalViews,
      publishedCount,
      draftCount,
    };
  }, [poems, stories, novels, chapters]);

  // Filtered collections
  const filteredPoems = useMemo(() => {
    if (!search.trim()) return poems;
    const q = search.toLowerCase();
    return poems.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.excerpt && p.excerpt.toLowerCase().includes(q))
    );
  }, [poems, search]);

  const filteredStories = useMemo(() => {
    if (!search.trim()) return stories;
    const q = search.toLowerCase();
    return stories.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        (s.excerpt && s.excerpt.toLowerCase().includes(q))
    );
  }, [stories, search]);

  const filteredNovels = useMemo(() => {
    if (!search.trim()) return novels;
    const q = search.toLowerCase();
    return novels.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        (n.excerpt && n.excerpt.toLowerCase().includes(q))
    );
  }, [novels, search]);

  const chaptersForSelectedNovel = useMemo(() => {
    if (!managingNovel) return [];
    return getChaptersForNovel(managingNovel.id);
  }, [managingNovel, getChaptersForNovel]);

  // Handlers for deletions with simple confirmation
  const handleDeletePoem = async (id: string, title: string) => {
    if (window.confirm(`আপনি কি নিশ্চিত যে "${title}" কবিতাটি মুছে ফেলতে চান?`)) {
      await deletePoem(id);
    }
  };

  const handleDeleteStory = async (id: string, title: string) => {
    if (window.confirm(`আপনি কি নিশ্চিত যে "${title}" গল্পটি মুছে ফেলতে চান?`)) {
      await deleteStory(id);
    }
  };

  const handleDeleteNovel = async (id: string, title: string) => {
    if (window.confirm(`আপনি কি নিশ্চিত যে "${title}" উপন্যাসটি এবং এর সকল অধ্যায় মুছে ফেলতে চান?`)) {
      await deleteNovel(id);
      if (managingNovel?.id === id) {
        setManagingNovel(null);
      }
    }
  };

  const handleDeleteChapter = async (id: string, title: string) => {
    if (window.confirm(`আপনি কি নিশ্চিত যে "${title}" অধ্যায়টি মুছে ফেলতে চান?`)) {
      await deleteChapter(id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-screen">
      <SEOHead title="অ্যাডমিন ড্যাশবোর্ড" description="Shadat Fatih Poetry প্রকাশনা ও কনটেন্ট পরিচালনা।" />

      {/* Top Header */}
      <div className="bg-white dark:bg-[#181615] border border-[#EBE5DE] dark:border-[#2C2724] rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1C1A] dark:text-[#FAF7F2]">
              Shadat Fatih Poetry — প্রশাসন
            </h1>
          </div>
          <p className="text-xs text-[#7A7167] dark:text-[#A8A096] mt-1">
            শাহাদাৎ ফাতিহ সাহিত্য সম্ভার • {user?.email} • {isLiveGoogleSheets ? 'Google Sheets সক্রিয়' : 'লোকাল মোড'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">

          <button
            type="button"
            onClick={() => onNavigate({ type: 'home' })}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium border border-[#DED7CD] dark:border-[#38312C] bg-[#FAF8F5] dark:bg-[#201C1A] hover:bg-[#EFE9DF] text-[#423B35] dark:text-[#CEC7BD] transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>সাইট ভিউ</span>
          </button>

          <button
            type="button"
            onClick={() => logout()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 hover:bg-red-100 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>লগআউট</span>
          </button>
        </div>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#181615] border border-[#EBE5DE] dark:border-[#2C2724] space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#8A8178]">
            <span>মোট কবিতা</span>
            <Feather className="w-4 h-4 text-[#8C271E]" />
          </div>
          <div className="font-serif text-2xl font-bold text-[#1F1C1A] dark:text-[#FAF7F2]">
            {toBengaliNumber(stats.poems)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#181615] border border-[#EBE5DE] dark:border-[#2C2724] space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#8A8178]">
            <span>মোট গল্প</span>
            <BookOpen className="w-4 h-4 text-[#8C271E]" />
          </div>
          <div className="font-serif text-2xl font-bold text-[#1F1C1A] dark:text-[#FAF7F2]">
            {toBengaliNumber(stats.stories)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#181615] border border-[#EBE5DE] dark:border-[#2C2724] space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#8A8178]">
            <span>উপন্যাস</span>
            <BookMarked className="w-4 h-4 text-[#8C271E]" />
          </div>
          <div className="font-serif text-2xl font-bold text-[#1F1C1A] dark:text-[#FAF7F2]">
            {toBengaliNumber(stats.novels)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#181615] border border-[#EBE5DE] dark:border-[#2C2724] space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#8A8178]">
            <span>মোট অধ্যায়</span>
            <Layers className="w-4 h-4 text-[#8C271E]" />
          </div>
          <div className="font-serif text-2xl font-bold text-[#1F1C1A] dark:text-[#FAF7F2]">
            {toBengaliNumber(stats.chapters)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#181615] border border-[#EBE5DE] dark:border-[#2C2724] space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#8A8178]">
            <span>মোট পাঠসংখ্যা</span>
            <Eye className="w-4 h-4 text-blue-600" />
          </div>
          <div className="font-serif text-2xl font-bold text-[#1F1C1A] dark:text-[#FAF7F2]">
            {toBengaliNumber(stats.totalViews)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#181615] border border-[#EBE5DE] dark:border-[#2C2724] space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#8A8178]">
            <span>প্রকাশিত / খসড়া</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-serif text-base font-bold text-[#1F1C1A] dark:text-[#FAF7F2] pt-1">
            {toBengaliNumber(stats.publishedCount)} / <span className="text-amber-600">{toBengaliNumber(stats.draftCount)}</span>
          </div>
        </div>
      </div>

      {/* TABS & SEARCH CONTROLS */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pb-2 border-b border-[#EBE5DE] dark:border-[#282321]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab('poems');
              setManagingNovel(null);
            }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'poems' && !managingNovel
                ? 'bg-[#8C271E] text-white shadow-xs'
                : 'text-[#544D46] dark:text-[#BFB6AB] hover:bg-[#FAF6F0] dark:hover:bg-[#201C1A]'
            }`}
          >
            কবিতা ({toBengaliNumber(poems.length)})
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('stories');
              setManagingNovel(null);
            }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'stories' && !managingNovel
                ? 'bg-[#8C271E] text-white shadow-xs'
                : 'text-[#544D46] dark:text-[#BFB6AB] hover:bg-[#FAF6F0] dark:hover:bg-[#201C1A]'
            }`}
          >
            গল্প ({toBengaliNumber(stories.length)})
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('novels');
            }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'novels' || managingNovel
                ? 'bg-[#8C271E] text-white shadow-xs'
                : 'text-[#544D46] dark:text-[#BFB6AB] hover:bg-[#FAF6F0] dark:hover:bg-[#201C1A]'
            }`}
          >
            উপন্যাস ও অধ্যায় ({toBengaliNumber(novels.length)})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[#9A9187] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="খুঁজুন..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#DED7CD] dark:border-[#38312C] bg-[#FAF8F5] dark:bg-[#1E1A18] text-[#1F1C1A] dark:text-[#F0ECE7]"
          />
        </div>
      </div>

      {/* TAB CONTENT */}

      {/* 1. POEMS MANAGEMENT */}
      {activeTab === 'poems' && !managingNovel && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-serif text-xl font-bold text-[#1F1C1A] dark:text-[#FAF7F2]">
              কবিতা তালিকা
            </h2>
            <button
              type="button"
              onClick={() => {
                setEditingPoem(null);
                setIsPoemModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8C271E] hover:bg-[#A32E24] text-white text-xs font-medium transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন কবিতা যোগ করুন</span>
            </button>
          </div>

          <div className="bg-white dark:bg-[#181615] border border-[#EBE5DE] dark:border-[#2C2724] rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] dark:bg-[#201C1A] border-b border-[#EBE5DE] dark:border-[#2A2522] text-[#6E645B] dark:text-[#ABA298]">
                  <tr>
                    <th className="p-3.5">শিরোনাম</th>
                    <th className="p-3.5">তারিখ</th>
                    <th className="p-3.5">পাঠ</th>
                    <th className="p-3.5">অবস্থা</th>
                    <th className="p-3.5 text-right">পদক্ষেপ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2ECE4] dark:divide-[#25201E]">
                  {filteredPoems.map((p) => (
                    <tr key={p.id} className="hover:bg-[#FAF8F5] dark:hover:bg-[#1D1917] transition-colors">
                      <td className="p-3.5">
                        <div className="font-serif font-bold text-sm text-[#1F1C1A] dark:text-[#F3EFEB]">
                          {p.title}
                        </div>
                        {p.excerpt && (
                          <span className="text-[11px] text-[#8A8178] line-clamp-1">{p.excerpt}</span>
                        )}
                      </td>
                      <td className="p-3.5 text-[#8A8178]">{formatBengaliDate(p.created_at)}</td>
                      <td className="p-3.5 text-[#544D46] dark:text-[#C7C0B7]">{toBengaliNumber(p.views || 0)}</td>
                      <td className="p-3.5">
                        <button
                          type="button"
                          onClick={() =>
                            updatePoem(p.id, {
                              published: !p.published,
                            })
                          }
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-colors ${
                            p.published
                              ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300'
                              : 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300'
                          }`}
                        >
                          {p.published ? 'প্রকাশিত' : 'খসড়া'}
                        </button>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPoem(p);
                            setIsPoemModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg border border-[#DED7CD] dark:border-[#38312C] hover:bg-[#FAF4ED] text-[#544D46] dark:text-[#CEC7BD]"
                          title="সম্পাদনা"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePoem(p.id, p.title)}
                          className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/60 hover:bg-red-50 text-red-600"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. STORIES MANAGEMENT */}
      {activeTab === 'stories' && !managingNovel && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-serif text-xl font-bold text-[#1F1C1A] dark:text-[#FAF7F2]">
              ছোটগল্প তালিকা
            </h2>
            <button
              type="button"
              onClick={() => {
                setEditingStory(null);
                setIsStoryModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8C271E] hover:bg-[#A32E24] text-white text-xs font-medium transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন গল্প যোগ করুন</span>
            </button>
          </div>

          <div className="bg-white dark:bg-[#181615] border border-[#EBE5DE] dark:border-[#2C2724] rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] dark:bg-[#201C1A] border-b border-[#EBE5DE] dark:border-[#2A2522] text-[#6E645B] dark:text-[#ABA298]">
                  <tr>
                    <th className="p-3.5">শিরোনাম</th>
                    <th className="p-3.5">তারিখ</th>
                    <th className="p-3.5">পাঠ</th>
                    <th className="p-3.5">অবস্থা</th>
                    <th className="p-3.5 text-right">পদক্ষেপ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2ECE4] dark:divide-[#25201E]">
                  {filteredStories.map((s) => (
                    <tr key={s.id} className="hover:bg-[#FAF8F5] dark:hover:bg-[#1D1917] transition-colors">
                      <td className="p-3.5">
                        <div className="font-serif font-bold text-sm text-[#1F1C1A] dark:text-[#F3EFEB]">
                          {s.title}
                        </div>
                        {s.excerpt && (
                          <span className="text-[11px] text-[#8A8178] line-clamp-1">{s.excerpt}</span>
                        )}
                      </td>
                      <td className="p-3.5 text-[#8A8178]">{formatBengaliDate(s.created_at)}</td>
                      <td className="p-3.5 text-[#544D46] dark:text-[#C7C0B7]">{toBengaliNumber(s.views || 0)}</td>
                      <td className="p-3.5">
                        <button
                          type="button"
                          onClick={() =>
                            updateStory(s.id, {
                              published: !s.published,
                            })
                          }
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-colors ${
                            s.published
                              ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300'
                              : 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300'
                          }`}
                        >
                          {s.published ? 'প্রকাশিত' : 'খসড়া'}
                        </button>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingStory(s);
                            setIsStoryModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg border border-[#DED7CD] dark:border-[#38312C] hover:bg-[#FAF4ED] text-[#544D46] dark:text-[#CEC7BD]"
                          title="সম্পাদনা"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteStory(s.id, s.title)}
                          className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/60 hover:bg-red-50 text-red-600"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. NOVELS & CHAPTERS MANAGEMENT */}
      {activeTab === 'novels' && !managingNovel && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-serif text-xl font-bold text-[#1F1C1A] dark:text-[#FAF7F2]">
              উপন্যাস তালিকা
            </h2>
            <button
              type="button"
              onClick={() => {
                setEditingNovel(null);
                setIsNovelModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8C271E] hover:bg-[#A32E24] text-white text-xs font-medium transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন উপন্যাস যোগ করুন</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredNovels.map((novel) => {
              const chCount = getChaptersForNovel(novel.id).length;
              return (
                <div
                  key={novel.id}
                  className="bg-white dark:bg-[#181615] border border-[#EBE5DE] dark:border-[#2C2724] rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-serif font-bold text-lg text-[#1F1C1A] dark:text-[#FAF7F2]">
                        {novel.title}
                      </h3>
                      <button
                        type="button"
                        onClick={() =>
                          updateNovel(novel.id, {
                            published: !novel.published,
                          })
                        }
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium shrink-0 ${
                          novel.published
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {novel.published ? 'প্রকাশিত' : 'খসড়া'}
                      </button>
                    </div>

                    <p className="text-xs text-[#7A7167] dark:text-[#A8A096] line-clamp-2">
                      {novel.excerpt || novel.content || ''}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-[#8A8178] pt-1">
                      <span>মোট অধ্যায়: <strong className="text-[#8C271E]">{toBengaliNumber(chCount)}</strong></span>
                      <span>•</span>
                      <span>পাঠসংখ্যা: {toBengaliNumber(novel.views || 0)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#F2ECE4] dark:border-[#25201E]">
                    <button
                      type="button"
                      onClick={() => setManagingNovel(novel)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF4ED] dark:bg-[#25201E] border border-[#E5DFD7] dark:border-[#38312C] hover:bg-[#EAE4DC] text-xs font-semibold text-[#8C271E] dark:text-[#FFB4AB]"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>অধ্যায়সমূহ পরিচালনা ({toBengaliNumber(chCount)})</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingNovel(novel);
                          setIsNovelModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg border border-[#DED7CD] dark:border-[#38312C] hover:bg-[#FAF4ED] text-[#544D46] dark:text-[#CEC7BD]"
                        title="উপন্যাস সম্পাদনা"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteNovel(novel.id, novel.title)}
                        className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/60 hover:bg-red-50 text-red-600"
                        title="উপন্যাস মুছুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MANAGING CHAPTERS FOR A SPECIFIC NOVEL */}
      {managingNovel && (
        <div className="space-y-6 bg-white dark:bg-[#181615] border border-[#EBE5DE] dark:border-[#2C2724] rounded-3xl p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#EFECE8] dark:border-[#25211F]">
            <div>
              <button
                type="button"
                onClick={() => setManagingNovel(null)}
                className="inline-flex items-center gap-1 text-xs text-[#8C271E] dark:text-[#FFB4AB] hover:underline mb-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>সকল উপন্যাসের তালিকায় ফিরুন</span>
              </button>
              <h2 className="font-serif text-2xl font-bold text-[#1F1C1A] dark:text-[#FAF7F2]">
                {managingNovel.title} — অধ্যায়সমূহ
              </h2>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingChapter(null);
                setIsChapterModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8C271E] hover:bg-[#A32E24] text-white text-xs font-medium transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন অধ্যায় রচনা</span>
            </button>
          </div>

          {chaptersForSelectedNovel.length > 0 ? (
            <div className="space-y-3">
              {chaptersForSelectedNovel.map((ch) => (
                <div
                  key={ch.id}
                  className="p-4 rounded-xl border border-[#F0EAE1] dark:border-[#282321] hover:border-[#8C271E]/30 bg-[#FAF8F5] dark:bg-[#1E1A18] flex items-center justify-between gap-4"
                >
                  <div className="space-y-1 grow">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-[#8C271E]/10 text-[#8C271E] dark:text-[#FFB4AB] text-xs font-bold">
                        অধ্যায় {toBengaliNumber(ch.chapter_number)}
                      </span>
                      <h4 className="font-serif font-bold text-sm text-[#1F1C1A] dark:text-[#FAF7F2]">
                        {ch.title}
                      </h4>
                    </div>
                    <p className="text-xs text-[#7A7167] dark:text-[#A8A096] line-clamp-1">
                      {ch.content.slice(0, 100)}...
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        updateChapter(ch.id, {
                          published: !ch.published,
                        })
                      }
                      className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                        ch.published ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {ch.published ? 'প্রকাশিত' : 'খসড়া'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingChapter(ch);
                        setIsChapterModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg border border-[#DED7CD] dark:border-[#38312C] hover:bg-[#FAF4ED] text-[#544D46] dark:text-[#CEC7BD]"
                      title="অধ্যায় সম্পাদনা"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteChapter(ch.id, ch.title)}
                      className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/60 hover:bg-red-50 text-red-600"
                      title="অধ্যায় মুছুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-[#7A7167]">
              <p>এখনো কোনো অধ্যায় যুক্ত করা হয়নি।</p>
            </div>
          )}
        </div>
      )}

      {/* MODALS */}
      <AdminPoemModal
        isOpen={isPoemModalOpen}
        poemToEdit={editingPoem}
        onClose={() => setIsPoemModalOpen(false)}
      />

      <AdminStoryModal
        isOpen={isStoryModalOpen}
        storyToEdit={editingStory}
        onClose={() => setIsStoryModalOpen(false)}
      />

      <AdminNovelModal
        isOpen={isNovelModalOpen}
        novelToEdit={editingNovel}
        onClose={() => setIsNovelModalOpen(false)}
      />

      {managingNovel && (
        <AdminChapterModal
          isOpen={isChapterModalOpen}
          novel={managingNovel}
          chapterToEdit={editingChapter}
          suggestedChapterNumber={
            editingChapter ? editingChapter.chapter_number : chaptersForSelectedNovel.length + 1
          }
          onClose={() => setIsChapterModalOpen(false)}
        />
      )}
    </div>
  );
}
