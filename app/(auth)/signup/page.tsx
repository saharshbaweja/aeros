"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plane, ArrowRight, Mail, Lock, User, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    fboName: "",
    fullName: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      router.push("/");
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-500/20 border border-brand-500/30 mb-4"
          >
            <Plane className="w-8 h-8 text-brand-400" />
          </motion.div>
          <h1 className="text-display text-white mb-2">Get Started</h1>
          <p className="text-body text-gray-400">
            Set up your FBO in under 2 minutes
          </p>
        </div>

        <div className="bg-surface-200 border border-surface-400 rounded-2xl p-6">
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <label className="text-small text-gray-400 font-medium">
                FBO Name
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  placeholder="SkyHaven FBO"
                  value={formData.fboName}
                  onChange={(e) =>
                    setFormData({ ...formData, fboName: e.target.value })
                  }
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-small text-gray-400 font-medium">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  placeholder="Sarah Johnson"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-small text-gray-400 font-medium">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  type="email"
                  placeholder="sarah@skyhaven.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
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
                  placeholder="At least 8 characters"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
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
                  Create Account
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-small text-gray-500 mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-brand-400 hover:text-brand-300 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
