import { Story } from '../types';
import { Eye, Calendar, Clock } from 'lucide-react';
import { toBengaliNumber, formatBengaliDate, getReadingTime } from '../utils/bengaliUtils';

interface StoryCardProps {
  story: Story;
  onOpen: (id: string) => void;
}

export function StoryCard({ story, onOpen }: StoryCardProps) {
  return (
    <article
      onClick={() => onOpen(story.id)}
      className="group cursor-pointer flex flex-col justify-between bg-white dark:bg-[#181615] border border-[#EBE5DE] dark:border-[#2C2724] rounded-2xl overflow-hidden hover:shadow-lg hover:border-[#8C271E]/30 dark:hover:border-[#C94A3D]/40 transition-all duration-300 transform hover:-translate-y-1"
    >
      <div>
        <div className="relative aspect-16/10 w-full overflow-hidden bg-[#EFECE8] dark:bg-[#201D1B]">
          {story.cover_url ? (
            <img
              src={story.cover_url}
              alt={story.title}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-[#F4EBE2] to-[#D8C7B8] dark:from-[#25201E] dark:to-[#181412] text-[#8C271E] font-serif text-2xl">
              গল্প
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex items-center gap-2 text-xs text-[#8A8178] dark:text-[#9A9187] mb-2">
            <Clock className="w-3 h-3" />
            <span>{getReadingTime(story.content)}</span>
          </div>

          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1F1C1A] dark:text-[#F3EFEB] group-hover:text-[#8C271E] dark:group-hover:text-[#E25C4F] transition-colors leading-snug">
            {story.title}
          </h3>
          <p className="text-xs text-[#736B63] dark:text-[#A8A096] mt-1 mb-3">
            লেখক: <span className="font-medium text-[#4A433D] dark:text-[#C7C0B7]">শাহাদাৎ ফাতিহ</span>
          </p>

          <p className="text-[#524B45] dark:text-[#C4BCB3] text-sm sm:text-[15px] leading-relaxed line-clamp-3">
            {story.excerpt || story.content.slice(0, 120)}
          </p>
        </div>
      </div>

      <div className="px-6 pb-6 pt-3 border-t border-[#F2ECE4] dark:border-[#262220] flex items-center justify-between text-xs text-[#8A8178] dark:text-[#9A9187]">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatBengaliDate(story.created_at)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Eye className="w-3.5 h-3.5" />
          <span>{toBengaliNumber(story.views || 0)} বার পঠিত</span>
        </div>
      </div>
    </article>
  );
}
