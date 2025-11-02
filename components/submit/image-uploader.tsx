'use client';

import { ChangeEvent, DragEvent, useState } from 'react';
import Image from 'next/image';
import { Loader2, UploadCloud, XCircle } from 'lucide-react';
import clsx from 'clsx';
import { uploadImage, deleteImage } from '@/lib/utils/upload';
import { useAuth } from '@/lib/hooks/use-auth';

interface ImageUploaderProps {
  value?: string | null;
  onChange: (url: string | null) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export function ImageUploader({ value = null, onChange }: ImageUploaderProps) {
  const { user, isAuthenticated } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Only JPEG, PNG, GIF, and WEBP images are allowed.';
    }

    if (file.size > MAX_FILE_SIZE) {
      return 'Image must be less than 5MB.';
    }

    return null;
  };

  const handleFile = async (file: File) => {
    if (!isAuthenticated || !user) {
      setError('Please sign in to upload images.');
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsUploading(true);
    setProgress(10);
    setError('');

    try {
      const imageUrl = await uploadImage(file, user.id);
      setProgress(100);
      onChange(imageUrl);
    } catch (err) {
      console.error('Failed to upload image:', err);
      setError((err as Error).message || 'Failed to upload image');
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setProgress(0);
      }, 400);
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      void handleFile(file);
    }
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      void handleFile(file);
    }
  };

  const removeImage = async () => {
    if (value) {
      try {
        await deleteImage(value);
      } catch (err) {
        console.error('Failed to delete image from storage:', err);
      }
    }

    onChange(null);
    setError('');
  };

  return (
    <div className="space-y-3">
      <label
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={clsx(
          'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 p-8 text-center transition-colors dark:border-zinc-700 dark:bg-zinc-900',
          isDragging && 'border-orange-500 bg-orange-50/40 dark:border-orange-400 dark:bg-orange-950/30',
          isUploading && 'pointer-events-none opacity-80'
        )}
      >
        <input
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          className="hidden"
          onChange={handleInputChange}
        />

        {isUploading ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Uploading image...</p>
            <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
              <div
                className="h-full bg-orange-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </>
        ) : (
          <>
            <UploadCloud className="h-10 w-10 text-orange-500" />
            <div>
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                Drag and drop an image, or click to browse
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Supported formats: JPG, PNG, GIF, WEBP up to 5MB
              </p>
            </div>
          </>
        )}
      </label>

      {value && (
        <div className="relative overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
          <Image
            src={value}
            alt="Uploaded preview"
            width={800}
            height={600}
            className="h-60 w-full object-cover"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white backdrop-blur transition hover:bg-black/90"
          >
            <XCircle className="h-4 w-4" />
            Remove
          </button>
        </div>
      )}

      {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
    </div>
  );
}
