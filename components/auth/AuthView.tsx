"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { localSaveProfile, generateId, initializeDefaultData } from "@/lib/local_db";
import { setSecureItem, getSecureItem } from "@/lib/secure_store";
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
  const { signIn } = useAppStore();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  // Local auth
  const [pin, setPin] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Legal modal state
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState<"terms" | "privacy">("terms");

  // Check if user has an account setup locally
  const [hasLocalAccount, setHasLocalAccount] = useState(false);

  React.useEffect(() => {
    const checkAccount = async () => {
      const storedPin = await getSecureItem("app_pin");
      if (storedPin) {
        setHasLocalAccount(true);
        setIsLogin(true);
      } else {
        setHasLocalAccount(false);
        setIsLogin(false);
      }
    };
    checkAccount();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLogin && !acceptedTerms) {
      toast.error(t.toasts.errorTitle, { description: t.auth.acceptTermsError });
      return;
    }

    if (pin.length < 4) {
      toast.error(t.toasts.errorTitle, { description: "PIN must be at least 4 characters" });
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Verify PIN
        const storedPin = await getSecureItem("app_pin");
        if (storedPin === pin) {
          const profileStr = localStorage.getItem("local_profile_basic");
          if (profileStr) {
            await signIn(JSON.parse(profileStr));
            toast.success(t.toasts.loginSuccessTitle, { description: t.toasts.loginSuccessDesc });
          } else {
            toast.error("Profile data not found. Please clear cache and setup again.");
          }
        } else {
          toast.error(t.toasts.errorTitle, { description: "Invalid PIN" });
        }
      } else {
        // Create account locally
        await setSecureItem("app_pin", pin);

        const newProfile = {
          id: generateId(),
          email: "local@user.com",
          first_name: firstName,
          last_name: lastName,
          role: "super_admin" as UserRole, // Single user is always super_admin
          status: "active" as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        await localSaveProfile(newProfile);
        localStorage.setItem("local_profile_basic", JSON.stringify(newProfile));
        await initializeDefaultData(newProfile);

        await signIn(newProfile);
        toast.success(t.toasts.signupSuccessTitle, { description: "Local account created successfully" });
      }
    } catch (error: unknown) {
      toast.error(t.toasts.errorTitle, { description: t.toasts.errorDesc });
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden relative z-10"
      >
        <div className="bg-indigo-600 p-8 text-white text-center relative">
          <div className="absolute top-4 right-4 z-40">
            <LanguageSelector variant="inverse" />
          </div>
          <div className="flex justify-center relative h-36 w-full">
            <Image
              src="/logo-full.png"
              alt="SiteFlow"
              fill
              priority
              className="object-contain"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          </div>
        </div>

        <div className="p-8">
          <h2 className="text-xl font-semibold text-neutral-900 mb-6 text-center">
            {isLogin ? "Enter PIN" : "Create Account & PIN"}
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

            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-500 uppercase">{"PIN".toUpperCase()}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="password"
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none tracking-widest text-lg font-mono text-center"
                  placeholder="••••"
                  maxLength={6}
                />
              </div>
            </div>


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
                isLogin ? t.auth.signIn : "Create Personal Account"
              )}
            </button>
          </form>

          {!hasLocalAccount && (
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                }}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                {isLogin ? "Setup new personal account" : "I already have a PIN"}
              </button>
            </div>
          )}
          {hasLocalAccount && isLogin && (
            <div className="mt-6 text-center">
               <p className="text-xs text-neutral-500">Welcome back! Enter your PIN to unlock.</p>
            </div>
          )}
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
