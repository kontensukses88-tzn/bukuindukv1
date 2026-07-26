/**
 * Utility functions for handling Google Drive URLs, image formatting, and local file conversion.
 */

/**
 * Extracts Google Drive File ID from various Google Drive URL formats.
 * Supported formats include:
 * - https://drive.google.com/file/d/1A2B3C4D5E6F7G8H9I0J/view?usp=sharing
 * - https://drive.google.com/file/d/1A2B3C4D5E6F7G8H9I0J/view
 * - https://drive.google.com/open?id=1A2B3C4D5E6F7G8H9I0J
 * - https://drive.google.com/uc?id=1A2B3C4D5E6F7G8H9I0J
 * - https://drive.google.com/uc?export=view&id=1A2B3C4D5E6F7G8H9I0J
 * - https://drive.google.com/thumbnail?id=1A2B3C4D5E6F7G8H9I0J&sz=w1000
 * - https://lh3.googleusercontent.com/d/1A2B3C4D5E6F7G8H9I0J
 */
export const extractGoogleDriveFileId = (url?: string): string | null => {
  if (!url) return null;
  const str = url.trim();

  // Pattern 1: /file/d/FILE_ID
  const match1 = str.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match1 && match1[1]) return match1[1];

  // Pattern 2: id=FILE_ID
  const match2 = str.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match2 && match2[1]) return match2[1];

  // Pattern 3: /d/FILE_ID
  const match3 = str.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match3 && match3[1]) return match3[1];

  // Pattern 4: googleusercontent.com/d/FILE_ID
  const match4 = str.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
  if (match4 && match4[1]) return match4[1];

  // Pattern 5: thumbnail?id=FILE_ID
  const match5 = str.match(/thumbnail\?id=([a-zA-Z0-9_-]+)/);
  if (match5 && match5[1]) return match5[1];

  return null;
};

/**
 * Checks if a string contains a Google Drive URL
 */
export const isGoogleDriveUrl = (url?: string): boolean => {
  if (!url) return false;
  return extractGoogleDriveFileId(url) !== null;
};

/**
 * Formats Google Drive URLs into direct image CDN URLs usable in <img> tags.
 * Supports fallback options:
 * fallbackIndex 0: https://lh3.googleusercontent.com/d/FILE_ID (Primary Google CDN endpoint)
 * fallbackIndex 1: https://drive.google.com/thumbnail?id=FILE_ID&sz=w1000
 * fallbackIndex 2: https://drive.google.com/uc?export=view&id=FILE_ID
 */
export const formatGoogleDriveImageUrl = (url?: string, fallbackIndex = 0): string => {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  const fileId = extractGoogleDriveFileId(trimmed);
  if (fileId) {
    if (fallbackIndex === 1) {
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
    }
    if (fallbackIndex === 2) {
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  return trimmed;
};

/**
 * Converts a File object (e.g. uploaded from user's computer) into a Base64 Data URL string
 */
export const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Check file size limit (max 3MB for good performance)
    if (file.size > 5 * 1024 * 1024) {
      reject(new Error('Ukuran berkas foto melebihi 5 MB. Harap pilih foto berukuran lebih kecil.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};
