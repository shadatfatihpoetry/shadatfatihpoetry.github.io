import React, { useRef, useState } from 'react';
import { uploadCoverToGoogleDrive } from '../../lib/googleSheets';
import { Upload, Trash2, Link as LinkIcon, Loader2, Image as ImageIcon } from 'lucide-react';

type CoverContentType = 'poems' | 'stories' | 'novels';

interface Props {
  coverUrl: string;
  onChange: (url: string) => void;
  contentType: CoverContentType;
  uploading: boolean;
  setUploading: (uploading: boolean) => void;
  onError: (error: string | null) => void;
  disabled?: boolean;
}

export function AdminCoverUploader({ coverUrl, onChange, contentType, uploading, setUploading, onError, disabled = false }: Props) {
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const displayUrl = localPreviewUrl || coverUrl;

  const handleFileSelection = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['image/jpeg','image/png','image/webp','image/jpg'];
    if (!allowed.includes(file.type) || file.size > 10 * 1024 * 1024) {
      onError('শুধুমাত্র JPG, JPEG, PNG অথবা WebP ছবি (সর্বোচ্চ ১০ MB) গ্রহণযোগ্য।');
      return;
    }
    onError(null);
    const objectUrl = URL.createObjectURL(file);
    setLocalPreviewUrl(objectUrl);
    setUploading(true);
    try {
      const url = await uploadCoverToGoogleDrive(file, contentType);
      onChange(url);
      setLocalPreviewUrl(null);
      URL.revokeObjectURL(objectUrl);
    } catch (err: any) {
      setLocalPreviewUrl(null);
      URL.revokeObjectURL(objectUrl);
      onError(err?.message || 'ছবি আপলোড করতে ব্যর্থ হয়েছে।');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-[#544D46] dark:text-[#C7C0B7]">কভার চিত্র (Cover Image)</label>
        <button type="button" onClick={() => setShowUrlInput(!showUrlInput)} disabled={disabled || uploading} className="text-[11px] text-[#8C271E] dark:text-[#FFB4AB] hover:underline flex items-center gap-1">
          <LinkIcon className="w-3 h-3" /><span>{showUrlInput ? 'ফাইল আপলোড মোড' : 'সরাসরি URL ব্যবহার করুন'}</span>
        </button>
      </div>
      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/jpg" onChange={handleFileSelection} disabled={disabled || uploading} className="hidden" />
      {displayUrl ? (
        <div className="p-3 rounded-xl border border-[#DED7CD] dark:border-[#38312C] bg-[#FAF8F5] dark:bg-[#1F1C1A] flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative w-24 h-28 sm:w-28 sm:h-32 rounded-lg overflow-hidden border border-[#DED7CD] dark:border-[#38312C] shrink-0 bg-stone-200 dark:bg-stone-800">
            <img src={displayUrl} alt="কভার ছবির প্রিভিউ" className="w-full h-full object-cover" onError={(e) => {(e.currentTarget.style.display='none');}} />
            {uploading && <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white"><Loader2 className="w-5 h-5 animate-spin" /></div>}
          </div>
          <div className="grow space-y-2 text-left w-full">
            <p className="text-xs font-medium text-[#1F1C1A] dark:text-[#F0ECE7] flex items-center gap-1.5"><ImageIcon className="w-3.5 h-3.5 text-[#8C271E]" />বর্তমান কভার চিত্র</p>
            <p className="text-[11px] text-[#786F66] dark:text-[#A8A095] truncate max-w-xs">{displayUrl.startsWith('blob:') ? 'লোকাল প্রিভিউ' : displayUrl}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={disabled || uploading} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF4ED] dark:bg-[#25201E] border border-[#DED7CD] text-xs font-medium text-[#8C271E]"><Upload className="w-3.5 h-3.5" />নতুন ছবি নির্বাচন</button>
              <button type="button" onClick={() => onChange('')} disabled={disabled || uploading} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-xs font-medium text-red-600"><Trash2 className="w-3.5 h-3.5" />ছবি মুছুন</button>
            </div>
          </div>
        </div>
      ) : (
        <div onClick={() => !disabled && !uploading && fileInputRef.current?.click()} className={`p-6 rounded-xl border-2 border-dashed border-[#DED7CD] dark:border-[#38312C] hover:border-[#8C271E] bg-[#FAF8F5] dark:bg-[#1F1C1A] text-center cursor-pointer ${uploading || disabled ? 'pointer-events-none opacity-60' : ''}`}>
          {uploading ? <div className="flex flex-col items-center gap-2"><Loader2 className="w-6 h-6 animate-spin text-[#8C271E]" /><p className="text-xs font-medium">Google Drive-এ ছবি আপলোড হচ্ছে...</p></div> : <div className="flex flex-col items-center gap-1.5"><div className="p-2.5 rounded-full bg-[#FAF4ED] dark:bg-[#25201E] text-[#8C271E]"><Upload className="w-5 h-5" /></div><p className="text-xs font-semibold">কভার ছবি নির্বাচন করুন</p><p className="text-[11px] text-[#786F66]">JPG, JPEG, PNG, WebP (সর্বোচ্চ ১০ MB)</p></div>}
        </div>
      )}
      {showUrlInput && <div className="p-3 rounded-xl bg-[#F5EFE6] dark:bg-[#221E1C] border border-[#E0D7CB] space-y-1.5"><label className="block text-[11px] font-medium">সরাসরি ছবির URL</label><div className="flex gap-2"><input type="text" value={coverUrl} onChange={e=>onChange(e.target.value)} placeholder="https://..." disabled={disabled || uploading} className="grow px-3 py-1.5 text-xs rounded-lg border bg-white dark:bg-[#181615]" />{coverUrl && <button type="button" onClick={()=>onChange('')} className="px-2.5 py-1.5 text-xs rounded-lg border border-red-200 text-red-600">মুছুন</button>}</div></div>}
    </div>
  );
}
