'use client';

import { useRef } from 'react';
import { Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ALLOWED_FILE_TYPES, FILE_LIMITS } from '@/lib/chatqa-constants';
import type { FileType } from '@/types/chatqa';

interface FileUploadButtonProps {
  onFilesAdded: (files: File[]) => void;
  disabled?: boolean;
}

const ACCEPTED_EXTENSIONS = '.pdf,.ppt,.pptx,.png,.jpg,.jpeg,.webp';

function getFileType(file: File): FileType | null {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'jpeg') return 'jpg';
  if (ext && ext in ALLOWED_FILE_TYPES) return ext as FileType;
  return null;
}

export function FileUploadButton({ onFilesAdded, disabled }: FileUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;

    const validFiles: File[] = [];

    Array.from(fileList).forEach((file) => {
      const fileType = getFileType(file);
      if (!fileType) return;

      const sizeLimit = FILE_LIMITS[fileType];
      if (file.size > sizeLimit) return;

      validFiles.push(file);
    });

    if (validFiles.length > 0) {
      onFilesAdded(validFiles);
    }

    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  return (
    <div className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleClick}
        disabled={disabled}
        className="h-8 w-8 text-chatqa-text-secondary hover:text-chatqa-text hover:bg-chatqa-border/50"
      >
        <Paperclip className="h-4 w-4" />
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS}
        multiple
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
