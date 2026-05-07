'use client';

import { useState, useCallback } from 'react';
import type { Attachment, UseFileUploadReturn } from '@/types/chatqa';
import { generateId, validateFile } from '@/lib/chatqa-utils';
import { getPresignedUploadUrl, uploadFileToS3 } from '@/lib/chatqa-api';

export function useFileUpload(): UseFileUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(async (file: File): Promise<Attachment> => {
    setError(null);
    setProgress(0);

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      const errMsg = validation.error ?? 'Invalid file';
      setError(errMsg);
      throw new Error(errMsg);
    }

    setIsUploading(true);

    try {
      // Simulate progress updates during presigned URL fetch
      setProgress(10);

      const { url, key } = await getPresignedUploadUrl(file.name, file.type);
      setProgress(30);

      // Upload to S3
      // Simulate progress increments
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      await uploadFileToS3(url, file);
      clearInterval(progressInterval);
      setProgress(100);

      const extension = file.name.split('.').pop()?.toLowerCase() ?? 'pdf';

      const attachment: Attachment = {
        id: generateId(),
        fileName: file.name,
        fileType: extension as Attachment['fileType'],
        s3Key: key,
        url: `https://mock-cdn.example.com/${key}`,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      };

      return attachment;
    } catch (err) {
      const errMsg =
        err instanceof Error ? err.message : 'Upload failed. Please try again.';
      setError(errMsg);
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    uploadFile,
    isUploading,
    progress,
    error,
    clearError,
  };
}
