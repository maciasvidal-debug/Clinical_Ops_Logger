import React, { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { useTranslation, Language } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

const languages: { code: Language; name: string }[] = [
  { code: "en", name: "English" },
  { code: "es", name: "Español (LATAM)" },
  { code: "pt", name: "Português" },
];

export function LanguageSelector() {
  const { language, setLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-full hover:bg-neutral-100 transition-colors text-neutral-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        aria-label="Select Language"
      >
        <Globe className="w-5 h-5" />
        <span className="text-sm font-medium hidden sm:inline-block uppercase">
          {language}
        </span>
        <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen ? "rotate-180" : "")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-neutral-100 overflow-hidden z-50 origin-top-right"
          >
            <div className="py-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-2 text-sm text-left transition-colors",
                    language === lang.code
                      ? "bg-indigo-50/50 text-indigo-700 font-medium"
                      : "text-neutral-700 hover:bg-neutral-50"
                  )}
                >
                  {lang.name}
                  {language === lang.code && <Check className="w-4 h-4 text-indigo-600" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
