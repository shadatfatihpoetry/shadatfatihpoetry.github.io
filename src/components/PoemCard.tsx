import { Poem } from '../types';
import { Eye, Calendar, BookOpen } from 'lucide-react';
import { toBengaliNumber, formatBengaliDate } from '../utils/bengaliUtils';

interface PoemCardProps {
  poem: Poem;
  onOpen: (id: string) => void;
}

export function PoemCard({ poem, onOpen }: PoemCardProps) {
  return (
    <article
      onClick={() => onOpen(poem.id)}
      className="group cursor-pointer flex flex-col justify-between bg-white dark:bg-[#181615] border border-[#EBE5DE] dark:border-[#2C2724] rounded-2xl overflow-hidden hover:shadow-lg hover:border-[#2b6777]/30 dark:hover:border-[#52ab98]/40 transition-all duration-500 ease-out transform hover:-translate-y-2 hover:shadow-[0_20px_55px_rgba(43,103,119,0.14)]"
    >
      <div>
        {poem.cover_url ? (
          <div className="relative aspect-video w-full overflow-hidden bg-[#EFECE8] dark:bg-[#201D1B]">
            <img
              src={poem.cover_url}
              alt={poem.title}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-[1.045] transition-transform duration-700 ease-out"
            />
          </div>
        ) : (
          <div className="h-20 bg-linear-to-r from-[#F4EBE2] to-[#E9DFD5] dark:from-[#25201E] dark:to-[#1C1816] p-4 flex items-center justify-between">
            <span className="text-xs px-2.5 py-0.5 rounded bg-white/80 dark:bg-black/60 text-[#2b6777] dark:text-[#8ec9bd] font-medium">
              কবিতা
            </span>
          </div>
        )}

        <div className="p-6">
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1F1C1A] dark:text-[#F3EFEB] group-hover:text-[#2b6777] dark:group-hover:text-[#52ab98] transition-colors leading-snug">
            {poem.title}
          </h3>
          <p className="text-xs text-[#736B63] dark:text-[#A8A096] mt-1 mb-3">
            লেখক: <span className="font-medium text-[#4A433D] dark:text-[#C7C0B7]">শাহাদাৎ ফাতিহ</span>
          </p>

          <p className="font-serif text-[#524B45] dark:text-[#C4BCB3] text-sm sm:text-[15px] leading-relaxed line-clamp-3 italic">
            "{poem.excerpt || poem.content.slice(0, 100)}..."
          </p>
        </div>
      </div>

      <div className="px-6 pb-6 pt-2 border-t border-[#F2ECE4] dark:border-[#262220] flex items-center justify-between text-xs text-[#8A8178] dark:text-[#9A9187]">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatBengaliDate(poem.blogger_published_at || poem.created_at)}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            <span>{toBengaliNumber(poem.views || 0)} পাঠ</span>
          </div>
          <span className="text-[#2b6777] dark:text-[#8ec9bd] font-medium flex items-center gap-1 group-hover:underline">
            <BookOpen className="w-3.5 h-3.5" />
            পড়ুন
          </span>
        </div>
      </div>
    </article>
  );
}
