'use client';

import type { DataSource } from '@/types/chatqa';
import { Database, Lightbulb } from 'lucide-react';

interface DataSourceToggleProps {
  value: DataSource;
  onChange: (ds: DataSource) => void;
}

export function DataSourceToggle({ value, onChange }: DataSourceToggleProps) {
  const isRecordsActive = value === 'records' || value === 'both';
  const isInsightsActive = value === 'insights' || value === 'both';

  const handleToggle = (source: 'records' | 'insights') => {
    if (source === 'records') {
      if (isRecordsActive && isInsightsActive) onChange('insights');
      else if (isRecordsActive) onChange('both');
      else onChange(isInsightsActive ? 'both' : 'records');
    } else {
      if (isInsightsActive && isRecordsActive) onChange('records');
      else if (isInsightsActive) onChange('both');
      else onChange(isRecordsActive ? 'both' : 'insights');
    }
  };

  return (
    <div className="flex items-center gap-1 rounded-lg border border-chatqa-border bg-chatqa-bg/50 p-0.5">
      <button
        type="button"
        onClick={() => handleToggle('records')}
        className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-medium transition-all ${
          isRecordsActive
            ? 'bg-chatqa-accent text-white shadow-sm'
            : 'text-chatqa-text-muted hover:text-chatqa-text-secondary hover:bg-chatqa-surface'
        }`}
      >
        <Database className="h-3 w-3" />
        Records
      </button>
      <button
        type="button"
        onClick={() => handleToggle('insights')}
        className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-medium transition-all ${
          isInsightsActive
            ? 'bg-chatqa-accent text-white shadow-sm'
            : 'text-chatqa-text-muted hover:text-chatqa-text-secondary hover:bg-chatqa-surface'
        }`}
      >
        <Lightbulb className="h-3 w-3" />
        Insights
      </button>
    </div>
  );
}
