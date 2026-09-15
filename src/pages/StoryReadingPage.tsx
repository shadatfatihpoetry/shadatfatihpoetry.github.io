import { useEffect, useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { ReadingToolbar } from '../components/ReadingToolbar';
import { StoryCard } from '../components/StoryCard';
import { SEOHead } from '../components/SEOHead';
import { ActivePage, ReadingSettings } from '../types';
import { Eye, Calendar, User, ArrowLeft, BookOpen, Clock } from 'lucide-react';
import { toBengaliNumber, formatBengaliDate, getReadingTime } from '../utils/bengaliUtils';

interface StoryReadingPageProps {
  id: string;
  onNavigate: (page: ActivePage) => void;
}

export function StoryReadingPage({ id, onNavigate }: StoryReadingPageProps) {
  const { stories, incrementStoryViews } = useData();

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

  const story = useMemo(() => stories.find((s) => s.id === id), [stories, id]);
  const { isAdmin } = useAuth();
  const isAccessible = Boolean(story && (story.published || isAdmin));

  // Safely increment view count once per unique story open (only if published)
  useEffect(() => {
    if (id && isAccessible && story?.published) {
      incrementStoryViews(id);
    }
  }, [id, isAccessible, story?.published, incrementStoryViews]);

  const handleUpdateSettings = (updates: Partial<ReadingSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem('shadat_reading_settings', JSON.stringify(next));
      return next;
    });
  };

  const publishedStories = useMemo(() => stories.filter((s) => s.published), [stories]);

  const relatedStories = useMemo(() => {
    if (!story) return [];
    return publishedStories
      .filter((s) => s.id !== story.id)
      .slice(0, 3);
  }, [story, publishedStories]);

  if (!story || !isAccessible) {
    return (
      <div className="max-w-2xl mx-auto py-24 px-4 text-center space-y-4 sf-glass rounded-3xl">
        <h2 className="font-serif text-2xl font-bold text-[#173b46] dark:text-[#EEF5F7]">
          পৃষ্ঠা খুঁজে পাওয়া যায়নি
        </h2>
        <p className="text-sm text-[#527785] dark:text-[#AFC4CA]">
          কাঙ্ক্ষিত গল্পটি সরিয়ে নেওয়া হয়েছে বা উপলব্ধ নেই।
        </p>
        <button
          type="button"
          onClick={() => onNavigate({ type: 'stories' })}
          className="px-5 py-2.5 rounded-xl bg-[#2b6777] text-white text-sm font-medium sf-premium-button"
        >
          সকল গল্প দেখুন
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
    <div className="min-h-screen w-full min-w-0 max-w-full overflow-x-hidden pb-20 sf-glow">
      <SEOHead
        title={story.title}
        description={story.excerpt || `${story.title} — ছোটগল্প`}
        ogImage={story.cover_url || undefined}
        canonicalPath={`/story/${story.id}`}
      />

      <ReadingToolbar
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        rawTextToCopy={story.content}
        title={story.title}
      />

      <main className={`mx-auto w-full min-w-0 px-4 sm:px-6 transition-all duration-500 ${widthClasses}`}>
        <div className="mb-6">
          <button
            type="button"
            onClick={() => onNavigate({ type: 'stories' })}
            className="inline-flex items-center gap-1.5 text-xs text-[#527785] dark:text-[#AFC4CA] hover:text-[#2b6777] dark:hover:text-[#52ab98] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>সকল গল্পে ফিরে যান</span>
          </button>
        </div>

        <header className="text-center space-y-4 mb-10">
          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-[#2b6777]/10 dark:bg-[#2b6777]/20 text-[#2b6777] dark:text-[#8ec9bd]">
            ছোটগল্প
          </span>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#173b46] dark:text-[#EEF5F7] leading-tight">
            {story.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[#527785] dark:text-[#AFC4CA] pt-1">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-[#2b6777]" />
              <span className="font-medium text-[#365966] dark:text-[#D5E3E7]">শাহাদাৎ ফাতিহ</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatBengaliDate(story.created_at)}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{getReadingTime(story.content)}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              <span>{toBengaliNumber(story.views || 0)} পাঠ</span>
            </span>
          </div>

          <div className="w-20 h-0.5 bg-[#2b6777]/30 dark:bg-[#52ab98]/50 mx-auto mt-6" />
        </header>

        {story.cover_url && (
          <div className="mb-10 rounded-3xl overflow-hidden shadow-[0_18px_50px_rgba(43,103,119,0.12)] max-h-96 border border-[#DCE7EA] dark:border-[#303D41] sf-premium-card">
            <img
              src={story.cover_url}
              alt={story.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Story Content */}
        <article className="sf-glass sf-premium-card border border-[#DCE7EA]/80 dark:border-[#303D41]/80 rounded-3xl p-6 sm:p-12 shadow-[0_20px_60px_rgba(43,103,119,0.07)]">
          <div
            className={`story-content text-[#23434D] dark:text-[#E4F0F3] space-y-6 ${fontSizeClasses}`}
            style={{ fontFamily: "'Noto Serif Bengali', serif" }}
          >
            {story.content}
          </div>

          <div className="mt-12 pt-6 border-t border-[#DCE7EA] dark:border-[#303D41] text-right">
            <span className="font-serif italic text-sm text-[#527785] dark:text-[#AFC4CA]">
              — শাহাদাৎ ফাতিহ
            </span>
          </div>
        </article>

        {/* Related Stories */}
        {relatedStories.length > 0 && (
          <section className="mt-16 pt-10 border-t border-[#DCE7EA] dark:border-[#303D41]">
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="w-4 h-4 text-[#2b6777]" />
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#173b46] dark:text-[#EEF5F7]">
                আরও গল্প পড়ুন
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {relatedStories.map((rel) => (
                <StoryCard
                  key={rel.id}
                  story={rel}
                  onOpen={(relId) => {
                    onNavigate({ type: 'story-detail', id: relId });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
