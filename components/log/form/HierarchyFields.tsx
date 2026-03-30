import React from 'react';
import { useTranslation } from '@/lib/i18n';
import { useDynamicTranslation } from '@/lib/i18n/utils';
import { Project, Protocol, Site } from '@/lib/types';

interface HierarchyFieldsProps {
  projects: Project[];
  availableProtocols: Protocol[];
  availableSites: Site[];
  projectId: string;
  setSelectedProjectId: (val: string) => void;
  protocolId: string;
  setSelectedProtocolId: (val: string) => void;
  siteId: string;
  setSelectedSiteId: (val: string) => void;
}

export function HierarchyFields({
  projects,
  availableProtocols,
  availableSites,
  projectId,
  setSelectedProjectId,
  protocolId,
  setSelectedProtocolId,
  siteId,
  setSelectedSiteId
}: HierarchyFieldsProps) {
  const { t } = useTranslation();
  const { dt } = useDynamicTranslation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700">{t.logForm.project}</label>
        <select
          value={projectId}
          onChange={e => setSelectedProjectId(e.target.value)}
          className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none appearance-none"
          disabled={projects.length === 0}
        >
          {projects.length === 0 ? (
            <option value="">{t.logForm.selectProject}</option>
          ) : (
            projects.map(p => (
              <option key={p.id} value={p.id}>{dt(p.name)}</option>
            ))
          )}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700">{t.logForm.protocol}</label>
        <select
          value={protocolId}
          onChange={e => setSelectedProtocolId(e.target.value)}
          className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none appearance-none"
          disabled={availableProtocols.length === 0}
        >
          {availableProtocols.length === 0 ? (
            <option value="">{t.logForm.selectProtocol}</option>
          ) : (
            availableProtocols.map(p => (
              <option key={p.id} value={p.id}>{dt(p.name)}</option>
            ))
          )}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-700">{t.logForm.siteOptional}</label>
        <select
          value={siteId}
          onChange={e => setSelectedSiteId(e.target.value)}
          className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none appearance-none"
          disabled={availableSites.length === 0}
        >
          <option value="">{t.logForm.selectSite}</option>
          {availableSites.map(s => (
            <option key={s.id} value={s.id}>{s.name} ({s.country})</option>
          ))}
        </select>
      </div>
    </div>
  );
}
