import { useEffect, useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { ReadingToolbar } from '../components/ReadingToolbar';
import { PoemCard } from '../components/PoemCard';
import { SEOHead } from '../components/SEOHead';
import { ActivePage, ReadingSettings } from '../types';
import { Eye, Calendar, User, ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';
import { toBengaliNumber, formatBengaliDate } from '../utils/bengaliUtils';

interface PoemReadingPageProps {
  id: string;
  onNavigate: (page: ActivePage) => void;
}

export function PoemReadingPage({ id, onNavigate }: PoemReadingPageProps) {
  const { poems, incrementPoemViews } = useData();
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

  const poem = useMemo(() => poems.find((p) => p.id === id), [poems, id]);
  const isAccessible = Boolean(poem && (poem.published || isAdmin));

  // Increment view count once per unique poem open (only if published)
  useEffect(() => {
    if (id && isAccessible && poem?.published) {
      incrementPoemViews(id);
    }
  }, [id, isAccessible, poem?.published, incrementPoemViews]);

  // Persist reading settings
  const handleUpdateSettings = (updates: Partial<ReadingSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem('shadat_reading_settings', JSON.stringify(next));
      return next;
    });
  };

  // Published poems for prev / next / related
  const publishedPoems = useMemo(() => poems.filter((p) => p.published), [poems]);

  const currentIndex = useMemo(() => {
    return publishedPoems.findIndex((p) => p.id === id);
  }, [publishedPoems, id]);

  const prevPoem = currentIndex > 0 ? publishedPoems[currentIndex - 1] : undefined;
  const nextPoem = currentIndex < publishedPoems.length - 1 ? publishedPoems[currentIndex + 1] : undefined;

  const relatedPoems = useMemo(() => {
    if (!poem) return [];
    return publishedPoems
      .filter((p) => p.id !== poem.id)
      .slice(0, 3);
  }, [poem, publishedPoems]);

  if (!poem || !isAccessible) {
    return (
      <div className="max-w-2xl mx-auto py-24 px-4 text-center space-y-4 sf-glass rounded-3xl">
        <h2 className="font-serif text-2xl font-bold text-[#173b46] dark:text-[#EEF5F7]">
          কবিতা খুঁজে পাওয়া যায়নি
        </h2>
        <p className="text-sm text-[#527785] dark:text-[#AFC4CA]">
          কাঙ্ক্ষিত কবিতাটি মুছে ফেলা হয়েছে বা এর লিংক পরিবর্তিত হয়েছে।
        </p>
        <button
          type="button"
          onClick={() => onNavigate({ type: 'poems' })}
          className="px-5 py-2.5 rounded-xl bg-[#2b6777] text-white sf-premium-button text-sm font-medium"
        >
          সকল কবিতা দেখুন
        </button>
      </div>
    );
  }

  // Reading width classes
  const widthClasses = {
    narrow: 'max-w-xl',
    medium: 'max-w-2xl',
    wide: 'max-w-3xl',
  }[settings.readingWidth];

  // Font size classes
  const fontSizeClasses = {
    small: 'text-base sm:text-lg leading-loose',
    normal: 'text-lg sm:text-xl leading-loose',
    large: 'text-xl sm:text-2xl leading-loose',
    'extra-large': 'text-2xl sm:text-3xl leading-loose',
  }[settings.fontSize];

  return (
    <div className="min-h-screen w-full min-w-0 max-w-full overflow-x-hidden pb-20">
      <SEOHead
        title={poem.title}
        description={poem.excerpt || `${poem.title} — কবিতা`}
        ogImage={poem.cover_url || undefined}
        canonicalPath={`/poem/${poem.id}`}
      />

      {/* Reading Toolbar */}
      <ReadingToolbar
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        rawTextToCopy={poem.content}
        title={poem.title}
      />

      <main className={`mx-auto w-full min-w-0 px-4 sm:px-6 transition-all duration-500 ${widthClasses}`}>
        {/* Back button */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => onNavigate({ type: 'poems' })}
            className="inline-flex items-center gap-1.5 text-xs text-[#527785] dark:text-[#AFC4CA] hover:text-[#2b6777] dark:hover:text-[#52ab98] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>সকল কবিতায় ফিরে যান</span>
          </button>
        </div>

        {/* Poem Header */}
        <header className="text-center space-y-4 mb-10">
          <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-[#2b6777]/10 dark:bg-[#2b6777]/20 text-[#2b6777] dark:text-[#8ec9bd]">
            কবিতা
          </span>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#173b46] dark:text-[#EEF5F7] leading-tight">
            {poem.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[#527785] dark:text-[#AFC4CA] pt-1">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-[#2b6777]" />
              <span className="font-medium text-[#365966] dark:text-[#D5E3E7]">শাহাদাৎ ফাতিহ</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatBengaliDate(poem.blogger_published_at || poem.created_at)}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              <span>{toBengaliNumber(poem.views || 0)} পাঠ</span>
            </span>
          </div>

          {/* Decorative Divider */}
          <div className="w-20 h-0.5 bg-[#2b6777]/30 dark:bg-[#52ab98]/50 mx-auto mt-6" />
        </header>

        {/* Cover Image if available */}
        {poem.cover_url && (
          <div className="mb-10 rounded-3xl overflow-hidden shadow-[0_18px_50px_rgba(43,103,119,0.12)] max-h-96 border border-[#DCE7EA] dark:border-[#303D41] sf-premium-card">
            <img
              src={poem.cover_url}
              alt={poem.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Poem Content - STRICT FORMATTING PRESERVATION */}
        <article className="sf-glass sf-premium-card border border-[#DCE7EA]/80 dark:border-[#303D41]/80 rounded-3xl p-6 sm:p-12 shadow-[0_20px_60px_rgba(43,103,119,0.07)]">
          <div
            className={`poem-content text-[#23434D] dark:text-[#E4F0F3] ${fontSizeClasses}`}
            style={{ fontFamily: "'Noto Serif Bengali', serif" }}
          >
            {poem.content}
          </div>

          {/* Poem Signoff */}
          <div className="mt-12 pt-6 border-t border-[#DCE7EA] dark:border-[#303D41] text-right">
            <span className="font-serif italic text-sm text-[#527785] dark:text-[#AFC4CA]">
              — শাহাদাৎ ফাতিহ
            </span>
          </div>
        </article>

        {/* Navigation: Previous and Next Poem */}
        <nav aria-label="কবিতা অনুক্রম" className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {prevPoem ? (
            <button
              type="button"
              onClick={() => {
                onNavigate({ type: 'poem-detail', id: prevPoem.id });
                window.scrollTo({ top: 0 });
              }}
              className="p-4 rounded-2xl border border-[#DCE7EA] dark:border-[#303D41] sf-glass hover:border-[#2b6777]/40 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(43,103,119,0.10)] text-left group transition-all duration-300"
            >
              <span className="text-[11px] text-[#527785] flex items-center gap-1 mb-1">
                <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                পূর্ববর্তী কবিতা
              </span>
              <span className="font-serif font-bold text-sm sm:text-base text-[#1F1C1A] dark:text-[#EDE8E3] group-hover:text-[#2b6777] dark:group-hover:text-[#FFB4AB] line-clamp-1">
                {prevPoem.title}
              </span>
            </button>
          ) : (
            <div className="hidden sm:block" />
          )}

          {nextPoem ? (
            <button
              type="button"
              onClick={() => {
                onNavigate({ type: 'poem-detail', id: nextPoem.id });
                window.scrollTo({ top: 0 });
              }}
              className="p-4 rounded-2xl border border-[#DCE7EA] dark:border-[#303D41] sf-glass hover:border-[#2b6777]/40 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(43,103,119,0.10)] text-right group transition-all duration-300 sm:col-start-2"
            >
              <span className="text-[11px] text-[#527785] flex items-center justify-end gap-1 mb-1">
                পরবর্তী কবিতা
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </span>
              <span className="font-serif font-bold text-sm sm:text-base text-[#1F1C1A] dark:text-[#EDE8E3] group-hover:text-[#2b6777] dark:group-hover:text-[#FFB4AB] line-clamp-1">
                {nextPoem.title}
              </span>
            </button>
          ) : (
            <div className="hidden sm:block" />
          )}
        </nav>

        {/* Related Poems Section */}
        {relatedPoems.length > 0 && (
          <section className="mt-16 pt-10 border-t border-[#DCE7EA] dark:border-[#303D41]">
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="w-4 h-4 text-[#2b6777]" />
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#173b46] dark:text-[#EEF5F7]">
                সম্পর্কিত অন্যান্য কবিতা
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {relatedPoems.map((rel) => (
                <PoemCard
                  key={rel.id}
                  poem={rel}
                  onOpen={(relId) => {
                    onNavigate({ type: 'poem-detail', id: relId });
                    window.scrollTo({ top: 0 });
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
