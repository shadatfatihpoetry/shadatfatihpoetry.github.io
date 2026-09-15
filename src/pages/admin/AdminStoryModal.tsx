import React, { useState, useEffect } from 'react';
import { Story } from '../../types';
import { useData } from '../../context/DataContext';
import { deleteCoverFromStorage } from '../../lib/supabase';
import { AdminCoverUploader } from './AdminCoverUploader';
import { X, Check, AlertCircle } from 'lucide-react';

interface AdminStoryModalProps {
  isOpen: boolean;
  storyToEdit: Story | null;
  onClose: () => void;
}

export function AdminStoryModal({ isOpen, storyToEdit, onClose }: AdminStoryModalProps) {
  const { createStory, updateStory } = useData();

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [initialCoverUrl, setInitialCoverUrl] = useState('');
  const [published, setPublished] = useState(true);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (storyToEdit) {
      setTitle(storyToEdit.title);
      setExcerpt(storyToEdit.excerpt || '');
      setContent(storyToEdit.content);
      const existingCover = storyToEdit.cover_url || '';
      setCoverUrl(existingCover);
      setInitialCoverUrl(existingCover);
      setPublished(Boolean(storyToEdit.published));
    } else {
      setTitle('');
      setExcerpt('');
      setContent('');
      setCoverUrl('');
      setInitialCoverUrl('');
      setPublished(true);
    }
    setError(null);
  }, [storyToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (uploading) {
      setError('ছবি আপলোড সম্পন্ন হওয়া পর্যন্ত অপেক্ষা করুন।');
      return;
    }

    if (!title.trim()) {
      setError('গল্পের শিরোনাম আবশ্যক');
      return;
    }
    if (!content.trim()) {
      setError('গল্পের মূল বক্তব্য বা কন্টেন্ট আবশ্যক');
      return;
    }

    setSaving(true);
    const finalExcerpt = excerpt.trim() || content.slice(0, 150).replace(/\n/g, ' ');
    const finalCoverUrl = coverUrl.trim() || null;

    try {
      if (storyToEdit) {
        await updateStory(storyToEdit.id, {
          title: title.trim(),
          excerpt: finalExcerpt,
          content,
          cover_url: finalCoverUrl,
          published,
        });

        // Delete old storage object only after the new upload and database update succeed
        if (initialCoverUrl && initialCoverUrl !== finalCoverUrl) {
          deleteCoverFromStorage(initialCoverUrl);
        }
      } else {
        await createStory({
          title: title.trim(),
          excerpt: finalExcerpt,
          content,
          cover_url: finalCoverUrl,
          published,
        });
      }
      setSaving(false);
      onClose();
    } catch (err: any) {
      setSaving(false);
      setError(err?.message || 'সংরক্ষণে ব্যর্থ হয়েছে');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-3xl bg-white dark:bg-[#181615] rounded-2xl border border-[#E8E1D7] dark:border-[#2C2724] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-5 border-b border-[#EFECE8] dark:border-[#25211F] flex items-center justify-between">
          <h3 className="font-serif font-bold text-lg text-[#1F1C1A] dark:text-[#FAF7F2]">
            {storyToEdit ? 'গল্প সম্পাদনা' : 'নতুন গল্প প্রকাশ'}
          </h3>
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

          <div>
            <label className="block text-xs font-semibold text-[#544D46] dark:text-[#C7C0B7] mb-1">
              গল্পের শিরোনাম *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="যেমন: নদীর ওপারে ছায়া"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#DED7CD] dark:border-[#38312C] bg-[#FAF8F5] dark:bg-[#1F1C1A] text-[#1F1C1A] dark:text-[#F0ECE7]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#544D46] dark:text-[#C7C0B7] mb-1">
              সংক্ষিপ্ত কাহিনী আভাস (Excerpt)
            </label>
            <input
              type="text"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="গল্পের সংক্ষিপ্ত পরিচিতি..."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#DED7CD] dark:border-[#38312C] bg-[#FAF8F5] dark:bg-[#1F1C1A] text-[#1F1C1A] dark:text-[#F0ECE7]"
            />
          </div>

          {/* Cover image & upload */}
          <AdminCoverUploader
            coverUrl={coverUrl}
            onChange={setCoverUrl}
            contentType="stories"
            uploading={uploading}
            setUploading={setUploading}
            onError={setError}
            disabled={saving}
          />

          <div>
            <label className="block text-xs font-semibold text-[#544D46] dark:text-[#C7C0B7] mb-1">
              গল্পের মূল লেখা (Paragraphs preserved) *
            </label>
            <textarea
              required
              rows={12}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="গল্পের পরিচ্ছেদ ও বাক্যসমূহ..."
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
                <option value="published">প্রকাশিত (Published)</option>
                <option value="draft">খসড়া (Draft)</option>
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
              disabled={saving || uploading}
              className="px-6 py-2 text-xs font-medium rounded-xl bg-[#8C271E] hover:bg-[#A32E24] text-white transition-colors shadow-md disabled:opacity-50 flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
            >
              {uploading ? (
                <span>ছবি আপলোড হচ্ছে...</span>
              ) : saving ? (
                <span>সংরক্ষণ হচ্ছে...</span>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{storyToEdit ? 'আপডেট করুন' : 'প্রকাশ করুন'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
