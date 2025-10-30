import { createClient } from '../supabase/client';

const BUCKET_NAME = 'post-images';

/**
 * Upload an image to Supabase Storage
 * @param file The file to upload
 * @param userId The ID of the user uploading the file
 * @returns The public URL of the uploaded file
 */
export async function uploadImage(file: File, userId: string): Promise<string> {
  const supabase = createClient();

  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  // Validate file size (5MB max)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    throw new Error('File size must be less than 5MB');
  }

  // Generate unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;

  // Upload file
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Error uploading file:', error);
    throw error;
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);

  return publicUrl;
}

/**
 * Delete an image from Supabase Storage
 * @param url The public URL of the image to delete
 */
export async function deleteImage(url: string): Promise<void> {
  const supabase = createClient();

  // Extract path from URL
  const urlParts = url.split('/');
  const bucketIndex = urlParts.findIndex((part) => part === BUCKET_NAME);
  if (bucketIndex === -1) {
    throw new Error('Invalid image URL');
  }

  const path = urlParts.slice(bucketIndex + 1).join('/');

  // Delete file
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([path]);

  if (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

/**
 * Create the post-images bucket if it doesn't exist
 * This should be called during initial setup
 */
export async function createImageBucket(): Promise<void> {
  const supabase = createClient();

  // Check if bucket exists
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some((bucket) => bucket.name === BUCKET_NAME);

  if (!bucketExists) {
    // Create bucket
    const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
    });

    if (error) {
      console.error('Error creating bucket:', error);
      throw error;
    }
  }
}

