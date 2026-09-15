import { Novel } from '../types';
import { Eye, BookOpen, Layers } from 'lucide-react';
import { toBengaliNumber } from '../utils/bengaliUtils';

interface NovelCardProps {
  novel: Novel;
  chapterCount: number;
  onOpen: (id: string) => void;
}

export function NovelCard({ novel, chapterCount, onOpen }: NovelCardProps) {
  return (
    <article
      onClick={() => onOpen(novel.id)}
      className="group cursor-pointer flex flex-col md:flex-row bg-white dark:bg-[#181615] border border-[#EBE5DE] dark:border-[#2C2724] rounded-2xl overflow-hidden hover:shadow-xl hover:border-[#8C271E]/30 dark:hover:border-[#C94A3D]/40 transition-all duration-300"
    >
      <div className="relative md:w-56 h-64 md:h-auto shrink-0 overflow-hidden bg-[#EFECE8] dark:bg-[#201D1B]">
        {novel.cover_url ? (
          <img
            src={novel.cover_url}
            alt={novel.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-linear-to-b from-[#E7DACD] to-[#CFBCAB] dark:from-[#2C2522] dark:to-[#171312] text-[#8C271E] font-serif text-3xl">
            উপন্যাস
          </div>
        )}
      </div>

      <div className="p-6 md:p-8 flex flex-col justify-between grow">
        <div>
          <div className="flex items-center gap-3 text-xs text-[#8A8178] dark:text-[#9A9187] mb-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#FAF4ED] dark:bg-[#25201E] text-[#8C271E] dark:text-[#FFB4AB] font-medium border border-[#EBE0D3] dark:border-[#38312D]">
              <Layers className="w-3 h-3" />
              {toBengaliNumber(chapterCount)} টি অধ্যায়
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {toBengaliNumber(novel.views || 0)} পাঠক
            </span>
          </div>

          <h3 className="font-serif text-2xl md:text-3xl font-bold text-[#1F1C1A] dark:text-[#F3EFEB] group-hover:text-[#8C271E] dark:group-hover:text-[#E25C4F] transition-colors leading-snug">
            {novel.title}
          </h3>
          <p className="text-sm text-[#736B63] dark:text-[#A8A096] mt-1 mb-4">
            লেখক: <span className="font-medium text-[#4A433D] dark:text-[#C7C0B7]">শাহাদাৎ ফাতিহ</span>
          </p>

          <p className="text-[#524B45] dark:text-[#C4BCB3] text-sm md:text-base leading-relaxed line-clamp-3">
            {novel.excerpt || novel.content || ''}
          </p>
        </div>

        <div className="pt-6 mt-4 border-t border-[#F2ECE4] dark:border-[#262220] flex items-center justify-between">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8C271E] hover:bg-[#A32E24] text-white text-sm font-medium transition-colors shadow-sm"
          >
            <BookOpen className="w-4 h-4" />
            উপন্যাস পড়ুন
          </button>
          <span className="text-xs text-[#8A8178] dark:text-[#9A9187]">
            ধারাবাহিক পর্ব উপলব্ধ
          </span>
        </div>
      </div>
    </article>
  );
}
