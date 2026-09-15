import { Feather, BookOpen, Heart, Award, ArrowRight } from 'lucide-react';
import { ActivePage } from '../types';
import { SEOHead } from '../components/SEOHead';

interface AuthorPageProps {
  onNavigate: (page: ActivePage) => void;
}

export function AuthorPage({ onNavigate }: AuthorPageProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 min-h-screen">
      <SEOHead
        title="লেখক পরিচিতি — শাহাদাৎ ফাতিহ"
        description="শাহাদাৎ ফাতিহ-এর সংক্ষিপ্ত জীবনী, সাহিত্যিক দর্শন ও গ্রন্থপঞ্জি।"
        canonicalPath="/author"
      />

      <header className="text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8C271E]/10 dark:bg-[#8C271E]/20 text-[#8C271E] dark:text-[#FFB4AB] text-xs font-semibold">
          <Feather className="w-3.5 h-3.5" />
          <span>কবি ও কথাশিল্পী</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#1F1C1A] dark:text-[#FAF7F2]">
          শাহাদাৎ ফাতিহ
        </h1>
        <p className="font-serif text-lg text-[#8C271E] dark:text-[#FFB4AB]">
          "শব্দই আমার প্রার্থনা, অনুভূতির নিবিড় প্রকাশই আমার মুক্তি।"
        </p>
      </header>

      {/* Profile Card */}
      <section className="bg-white dark:bg-[#181615] border border-[#EBE5DE] dark:border-[#2C2724] rounded-3xl p-6 sm:p-10 shadow-xs space-y-8">
        <div className="space-y-4 text-[#423B35] dark:text-[#CEC7BD] font-serif text-base sm:text-lg leading-relaxed">
          <p>
            শাহাদাৎ ফাতিহ সমকালীন বাংলা সাহিত্যের এক বিশিষ্ট ও সংবেদনশীল নাম। নদীমাতৃক বাংলার নিসর্গ, মাটির সুবাস, আর নিঃসঙ্গ নাগরিক জীবনের অন্তর্বেদনা—উভয়কেই তিনি আপন শিল্পকর্মে এক অপূর্ব মেলবন্ধনে রূপ দিয়েছেন।
          </p>
          <p>
            তাঁর কবিতায় শব্দরা শুধু ছন্দ মেনে হাঁটে না, প্রতিটি পংক্তি যেন পাঠককে টেনে নিয়ে যায় এক অনন্ত ভাবনার অলিন্দে। অন্যদিকে তাঁর ছোটগল্প ও উপন্যাস মানুষের সম্পর্কের সূক্ষ্ম স্তরগুলো উন্মোচন করে। তিনি বিশ্বাস করেন, সাহিত্যের মূল দায়বদ্ধতা মানুষের অন্তর্নিহিত সত্যের প্রতি।
          </p>
        </div>

        {/* Philosophy pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-[#F2ECE4] dark:border-[#272321]">
          <div className="p-5 rounded-2xl bg-[#FAF7F2] dark:bg-[#201C1A] border border-[#EDE7DE] dark:border-[#2E2824] space-y-2">
            <div className="w-9 h-9 rounded-xl bg-[#8C271E]/10 text-[#8C271E] dark:text-[#FFB4AB] flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-[#1F1C1A] dark:text-[#FAF7F2]">
              মানবিক সংবেদনশীলতা
            </h3>
            <p className="text-xs text-[#736B63] dark:text-[#A8A096] leading-relaxed">
              যেকোনো সাহিত্যকর্মের কেন্দ্রে থাকে রক্তমাংসের মানুষের বেদনা ও মুক্তির আকুল অনুসন্ধান।
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#FAF7F2] dark:bg-[#201C1A] border border-[#EDE7DE] dark:border-[#2E2824] space-y-2">
            <div className="w-9 h-9 rounded-xl bg-[#8C271E]/10 text-[#8C271E] dark:text-[#FFB4AB] flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-[#1F1C1A] dark:text-[#FAF7F2]">
              ভাষার শুদ্ধ নান্দনিকতা
            </h3>
            <p className="text-xs text-[#736B63] dark:text-[#A8A096] leading-relaxed">
              বাংলা ভাষার সমৃদ্ধ ঐতিহ্য রক্ষা করে সহজ অথচ ব্যঞ্জনাপূর্ণ বাকরীতির নিরীক্ষা।
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#FAF7F2] dark:bg-[#201C1A] border border-[#EDE7DE] dark:border-[#2E2824] space-y-2">
            <div className="w-9 h-9 rounded-xl bg-[#8C271E]/10 text-[#8C271E] dark:text-[#FFB4AB] flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-[#1F1C1A] dark:text-[#FAF7F2]">
              স্থায়িত্ব ও গভীরতা
            </h3>
            <p className="text-xs text-[#736B63] dark:text-[#A8A096] leading-relaxed">
              সাময়িক চটকদারির চেয়ে সময়ের পরীক্ষায় উত্তীর্ণ হওয়ার মতো নিরবচ্ছিন্ন সাহিত্য সাধনা।
            </p>
          </div>
        </div>

        {/* Read Author Works CTA */}
        <div className="pt-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h4 className="font-serif font-bold text-lg text-[#1F1C1A] dark:text-[#FAF7F2]">
              শাহাদাৎ ফাতিহ-এর সাহিত্যকর্ম পাঠ করুন
            </h4>
            <p className="text-xs text-[#7A7167] dark:text-[#A8A096]">
              নির্বাচিত কবিতা, ছোটগল্প ও উপন্যাসের সংগ্রহ
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => onNavigate({ type: 'poems' })}
              className="px-5 py-2.5 rounded-xl bg-[#8C271E] text-white text-xs font-medium hover:bg-[#A32E24] transition-colors"
            >
              কবিতাসমূহ
            </button>
            <button
              type="button"
              onClick={() => onNavigate({ type: 'novels' })}
              className="px-5 py-2.5 rounded-xl border border-[#D8CFC3] dark:border-[#38312C] text-xs font-medium hover:bg-[#F4ECE2] dark:hover:bg-[#25201E] transition-colors"
            >
              উপন্যাসসমূহ
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
