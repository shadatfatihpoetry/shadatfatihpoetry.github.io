import React, { useState, useRef } from 'react';
import {
  CoverContentType,
  uploadCoverImageToStorage,
  validateCoverImageFile,
} from '../../lib/supabase';
import { Upload, Trash2, Link as LinkIcon, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface AdminCoverUploaderProps {
  coverUrl: string;
  onChange: (url: string) => void;
  contentType: CoverContentType;
  uploading: boolean;
  setUploading: (uploading: boolean) => void;
  onError: (error: string | null) => void;
  disabled?: boolean;
}

export function AdminCoverUploader({
  coverUrl,
  onChange,
  contentType,
  uploading,
  setUploading,
  onError,
  disabled = false,
}: AdminCoverUploaderProps) {
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayUrl = localPreviewUrl || coverUrl;

  const handleFileSelection = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Validate file format and size
    const validation = validateCoverImageFile(file);
    if (!validation.valid) {
      onError(validation.error || 'অগ্রহণযোগ্য ছবি ফাইল');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    onError(null);

    // 2. Show instant local preview before/during upload
    const objectUrl = URL.createObjectURL(file);
    setLocalPreviewUrl(objectUrl);
    setUploading(true);

    try {
      // 3. Upload to Supabase Storage 'covers' bucket
      const { url, error: uploadError } = await uploadCoverImageToStorage(file, contentType);

      if (uploadError) {
        setLocalPreviewUrl(null);
        URL.revokeObjectURL(objectUrl);
        onError(uploadError);
      } else if (url) {
        onChange(url);
        setLocalPreviewUrl(null);
        URL.revokeObjectURL(objectUrl);
      }
    } catch (err: any) {
      setLocalPreviewUrl(null);
      URL.revokeObjectURL(objectUrl);
      onError(err?.message || 'ছবি আপলোড করতে ব্যর্থ হয়েছে।');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    if (disabled || uploading) return;
    setLocalPreviewUrl(null);
    onChange('');
    onError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const triggerFilePicker = () => {
    if (disabled || uploading) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-[#544D46] dark:text-[#C7C0B7]">
          কভার চিত্র (Cover Image)
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          disabled={disabled || uploading}
          className="text-[11px] text-[#8C271E] dark:text-[#FFB4AB] hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
        >
          <LinkIcon className="w-3 h-3" />
          <span>{showUrlInput ? 'ফাইল আপলোড মোড' : 'সরাসরি URL ব্যবহার করুন'}</span>
        </button>
      </div>

      {/* Hidden file input supporting JPG, JPEG, PNG, WebP */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={handleFileSelection}
        disabled={disabled || uploading}
        className="hidden"
      />

      {/* Image Preview Box if coverUrl or localPreview exists */}
      {displayUrl ? (
        <div className="p-3 rounded-xl border border-[#DED7CD] dark:border-[#38312C] bg-[#FAF8F5] dark:bg-[#1F1C1A] flex flex-col sm:flex-row gap-3 items-center">
          {/* Thumbnail preview */}
          <div className="relative w-24 h-28 sm:w-28 sm:h-32 rounded-lg overflow-hidden border border-[#DED7CD] dark:border-[#38312C] shrink-0 bg-stone-200 dark:bg-stone-800">
            <img
              src={displayUrl}
              alt="কভার ছবির প্রিভিউ"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Handle broken external images gracefully
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            {uploading && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white p-2 text-center">
                <Loader2 className="w-5 h-5 animate-spin mb-1 text-white" />
                <span className="text-[10px] font-medium">আপলোড হচ্ছে...</span>
              </div>
            )}
          </div>

          {/* Details & Actions */}
          <div className="grow space-y-2 text-left w-full sm:w-auto">
            <div>
              <p className="text-xs font-medium text-[#1F1C1A] dark:text-[#F0ECE7] flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#8C271E] dark:text-[#FFB4AB]" />
                <span>বর্তমান কভার চিত্র</span>
              </p>
              <p className="text-[11px] text-[#786F66] dark:text-[#A8A095] truncate max-w-xs mt-0.5">
                {displayUrl.startsWith('data:') ? 'লোকাল প্রিভিউ' : displayUrl}
              </p>
            </div>

            {uploading ? (
              <div className="flex items-center gap-2 text-xs text-[#8C271E] dark:text-[#FFB4AB]">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>স্টোরেজে ছবি আপলোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...</span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={triggerFilePicker}
                  disabled={disabled || uploading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF4ED] dark:bg-[#25201E] border border-[#DED7CD] dark:border-[#38312C] hover:bg-[#EAE4DC] dark:hover:bg-[#2F2926] text-xs font-medium text-[#8C271E] dark:text-[#FFB4AB] transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>নতুন ছবি নির্বাচন</span>
                </button>

                <button
                  type="button"
                  onClick={handleRemoveImage}
                  disabled={disabled || uploading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-medium text-red-600 dark:text-red-400 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>ছবি মুছুন</span>
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Empty state: File picker Dropzone */
        <div
          onClick={triggerFilePicker}
          className={`p-6 rounded-xl border-2 border-dashed border-[#DED7CD] dark:border-[#38312C] hover:border-[#8C271E] dark:hover:border-[#FFB4AB] bg-[#FAF8F5] dark:bg-[#1F1C1A] text-center cursor-pointer transition-colors group ${
            uploading || disabled ? 'pointer-events-none opacity-60' : ''
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center justify-center space-y-2 py-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#8C271E] dark:text-[#FFB4AB]" />
              <p className="text-xs font-medium text-[#1F1C1A] dark:text-[#F0ECE7]">
                ছবি আপলোড হচ্ছে...
              </p>
              <p className="text-[11px] text-[#786F66] dark:text-[#A8A095]">
                Supabase 'covers' বাকেটে ফাইল ট্রান্সফার করা হচ্ছে
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-1.5 py-2">
              <div className="p-2.5 rounded-full bg-[#FAF4ED] dark:bg-[#25201E] text-[#8C271E] dark:text-[#FFB4AB] group-hover:scale-105 transition-transform">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-[#1F1C1A] dark:text-[#F0ECE7]">
                কভার ছবি নির্বাচন করুন (ফাইল ব্রাউজ করতে ক্লিক করুন)
              </p>
              <p className="text-[11px] text-[#786F66] dark:text-[#A8A095]">
                অনুমোদিত ফরম্যাট: JPG, JPEG, PNG, WebP (সর্বোচ্চ ১০ MB)
              </p>
            </div>
          )}
        </div>
      )}

      {/* Optional URL input fallback */}
      {showUrlInput && (
        <div className="p-3 rounded-xl bg-[#F5EFE6] dark:bg-[#221E1C] border border-[#E0D7CB] dark:border-[#332D29] space-y-1.5">
          <label className="block text-[11px] font-medium text-[#544D46] dark:text-[#C7C0B7]">
            সরাসরি ছবির URL লিংক পেস্ট করুন
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={coverUrl}
              onChange={(e) => {
                setLocalPreviewUrl(null);
                onChange(e.target.value);
              }}
              placeholder="https://images.unsplash.com/... অথবা স্টোরেজ লিংক"
              disabled={disabled || uploading}
              className="grow px-3 py-1.5 text-xs rounded-lg border border-[#DED7CD] dark:border-[#38312C] bg-white dark:bg-[#181615] text-[#1F1C1A] dark:text-[#F0ECE7]"
            />
            {coverUrl && (
              <button
                type="button"
                onClick={() => onChange('')}
                disabled={disabled || uploading}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
              >
                মুছুন
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
