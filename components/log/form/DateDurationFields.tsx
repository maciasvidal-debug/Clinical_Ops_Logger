import React from 'react';
import { useTranslation } from '@/lib/i18n';

interface DateDurationFieldsProps {
  date: string;
  setDate: (val: string) => void;
  hours: string;
  setHours: (val: string) => void;
  minutes: string;
  setMinutes: (val: string) => void;
}

export function DateDurationFields({
  date,
  setDate,
  hours,
  setHours,
  minutes,
  setMinutes
}: DateDurationFieldsProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 glass-panel bg-white/40 border-neutral-200/50">
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700">{t.logForm.date}</label>
        <input
          type="date"
          required
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700">{t.logForm.duration}</label>
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              type="number"
              min="0"
              required
              value={hours}
              onChange={e => setHours(e.target.value)}
              className="w-full pl-3 pr-8 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">{t.logForm.hours}</span>
          </div>
          <div className="flex-1 relative">
            <input
              type="number"
              min="0"
              max="59"
              required
              value={minutes}
              onChange={e => setMinutes(e.target.value)}
              className="w-full pl-3 pr-8 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">{t.logForm.minutes}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
