import { Feather, BookOpen, ShieldCheck, Heart } from 'lucide-react';
import { ActivePage } from '../types';
import { SEOHead } from '../components/SEOHead';

interface AboutPageProps {
  onNavigate: (page: ActivePage) => void;
}

export function AboutPage({ onNavigate }: AboutPageProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 min-h-screen">
      <SEOHead
        title="আমাদের সম্পর্কে — Shadat Fatih Poetry"
        description="Shadat Fatih Poetry — শাহাদাৎ ফাতিহ-এর লক্ষ্য, উদ্দেশ্য ও ডিজিটাল বাংলা সাহিত্যের প্রকাশনা দর্শন।"
        canonicalPath="/about"
      />

      <header className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8C271E]/10 dark:bg-[#8C271E]/20 text-[#8C271E] dark:text-[#FFB4AB] text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>আমাদের কথা</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#1F1C1A] dark:text-[#FAF7F2]">
          Shadat Fatih Poetry
        </h1>
        <p className="font-serif text-2xl sm:text-3xl text-[#8C271E] dark:text-[#FFB4AB] font-bold">
          শাহাদাৎ ফাতিহ
        </p>
        <p className="font-serif text-base text-[#7A7167] dark:text-[#A8A096]">
          বাংলা সাহিত্যের এক মার্জিত ডিজিটাল প্রকাশনা
        </p>
      </header>

      <section className="bg-white dark:bg-[#181615] border border-[#EBE5DE] dark:border-[#2C2724] rounded-3xl p-6 sm:p-10 shadow-xs space-y-6 text-[#423B35] dark:text-[#CEC7BD] font-serif text-base sm:text-lg leading-relaxed">
        <h2 className="text-2xl font-bold text-[#1F1C1A] dark:text-[#FAF7F2]">
          আমাদের স্বপ্ন ও দর্শন
        </h2>
        <p>
          ডিজিটাল যুগে চোখের ক্লান্তিহীন, আরামদায়ক এবং সাহিত্যিক নান্দনিকতায় ভরপুর একটি পড়ার পরিবেশ গড়ে তোলার তাগিদ থেকেই <strong>"Shadat Fatih Poetry" (শাহাদাৎ ফাতিহ)</strong> প্ল্যাটফর্মের যাত্রা শুরু।
        </p>
        <p>
          আমরা বিশ্বাস করি, সাহিত্য কেবল তথ্য নয়; এটি একটি ধ্যান। তাই প্রচলিত সামাজিক মাধ্যমের বিভ্রান্তিকর স্ক্রলিংয়ের বিপরীতে আমরা তৈরি করেছি এক শান্ত ও নিরিবিলি পড়ার অভিজ্ঞতা। এখানে কবিতার প্রতিটি চরণ তার নিজস্ব ছন্দে শ্বাস নেয়, গল্পের পরিচ্ছেদগুলো মুদ্রিত বইয়ের মতোই চোখের কাছে আরামদায়ক।
        </p>

        <div className="pt-6 border-t border-[#F2ECE4] dark:border-[#272321] space-y-4">
          <h3 className="text-xl font-bold text-[#1F1C1A] dark:text-[#FAF7F2]">
            আমাদের অঙ্গীকার
          </h3>
          <ul className="space-y-3 text-sm sm:text-base">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#8C271E]/10 text-[#8C271E] flex items-center justify-center shrink-0 mt-0.5">
                ✓
              </span>
              <span>
                <strong>শুদ্ধ বিন্যাস:</strong> বাংলা কবিতার স্তবক ও চরণের নিজস্ব বিন্যাস অবিকল সংরক্ষণ করা।
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#8C271E]/10 text-[#8C271E] flex items-center justify-center shrink-0 mt-0.5">
                ✓
              </span>
              <span>
                <strong>পাঠকবান্ধব নিয়ন্ত্রণ:</strong> ফন্ট সাইজ, ডার্ক মোড এবং আরামদায়ক মার্জিন নিয়ন্ত্রণের স্বাধীনতা।
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#8C271E]/10 text-[#8C271E] flex items-center justify-center shrink-0 mt-0.5">
                ✓
              </span>
              <span>
                <strong>বিজ্ঞাপনমুক্ত শুচিতা:</strong> সাহিত্য পড়ার সময়ে মনোযোগ ব্যাহতকারী কোনো বিজ্ঞাপনী কোলাহল নয়।
              </span>
            </li>
          </ul>
        </div>

        <div className="pt-8 border-t border-[#F2ECE4] dark:border-[#272321] flex justify-between items-center text-xs text-[#8A8178]">
          <span>Shadat Fatih Literary Initiative</span>
          <button
            type="button"
            onClick={() => onNavigate({ type: 'poems' })}
            className="text-[#8C271E] dark:text-[#FFB4AB] font-semibold hover:underline"
          >
            সাহিত্য পড়তে শুরু করুন →
          </button>
        </div>
      </section>
    </div>
  );
}
