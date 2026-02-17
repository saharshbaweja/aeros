"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plane, ArrowRight, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Demo: just redirect to dashboard
    setTimeout(() => {
      router.push("/");
      setIsLoading(false);
    }, 800);
  };

  const handleMagicLink = () => {
    // Demo: just redirect
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-500/20 border border-brand-500/30 mb-4"
          >
            <Plane className="w-8 h-8 text-brand-400" />
          </motion.div>
          <h1 className="text-display text-white mb-2">Aeros</h1>
          <p className="text-body text-gray-400">
            AI Copilot for Aviation Operations
          </p>
        </div>

        {/* Login form */}
        <div className="bg-surface-200 border border-surface-400 rounded-2xl p-6 space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-small text-gray-400 font-medium">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  type="email"
                  placeholder="you@fbo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-small text-gray-400 font-medium">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-400" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-surface-200 px-2 text-gray-500">or</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleMagicLink}
          >
            <Mail className="w-4 h-4 mr-2" />
            Sign in with Magic Link
          </Button>
        </div>

        <p className="text-center text-small text-gray-500 mt-6">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-brand-400 hover:text-brand-300 transition-colors"
          >
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
