"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Activity, Loader2, Mail, Lock, User, Briefcase, KeyRound } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { LanguageSelector } from "@/components/layout/LanguageSelector";
import { UserRole } from "@/lib/types";
import { LegalModal } from "./LegalModal";
import { TermsAndPrivacyContent } from "@/components/legal/TermsAndPrivacyContent";

type LoginMode = "password" | "otp_request" | "otp_verify";

export function AuthView() {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [loginMode, setLoginMode] = useState<LoginMode>("password");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<UserRole>("cra");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Legal modal state
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState<"terms" | "privacy">("terms");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLogin && !acceptedTerms) {
      toast.error(t.toasts.errorTitle, { description: t.auth.acceptTermsError });
      return;
    }
    setLoading(true);

    try {
      if (isLogin) {
        if (loginMode === "password") {
          const { error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;
          toast.success(t.toasts.loginSuccessTitle, { description: t.toasts.loginSuccessDesc });
        } else if (loginMode === "otp_request") {
          const { error } = await supabase.auth.signInWithOtp({
            email,
            options: { shouldCreateUser: false }
          });
          if (error) throw error;
          setLoginMode("otp_verify");
          toast.success(t.toasts.otpSentTitle, { description: t.toasts.otpSentDesc });
        } else if (loginMode === "otp_verify") {
          const { error } = await supabase.auth.verifyOtp({ email, token: otpCode, type: 'email' });
          if (error) throw error;
          toast.success(t.toasts.otpVerifiedTitle, { description: t.toasts.otpVerifiedDesc });
        }
      } else {
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              role: role,
              terms_accepted_at: new Date().toISOString(),
              terms_version: "2026-03-18"
            }
          }
        });
        if (error) throw error;
        if (data.user) {
          toast.success(t.toasts.signupSuccessTitle, { description: t.toasts.signupSuccessDesc });
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(t.toasts.errorTitle, { description: error.message || t.toasts.errorDesc });
      } else {
        toast.error(t.toasts.errorTitle, { description: t.toasts.errorDesc });
      }
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
        content: <TermsAndPrivacyContent />
      };
    }
    return {
      title: t.legal.privacyTitle,
      content: <TermsAndPrivacyContent />
    };
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 right-4 z-40">
        <LanguageSelector />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden relative z-10"
      >
        <div className="bg-indigo-600 p-8 text-white text-center">
          <div className="flex justify-center">
            <img
              src="/logo-full.png"
              alt="SiteFlow"
              className="h-36 w-auto object-contain"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          </div>
        </div>

        <div className="p-8">
          <h2 className="text-xl font-semibold text-neutral-900 mb-6 text-center">
            {isLogin ? (loginMode === "otp_verify" ? t.auth.verifyOtp : t.auth.signIn) : t.auth.createAccount}
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
                      placeholder={t.auth.firstName}
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
                    <option value="cra">{t.roles.cra}</option>
                    <option value="crc">{t.roles.crc}</option>
                    <option value="data_entry">{t.roles.data_entry}</option>
                    <option value="recruitment_specialist">{t.roles.recruitment_specialist}</option>
                    <option value="retention_specialist">{t.roles.retention_specialist}</option>
                    <option value="cta">{t.roles.cta}</option>
                    <option value="ra">{t.roles.ra}</option>
                    <option value="manager">{t.roles.manager}</option>
                  </select>
                </div>
              </div>
            )}

            {(!isLogin || loginMode !== "otp_verify") && (
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
            )}

            {isLogin && loginMode === "otp_verify" && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-500 uppercase">{t.auth.otpCode.toUpperCase()}</label>
                <p className="text-sm text-neutral-600 mb-2">{t.auth.checkEmailForOtp}</p>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-center tracking-widest font-mono text-lg"
                    placeholder={t.auth.otpPlaceholder}
                    maxLength={6}
                  />
                </div>
              </div>
            )}

            {(!isLogin || loginMode === "password") && (
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
            )}


            {!isLogin && (
              <div className="flex items-start mb-4">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 bg-neutral-50 border-neutral-300 rounded focus:ring-indigo-500 cursor-pointer"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="font-medium text-neutral-700 cursor-pointer">
                    {t.auth.acceptTermsLabel}
                  </label>
                  <span className="font-medium text-neutral-700">
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); openLegalModal("terms"); }}
                      className="text-indigo-600 hover:underline outline-none focus:ring-2 focus:ring-indigo-500 rounded"
                    >
                      {t.auth.termsLink}
                    </button>
                    {t.auth.termsAnd}
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); openLegalModal("privacy"); }}
                      className="text-indigo-600 hover:underline outline-none focus:ring-2 focus:ring-indigo-500 rounded"
                    >
                      {t.auth.privacyLink}
                    </button>
                  </span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-medium transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                isLogin
                  ? (loginMode === "password" ? t.auth.signIn : (loginMode === "otp_request" ? t.auth.sendOtp : t.auth.verifyOtp))
                  : t.auth.signUp
              )}
            </button>
          </form>

          {isLogin && (
            <div className="mt-4 flex flex-col space-y-2">
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-neutral-200"></div>
                <span className="flex-shrink-0 mx-4 text-neutral-400 text-xs uppercase">{t.common.or}</span>
                <div className="flex-grow border-t border-neutral-200"></div>
              </div>

              {loginMode === "password" ? (
                <button
                  type="button"
                  onClick={() => setLoginMode("otp_request")}
                  className="w-full bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 py-2.5 rounded-xl font-medium transition-colors shadow-sm flex items-center justify-center gap-2 text-sm"
                >
                  <Mail className="w-4 h-4" />
                  {t.auth.useOtp}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setLoginMode("password")}
                  className="w-full bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 py-2.5 rounded-xl font-medium transition-colors shadow-sm flex items-center justify-center gap-2 text-sm"
                >
                  <Lock className="w-4 h-4" />
                  {t.auth.usePassword}
                </button>
              )}
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setLoginMode("password");
              }}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              {isLogin ? t.auth.noAccount : t.auth.haveAccount}
            </button>
          </div>
        </div>
      </motion.div>
      
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
