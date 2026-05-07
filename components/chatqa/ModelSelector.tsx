'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import type { ModelId } from '@/types/chatqa';

interface ModelSelectorProps {
  value: ModelId;
  onChange: (model: ModelId) => void;
}

const MODELS: { id: ModelId; short: string; full: string }[] = [
  { id: 'claude-3-haiku-20240307', short: 'Haiku', full: 'Claude 3 Haiku (Fast)' },
  { id: 'claude-3-5-sonnet-20241022', short: 'Sonnet', full: 'Claude 3.5 Sonnet (Powerful)' },
];

export function ModelSelector({ value, onChange }: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const current = MODELS.find((m) => m.id === value)!;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 rounded-lg border border-chatqa-border bg-chatqa-bg/50 px-2.5 py-1 text-[11px] font-medium text-chatqa-text-secondary hover:text-chatqa-text transition-colors"
      >
        {current.short}
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-1 w-56 rounded-lg border border-chatqa-border bg-chatqa-surface shadow-lg z-50 overflow-hidden">
          {MODELS.map((model) => (
            <button
              key={model.id}
              type="button"
              onClick={() => {
                onChange(model.id);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between px-3 py-2 text-xs text-chatqa-text hover:bg-chatqa-surface-hover transition-colors"
            >
              <span>{model.full}</span>
              {value === model.id && <Check className="h-3.5 w-3.5 text-chatqa-accent" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
