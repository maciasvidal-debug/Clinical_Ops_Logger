import React from 'react';
import { useTranslation } from '@/lib/i18n';
import { useDynamicTranslation } from '@/lib/i18n/utils';
import { ActivityCategory } from '@/lib/types';

interface CategorySelectionProps {
  availableCategories: ActivityCategory[];
  categoryId: string;
  setSelectedCategoryId: (val: string) => void;
}

export function CategorySelection({
  availableCategories,
  categoryId,
  setSelectedCategoryId
}: CategorySelectionProps) {
  const { t } = useTranslation();
  const { dt } = useDynamicTranslation();

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-neutral-700">{t.logForm.category}</label>
      <select
        value={categoryId}
        onChange={e => setSelectedCategoryId(e.target.value)}
        className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none appearance-none"
      >
        {availableCategories.length === 0 ? (
          <option value="">{t.logForm.noCategoriesAvailable}</option>
        ) : (
          availableCategories.map(c => (
            <option key={c.id} value={c.id}>{dt(c.name)}</option>
          ))
        )}
      </select>
    </div>
  );
}
