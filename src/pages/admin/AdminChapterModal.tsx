import React, { useState, useEffect } from 'react';
import { Chapter, Novel } from '../../types';
import { useData } from '../../context/DataContext';
import { X, Check, AlertCircle } from 'lucide-react';
import { toBengaliNumber } from '../../utils/bengaliUtils';

interface AdminChapterModalProps {
  isOpen: boolean;
  novel: Novel;
  chapterToEdit: Chapter | null;
  suggestedChapterNumber: number;
  onClose: () => void;
}

export function AdminChapterModal({
  isOpen,
  novel,
  chapterToEdit,
  suggestedChapterNumber,
  onClose,
}: AdminChapterModalProps) {
  const { createChapter, updateChapter } = useData();

  const [chapterNumber, setChapterNumber] = useState<number>(suggestedChapterNumber);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [published, setPublished] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (chapterToEdit) {
      setChapterNumber(chapterToEdit.chapter_number);
      setTitle(chapterToEdit.title);
      setContent(chapterToEdit.content);
      setPublished(Boolean(chapterToEdit.published));
    } else {
      setChapterNumber(suggestedChapterNumber);
      setTitle('');
      setContent('');
      setPublished(true);
    }
    setError(null);
  }, [chapterToEdit, suggestedChapterNumber, isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('অধ্যায়ের শিরোনাম আবশ্যক');
      return;
    }
    if (!content.trim()) {
      setError('অধ্যায়ের মূল লেখা বা পাঠ্যাংশ আবশ্যক');
      return;
    }
    if (chapterNumber < 1) {
      setError('অধ্যায় নম্বর অবশ্যই ১ বা তার বেশি হতে হবে');
      return;
    }

    setSaving(true);

    try {
      if (chapterToEdit) {
        await updateChapter(chapterToEdit.id, {
          chapter_number: Number(chapterNumber),
          title: title.trim(),
          content,
          published,
        });
      } else {
        await createChapter({
          novel_id: novel.id,
          chapter_number: Number(chapterNumber),
          title: title.trim(),
          content,
          published,
        });
      }
      setSaving(false);
      onClose();
    } catch (err: any) {
      setSaving(false);
      setError(err?.message || 'অধ্যায় সংরক্ষণে সমস্যা হয়েছে');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-3xl bg-white dark:bg-[#181615] rounded-2xl border border-[#E8E1D7] dark:border-[#2C2724] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-5 border-b border-[#EFECE8] dark:border-[#25211F] flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-lg text-[#1F1C1A] dark:text-[#FAF7F2]">
              {chapterToEdit ? 'অধ্যায় সম্পাদনা' : 'নতুন অধ্যায় রচনা'}
            </h3>
            <p className="text-xs text-[#8A8178]">
              উপন্যাস: <strong className="text-[#8C271E] dark:text-[#FFB4AB]">{novel.title}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#F2ECE4] dark:hover:bg-[#2A2522] text-[#8A8178]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 grow">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#544D46] dark:text-[#C7C0B7] mb-1">
                অধ্যায় ক্রম নম্বর *
              </label>
              <input
                type="number"
                min={1}
                required
                value={chapterNumber}
                onChange={(e) => setChapterNumber(parseInt(e.target.value) || 1)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#DED7CD] dark:border-[#38312C] bg-[#FAF8F5] dark:bg-[#1F1C1A] text-[#1F1C1A] dark:text-[#F0ECE7]"
              />
              <span className="text-[11px] text-[#8A8178]">
                বাংলায়: অধ্যায় {toBengaliNumber(chapterNumber)}
              </span>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#544D46] dark:text-[#C7C0B7] mb-1">
                অধ্যায়ের শিরোনাম *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="যেমন: নদীর তীরে নিঃসঙ্গ পদধ্বনি"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#DED7CD] dark:border-[#38312C] bg-[#FAF8F5] dark:bg-[#1F1C1A] text-[#1F1C1A] dark:text-[#F0ECE7]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#544D46] dark:text-[#C7C0B7] mb-1">
              অধ্যায়ের মূল কাহিনী বা পাঠ্যাংশ *
            </label>
            <textarea
              required
              rows={14}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="অধ্যায়ের বিস্তারিত বর্ণনা..."
              className="w-full p-4 text-base font-serif rounded-xl border border-[#DED7CD] dark:border-[#38312C] bg-[#FAF8F5] dark:bg-[#1F1C1A] text-[#1F1C1A] dark:text-[#F0ECE7] focus:outline-hidden focus:border-[#8C271E] leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#201C1A] border border-[#EDE7DE] dark:border-[#2C2724]">
            <div className="flex items-center gap-4">
              <label className="text-xs font-semibold text-[#544D46] dark:text-[#C7C0B7]">
                অবস্থা:
              </label>
              <select
                value={published ? 'published' : 'draft'}
                onChange={(e) => setPublished(e.target.value === 'published')}
                className="px-3 py-1.5 text-xs rounded-lg border border-[#DED7CD] dark:border-[#38312C] bg-white dark:bg-[#181615]"
              >
                <option value="published">প্রকাশিত (পাঠকরা দেখতে পাবেন)</option>
                <option value="draft">খসড়া (অপ্রকাশিত)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-xl border border-[#DED7CD] dark:border-[#38312C] hover:bg-[#F2ECE4] dark:hover:bg-[#221E1C]"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 text-xs font-medium rounded-xl bg-[#8C271E] hover:bg-[#A32E24] text-white transition-colors shadow-md disabled:opacity-50 flex items-center gap-1.5"
            >
              {saving ? (
                <span>সংরক্ষণ হচ্ছে...</span>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{chapterToEdit ? 'আপডেট করুন' : 'অধ্যায় সংরক্ষণ করুন'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
