import React, { useState, useEffect } from 'react';
import { Poem } from '../../types';
import { useData } from '../../context/DataContext';
import { AdminCoverUploader } from './AdminCoverUploader';
import { X, Check, AlertCircle } from 'lucide-react';

interface AdminPoemModalProps {
  isOpen: boolean;
  poemToEdit: Poem | null;
  onClose: () => void;
}

export function AdminPoemModal({ isOpen, poemToEdit, onClose }: AdminPoemModalProps) {
  const { createPoem, updatePoem } = useData();

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
    if (poemToEdit) {
      setTitle(poemToEdit.title);
      setExcerpt(poemToEdit.excerpt || '');
      setContent(poemToEdit.content);
      const existingCover = poemToEdit.cover_url || '';
      setCoverUrl(existingCover);
      setInitialCoverUrl(existingCover);
      setPublished(Boolean(poemToEdit.published));
    } else {
      setTitle('');
      setExcerpt('');
      setContent('');
      setCoverUrl('');
      setInitialCoverUrl('');
      setPublished(true);
    }
    setError(null);
  }, [poemToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (uploading) {
      setError('ছবি আপলোড সম্পন্ন হওয়া পর্যন্ত অপেক্ষা করুন।');
      return;
    }

    if (!title.trim()) {
      setError('কবিতার শিরোনাম আবশ্যক');
      return;
    }
    if (!content.trim()) {
      setError('কবিতার মূল পংক্তি বা স্তবক আবশ্যক');
      return;
    }

    setSaving(true);
    const finalExcerpt = excerpt.trim() || content.slice(0, 120).replace(/\n/g, ' ');
    const finalCoverUrl = coverUrl.trim() || null;

    try {
      if (poemToEdit) {
        await updatePoem(poemToEdit.id, {
          title: title.trim(),
          excerpt: finalExcerpt,
          content,
          cover_url: finalCoverUrl,
          published,
        });
      } else {
        await createPoem({
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
      <div className="w-full max-w-2xl bg-white dark:bg-[#181615] rounded-2xl border border-[#E8E1D7] dark:border-[#2C2724] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#EFECE8] dark:border-[#25211F] flex items-center justify-between">
          <h3 className="font-serif font-bold text-lg text-[#1F1C1A] dark:text-[#FAF7F2]">
            {poemToEdit ? 'কবিতা সম্পাদনা' : 'নতুন কবিতা প্রকাশ'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#F2ECE4] dark:hover:bg-[#2A2522] text-[#8A8178]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 grow">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#544D46] dark:text-[#C7C0B7] mb-1">
              কবিতার শিরোনাম *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="যেমন: সন্ধ্যার পদাবলি"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#DED7CD] dark:border-[#38312C] bg-[#FAF8F5] dark:bg-[#1F1C1A] text-[#1F1C1A] dark:text-[#F0ECE7]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#544D46] dark:text-[#C7C0B7] mb-1">
              সংক্ষিপ্ত নির্যাস (Excerpt)
            </label>
            <input
              type="text"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="কবিতার মূল সুর বা প্রথম কয়েকটি চরণ..."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#DED7CD] dark:border-[#38312C] bg-[#FAF8F5] dark:bg-[#1F1C1A] text-[#1F1C1A] dark:text-[#F0ECE7]"
            />
          </div>

          {/* Cover image & upload */}
          <AdminCoverUploader
            coverUrl={coverUrl}
            onChange={setCoverUrl}
            contentType="poems"
            uploading={uploading}
            setUploading={setUploading}
            onError={setError}
            disabled={saving}
          />

          {/* Poem Content - newline preservation */}
          <div>
            <label className="block text-xs font-semibold text-[#544D46] dark:text-[#C7C0B7] mb-1">
              কবিতার মূল পংক্তিমালা (চরণ ও স্তবক বিন্যাস অপরিবর্তিত থাকবে) *
            </label>
            <textarea
              required
              rows={10}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`সন্ধ্যার আঁধারে নদীর বাঁকে\nএকলা বকের ছায়া,\nজলতরঙ্গে আঁকা থাকে\nএক অচেনা মায়া।`}
              className="w-full p-4 text-base font-serif rounded-xl border border-[#DED7CD] dark:border-[#38312C] bg-[#FAF8F5] dark:bg-[#1F1C1A] text-[#1F1C1A] dark:text-[#F0ECE7] focus:outline-hidden focus:border-[#8C271E] leading-relaxed"
            />
          </div>

          {/* Published toggle */}
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

          {/* Action buttons */}
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
                  <span>{poemToEdit ? 'আপডেট করুন' : 'প্রকাশ করুন'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
