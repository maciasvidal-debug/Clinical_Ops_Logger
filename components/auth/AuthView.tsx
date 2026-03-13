"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Activity, Loader2, Mail, Lock, User, Briefcase } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { LanguageSelector } from "@/components/layout/LanguageSelector";
import { UserRole } from "@/lib/types";
import { LegalModal } from "./LegalModal";

export function AuthView() {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<UserRole>("cra");

  // Legal modal state
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState<"terms" | "privacy">("terms");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success(t.common.success);
      } else {
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              role: role
            }
          }
        });
        if (error) throw error;
        if (data.user) {
          toast.success("Account created! Please wait for manager approval.");
        }
      }
    } catch (error: unknown) {
      toast.error(t.common.error);
    } finally {
      setLoading(false);
    }
  };

  const openLegalModal = (type: "terms" | "privacy") => {
    setLegalModalType(type);
    setIsLegalModalOpen(true);
  };

  const getLegalContent = () => {
    if (legalModalType === "terms") {
      return {
        title: t.legal.termsTitle,
        content: t.legal.termsContent
      };
    }
    return {
      title: t.legal.privacyTitle,
      content: t.legal.privacyContent
    };
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4 z-40">
        <LanguageSelector />
      </div>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden relative z-10">
        <div className="bg-indigo-600 p-8 text-white text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Activity className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">SiteFlow</h1>
          <p className="text-indigo-100 text-sm mt-1">{t.shell.appSubtitle}</p>
        </div>

        <div className="p-8">
          <h2 className="text-xl font-semibold text-neutral-900 mb-6 text-center">
            {isLogin ? t.auth.signIn : t.auth.createAccount}
          </h2>

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-500 uppercase">{t.auth.firstName.toUpperCase()}</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="John"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-500 uppercase">{t.auth.lastName.toUpperCase()}</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Doe"
                  />
                </div>
              </div>
            )}

            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-500 uppercase">{t.auth.roleTitle.toUpperCase()}</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                  >
                    <option value="cra">CRA</option>
                    <option value="crc">CRC</option>
                    <option value="data_entry">Data Entry</option>
                    <option value="recruitment_specialist">Recruitment Specialist</option>
                    <option value="retention_specialist">Retention Specialist</option>
                    <option value="cta">CTA</option>
                    <option value="ra">RA</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-500 uppercase">{t.auth.email.toUpperCase()}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-500 uppercase">{t.auth.password.toUpperCase()}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-medium transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                isLogin ? t.auth.signIn : t.auth.signUp
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              {isLogin ? t.auth.noAccount : t.auth.haveAccount}
            </button>
          </div>
        </div>
      </div>
      
      <p className="mt-8 text-neutral-400 text-xs text-center max-w-xs relative z-10">
        {t.auth.termsPrefix}
        <button
          onClick={() => openLegalModal("terms")}
          className="hover:underline hover:text-neutral-500 font-medium transition-colors outline-none focus:ring-2 focus:ring-indigo-500 rounded"
        >
          {t.auth.termsLink}
        </button>
        {t.auth.termsAnd}
        <button
          onClick={() => openLegalModal("privacy")}
          className="hover:underline hover:text-neutral-500 font-medium transition-colors outline-none focus:ring-2 focus:ring-indigo-500 rounded"
        >
          {t.auth.privacyLink}
        </button>.
      </p>

      {isLegalModalOpen && (
        <LegalModal
          isOpen={isLegalModalOpen}
          onClose={() => setIsLegalModalOpen(false)}
          title={getLegalContent().title}
          content={getLegalContent().content}
        />
      )}
    </div>
  );
}
