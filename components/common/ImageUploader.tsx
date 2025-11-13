import React, { useState, useRef, useCallback } from 'react';
import Spinner from './Spinner';

interface ImageUploaderProps {
  onImageUpload: (url: string) => void;
  initialImageUrl?: string;
  label: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, initialImageUrl, label }) => {
  const [preview, setPreview] = useState<string | null>(initialImageUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        // Simulate upload and getting a URL back
        setTimeout(() => {
          const mockUrl = `https://picsum.photos/seed/${Date.now()}/${Math.floor(Math.random() * 200) + 400}/${Math.floor(Math.random() * 200) + 300}`;
          setPreview(reader.result as string);
          onImageUpload(mockUrl);
          setIsUploading(false);
        }, 1500);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSelectFileClick = () => {
    fileInputRef.current?.click();
  };
  
  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);
  
  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  }, []);

  const onRemoveImage = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      setPreview(null);
      onImageUpload('');
      if(fileInputRef.current) {
          fileInputRef.current.value = "";
      }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">{label}</label>
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`relative group aspect-video w-full border-2 border-dashed rounded-lg flex items-center justify-center transition-colors ${
          isDragging ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]' : 'border-[var(--color-border)]'
        } ${preview ? 'border-solid' : ''}`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
          accept="image/*"
          className="hidden"
        />
        {isUploading ? (
          <div className="text-center">
            <Spinner size="md" className="mx-auto" />
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">جاري الرفع...</p>
          </div>
        ) : preview ? (
          <>
            <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                <button
                    type="button"
                    onClick={onRemoveImage}
                    className="bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
                >
                    إزالة الصورة
                </button>
            </div>
          </>
        ) : (
          <div className="text-center p-6 cursor-pointer" onClick={onSelectFileClick}>
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              <span className="font-semibold text-[var(--color-primary)]">ارفع ملفًا</span> أو اسحبه وأفلته هنا
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;