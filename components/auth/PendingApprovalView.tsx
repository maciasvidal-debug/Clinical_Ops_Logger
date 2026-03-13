"use client";

import React from "react";
import { supabase } from "@/lib/supabase";
import { Activity, Clock, LogOut } from "lucide-react";
import { toast } from "sonner";

export function PendingApprovalView({ email }: { email: string }) {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.info("Signed out");
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden text-center">
        <div className="bg-amber-500 p-8 text-white">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Clock className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Pending Approval</h1>
          <p className="text-amber-50 text-sm mt-1">SiteFlow Clinical Ops Logger</p>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <p className="text-neutral-600">
              Your account (<span className="font-medium text-neutral-900">{email}</span>) has been created successfully.
            </p>
            <p className="text-neutral-500 text-sm">
              A manager needs to approve your access before you can start logging activities. You will be notified once your account is activated.
            </p>
          </div>

          <div className="pt-4">
            <button
              onClick={handleSignOut}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 rounded-xl font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
