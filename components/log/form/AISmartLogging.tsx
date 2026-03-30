import React from 'react';
import { Sparkles, Clock } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface AISmartLoggingProps {
  aiInput: string;
  setAiInput: (val: string) => void;
  isParsing: boolean;
  handleAIParsing: () => void;
}

export function AISmartLogging({
  aiInput,
  setAiInput,
  isParsing,
  handleAIParsing
}: AISmartLoggingProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-indigo-600" />
        <h3 className="text-sm font-semibold text-indigo-900">{t.logForm.aiSmartLogging}</h3>
      </div>
      <p className="text-xs text-indigo-700/80 mb-4">
        {t.logForm.aiDescription}
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={aiInput}
          onChange={e => setAiInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAIParsing()}
          placeholder={t.logForm.aiPlaceholder}
          className="flex-1 px-4 py-2.5 bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm shadow-sm"
        />
        <button
          type="button"
          onClick={handleAIParsing}
          disabled={isParsing || !aiInput.trim()}
          className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-sm font-medium transition-colors shadow-sm flex items-center justify-center gap-2 shrink-0"
        >
          {isParsing ? (
            <>
              <Clock className="w-4 h-4 animate-spin" />{t.logForm.parsing}
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              {t.logForm.aiButton}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
