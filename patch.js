const fs = require('fs');
const path = './components/log/LogFormView.tsx';
let content = fs.readFileSync(path, 'utf8');

// Remove the eslint disable
content = content.replace('/* eslint-disable react-hooks/set-state-in-effect */\n', '');

// Remove useEffect import
content = content.replace('import React, { useState, useMemo, useEffect } from "react";', 'import React, { useState, useMemo } from "react";');

// Replace everything between useTranslation and handleSubmit
const replacement = `  const [date, setDate] = useState(initialData?.date || format(new Date(), "yyyy-MM-dd"));
  const [hours, setHours] = useState(initialData?.duration_minutes ? Math.floor(initialData.duration_minutes / 60).toString() : "1");
  const [minutes, setMinutes] = useState(initialData?.duration_minutes ? (initialData.duration_minutes % 60).toString() : "0");

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(initialData?.project_id ?? null);
  const projectId = projects.some(p => p.id === selectedProjectId)
    ? (selectedProjectId as string)
    : (projects.length > 0 ? projects[0].id : "");

  const availableProtocols = useMemo(() => {
    return protocols.filter(p => p.project_id === projectId);
  }, [projectId, protocols]);

  const [selectedProtocolId, setSelectedProtocolId] = useState<string | null>(initialData?.protocol_id ?? null);
  const protocolId = availableProtocols.some(p => p.id === selectedProtocolId)
    ? (selectedProtocolId as string)
    : (availableProtocols.length > 0 ? availableProtocols[0].id : "");

  const availableSites = useMemo(() => {
    return sites.filter(s => s.protocol_id === protocolId);
  }, [protocolId, sites]);

  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(initialData?.site_id ?? null);
  const siteId = selectedSiteId === ""
    ? ""
    : (availableSites.some(s => s.id === selectedSiteId)
      ? (selectedSiteId as string)
      : (availableSites.length > 0 ? availableSites[0].id : ""));

  const [notes, setNotes] = useState(initialData?.notes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [aiInput, setAiInput] = useState("");
  const [isParsing, setIsParsing] = useState(false);

  const availableCategories = useMemo(() => {
    if (!profile?.role) return [];
    return ROLE_HIERARCHY[profile.role] || [];
  }, [profile?.role]);

  const initialCategory = availableCategories.find(c => c.name === initialData?.category);
  const initialTask = initialCategory?.tasks.find(t => t.name === initialData?.activity);
  const initialSubTask = initialTask?.subTasks?.find(s => s.name === initialData?.sub_task);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(initialCategory?.id ?? null);
  const categoryId = availableCategories.some(c => c.id === selectedCategoryId)
    ? (selectedCategoryId as string)
    : (availableCategories.length > 0 ? availableCategories[0].id : "");

  const currentCategory = availableCategories.find(c => c.id === categoryId);
  const availableTasks = currentCategory?.tasks || [];

  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(initialTask?.id ?? null);
  const activityId = availableTasks.some(t => t.id === selectedActivityId)
    ? (selectedActivityId as string)
    : (availableTasks.length > 0 ? availableTasks[0].id : "");

  const currentTask = availableTasks.find(t => t.id === activityId);
  const availableSubTasks = currentTask?.subTasks || [];

  const [selectedSubTaskId, setSelectedSubTaskId] = useState<string | null>(initialSubTask?.id ?? null);
  const subTaskId = availableSubTasks.some(s => s.id === selectedSubTaskId)
    ? (selectedSubTaskId as string)
    : (availableSubTasks.length > 0 ? availableSubTasks[0].id : "");

  const handleSubmit = (e: React.FormEvent) => {`;

const match = content.match(/const \[date[\s\S]*?const handleSubmit = \(e: React\.FormEvent\) => \{/);
if (match) {
  content = content.replace(match[0], replacement);
}

// Update handleAIParsing
content = content.replace(/setProjectId/g, 'setSelectedProjectId');
content = content.replace(/setProtocolId/g, 'setSelectedProtocolId');
content = content.replace(/setSiteId/g, 'setSelectedSiteId');
content = content.replace(/setCategoryId/g, 'setSelectedCategoryId');
content = content.replace(/setActivityId/g, 'setSelectedActivityId');
content = content.replace(/setSubTaskId/g, 'setSelectedSubTaskId');

// There is one occurrence of currentCategory being calculated below handleSubmit in old code.
// Let's remove it because we calculated it above.
content = content.replace(/  const currentCategory = availableCategories\.find\(c => c\.id === categoryId\);\n/g, '');

fs.writeFileSync(path, content);
console.log("Patched!");
