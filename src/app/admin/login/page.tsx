"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HardHat, Lock, Mail, AlertCircle, ArrowLeft, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      if (!supabase) {
        throw new Error(
          "Supabase environment variables are pending configuration. Please see README for bootstrap instructions."
        );
      }

      // 1. Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !authData.user) {
        throw new Error(authError?.message || "Invalid email or password credentials.");
      }

      // 2. Verify active admin profile (Section 27: Authenticated alone is NOT enough)
      const { data: profile, error: profileError } = await supabase
        .from("admin_profiles")
        .select("id, role, active")
        .eq("auth_user_id", authData.user.id)
        .eq("active", true)
        .in("role", ["admin", "super_admin"])
        .single();

      if (profileError || !profile) {
        await supabase.auth.signOut();
        throw new Error(
          "Access Denied: This account is authenticated but does not possess an active administrator profile."
        );
      }

      // 3. Authorized -> proceed to dashboard
      router.push("/admin");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("An unexpected authentication error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-poab-navy flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white border border-poab-navy-surface shadow-2xl p-8 sm:p-10">
        {/* Brand Icon & Heading */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-poab-navy text-poab-gold mx-auto flex items-center justify-center mb-4">
            <HardHat className="w-6 h-6" />
          </div>
          <span className="font-heading text-lg font-bold tracking-wider text-poab-navy block">
            POAB GLOBAL
          </span>
          <span className="text-[10px] text-poab-gold uppercase tracking-widest font-semibold block">
            Administrative Management Portal
          </span>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-xs text-red-700 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Administrator Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@poabglobal.com"
          />

          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              className="w-full text-xs uppercase tracking-wider py-4 font-semibold"
              isLoading={isLoading}
            >
              <Lock className="w-3.5 h-3.5 mr-2 text-poab-gold" />
              <span>Sign In to Dashboard</span>
            </Button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-poab-grey-border flex items-center justify-between text-xs text-poab-charcoal/60">
          <Link
            href="/"
            className="hover:text-poab-navy flex items-center space-x-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Site</span>
          </Link>
          <span className="flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-poab-gold" />
            <span>RBAC Protected</span>
          </span>
        </div>
      </div>
    </div>
  );
}
