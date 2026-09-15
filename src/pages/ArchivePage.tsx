import { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { ActivePage, Poem, Story, Novel } from '../types';
import { SEOHead } from '../components/SEOHead';
import { ChevronDown, ChevronRight, Feather } from 'lucide-react';
import { formatBengaliDate } from '../utils/bengaliUtils';

interface ArchivePageProps {
  onNavigate: (page: ActivePage) => void;
}

type ArchiveItem = Poem | Story | Novel;

interface MonthGroup {
  month: number;
  label: string;
  items: ArchiveItem[];
}

interface YearGroup {
  year: number;
  months: MonthGroup[];
}

const months = [
  'জানুয়ারি',
  'ফেব্রুয়ারি',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টেম্বর',
  'অক্টোবর',
  'নভেম্বর',
  'ডিসেম্বর',
];

function getDate(item: ArchiveItem) {
  if ('blogger_published_at' in item && item.blogger_published_at) {
    return new Date(item.blogger_published_at);
  }

  return new Date(item.created_at);
}

function groupByYearAndMonth(items: ArchiveItem[]): YearGroup[] {
  const years = new Map<number, Map<number, ArchiveItem[]>>();

  items.forEach((item) => {
    const date = getDate(item);

    if (Number.isNaN(date.getTime())) return;

    const year = date.getFullYear();
    const month = date.getMonth();

    if (!years.has(year)) {
      years.set(year, new Map());
    }

    const monthMap = years.get(year)!;

    if (!monthMap.has(month)) {
      monthMap.set(month, []);
    }

    monthMap.get(month)!.push(item);
  });

  return Array.from(years.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([year, monthMap]) => ({
      year,
      months: Array.from(monthMap.entries())
        .sort((a, b) => b[0] - a[0])
        .map(([month, monthItems]) => ({
          month,
          label: months[month],
          items: monthItems.sort(
            (a, b) => getDate(b).getTime() - getDate(a).getTime()
          ),
        })),
    }));
}

export function ArchivePage({ onNavigate }: ArchivePageProps) {
  const { poems, stories, novels } = useData();

  const [openCategory, setOpenCategory] = useState('poems');

  const publishedPoems = useMemo(
    () => poems.filter((item) => item.published),
    [poems]
  );

  const publishedStories = useMemo(
    () => stories.filter((item) => item.published),
    [stories]
  );

  const publishedNovels = useMemo(
    () => novels.filter((item) => item.published),
    [novels]
  );

  const categories = [
    {
      key: 'poems',
      title: 'কবিতা',
      items: publishedPoems,
      type: 'poem' as const,
    },
    {
      key: 'stories',
      title: 'গল্প',
      items: publishedStories,
      type: 'story' as const,
    },
    {
      key: 'novels',
      title: 'উপন্যাস',
      items: publishedNovels,
      type: 'novel' as const,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      <SEOHead
        title="লেখার আর্কাইভ"
        description="শাহাদাৎ ফাতিহ-এর কবিতা, গল্প ও উপন্যাসের পূর্ণাঙ্গ লেখার আর্কাইভ।"
        canonicalPath="/archive"
      />

      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2b6777]/10 text-[#2b6777] text-xs font-semibold">
          <Feather className="w-3.5 h-3.5" />
          <span>লেখার আর্কাইভ</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold mt-4">
          সকল লেখা
        </h1>

        <p className="font-serif text-sm sm:text-base text-[#6E645B] dark:text-[#ABA298] mt-3">
          বছর → মাস → লেখা — প্রকাশনার সময়ানুক্রমিক সংগ্রহ
        </p>
      </div>

      <div className="space-y-5">
        {categories.map((category) => (
          <section
            key={category.key}
            className="bg-white dark:bg-[#181615] border border-[#EBE5DE] dark:border-[#2C2724] rounded-2xl overflow-hidden shadow-sm"
          >
            <button
              type="button"
              onClick={() =>
                setOpenCategory(
                  openCategory === category.key ? '' : category.key
                )
              }
              className="w-full flex items-center justify-between p-5 sm:p-6 text-left hover:bg-[#F8F6F3] dark:hover:bg-[#211F1D] transition-colors"
            >
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold">
                  {category.title}
                </h2>

                <p className="text-sm text-[#7A7167] dark:text-[#ABA298] mt-1">
                  {category.items.length}টি প্রকাশিত লেখা
                </p>
              </div>

              {openCategory === category.key ? (
                <ChevronDown className="w-6 h-6 text-[#2b6777]" />
              ) : (
                <ChevronRight className="w-6 h-6 text-[#2b6777]" />
              )}
            </button>

            {openCategory === category.key && (
              <ArchiveYears
                items={category.items}
                type={category.type}
                onNavigate={onNavigate}
              />
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

interface ArchiveYearsProps {
  items: ArchiveItem[];
  type: 'poem' | 'story' | 'novel';
  onNavigate: (page: ActivePage) => void;
}

function ArchiveYears({ items, type, onNavigate }: ArchiveYearsProps) {
  const groups = useMemo(() => groupByYearAndMonth(items), [items]);

  return (
    <div className="border-t border-[#EBE5DE] dark:border-[#2C2724] px-4 sm:px-6 pb-6">
      {groups.map((yearGroup) => (
        <ArchiveYear
          key={yearGroup.year}
          yearGroup={yearGroup}
          type={type}
          onNavigate={onNavigate}
        />
      ))}

      {groups.length === 0 && (
        <p className="py-8 text-center text-sm text-[#7A7167]">
          এখনো কোনো প্রকাশিত লেখা নেই।
        </p>
      )}
    </div>
  );
}

interface ArchiveYearProps {
  yearGroup: YearGroup;
  type: 'poem' | 'story' | 'novel';
  onNavigate: (page: ActivePage) => void;
}

function ArchiveYear({ yearGroup, type, onNavigate }: ArchiveYearProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className="pt-5">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 font-serif text-xl font-bold text-[#2b6777] dark:text-[#52ab98]"
      >
        {open ? (
          <ChevronDown className="w-5 h-5" />
        ) : (
          <ChevronRight className="w-5 h-5" />
        )}

        {yearGroup.year}
      </button>

      {open && (
        <div className="mt-3 ml-3 sm:ml-7 space-y-4">
          {yearGroup.months.map((monthGroup) => (
            <ArchiveMonth
              key={monthGroup.month}
              monthGroup={monthGroup}
              type={type}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ArchiveMonthProps {
  monthGroup: MonthGroup;
  type: 'poem' | 'story' | 'novel';
  onNavigate: (page: ActivePage) => void;
}

function ArchiveMonth({ monthGroup, type, onNavigate }: ArchiveMonthProps) {
  const [open, setOpen] = useState(true);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-base sm:text-lg font-semibold text-[#403A35] dark:text-[#E7E0DA]"
      >
        {open ? (
          <ChevronDown className="w-4 h-4 text-[#2b6777]" />
        ) : (
          <ChevronRight className="w-4 h-4 text-[#2b6777]" />
        )}

        <span>{monthGroup.label}</span>

        <span className="text-xs font-normal text-[#8A8178]">
          ({monthGroup.items.length})
        </span>
      </button>

      {open && (
        <div className="mt-2 ml-6 border-l border-[#D9D1C8] dark:border-[#3A3531]">
          {monthGroup.items.map((item) => {
            const date =
              'blogger_published_at' in item && item.blogger_published_at
                ? item.blogger_published_at
                : item.created_at;

            const formattedDate = formatBengaliDate(date);

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (type === 'poem') {
                    onNavigate({ type: 'poem-detail', id: item.id });
                  } else if (type === 'story') {
                    onNavigate({ type: 'story-detail', id: item.id });
                  } else {
                    onNavigate({ type: 'novel-detail', id: item.id });
                  }
                }}
                className="w-full text-left pl-5 pr-2 py-3 hover:bg-[#F8F6F3] dark:hover:bg-[#211F1D] transition-colors"
              >
                <div className="font-serif text-base sm:text-lg font-semibold text-[#2B2724] dark:text-[#F1ECE7]">
                  {item.title}
                </div>

                <div className="text-xs sm:text-sm text-[#81776E] dark:text-[#AFA69E] mt-1">
                  {formattedDate}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
