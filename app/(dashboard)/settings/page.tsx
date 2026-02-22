"use client";

import { motion } from "framer-motion";
import { Settings, Building2, User, Key, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div className="h-screen overflow-y-auto pb-20 md:pb-0">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center">
              <Settings className="w-5 h-5 text-slate-500" />
            </div>
            <h1 className="text-heading text-slate-800">Settings</h1>
          </div>
        </motion.div>

        <div className="space-y-6">
          {/* FBO Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-4 h-4 text-brand-500" />
              <h2 className="text-subheading text-slate-800">FBO Information</h2>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">
                  FBO Name
                </label>
                <Input defaultValue="SkyHaven FBO" />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">
                  Airport Code
                </label>
                <Input defaultValue="KPDK" />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">
                  Phone
                </label>
                <Input defaultValue="(770) 555-0123" />
              </div>
            </div>
          </motion.div>

          {/* Profile */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-brand-500" />
              <h2 className="text-subheading text-slate-800">Profile</h2>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">
                  Full Name
                </label>
                <Input defaultValue="Sarah Johnson" />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">
                  Email
                </label>
                <Input defaultValue="sarah@skyhaven.com" />
              </div>
            </div>
          </motion.div>

          {/* API Keys */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <Key className="w-4 h-4 text-brand-500" />
              <h2 className="text-subheading text-slate-800">Integrations</h2>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">
                  OpenAI API Key
                </label>
                <Input type="password" placeholder="sk-..." />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">
                  Flight Tracker Pro API Key
                </label>
                <Input type="password" placeholder="ftp_..." />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">
                  Twilio Phone Number
                </label>
                <Input placeholder="+1 (555) 000-0000" />
              </div>
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-4 h-4 text-brand-500" />
              <h2 className="text-subheading text-slate-800">Notifications</h2>
            </div>
            <div className="space-y-3">
              {[
                "Maintenance alerts",
                "Weather warnings",
                "Flight status changes",
                "Daily summary email",
              ].map((item) => (
                <label
                  key={item}
                  className="flex items-center justify-between py-2"
                >
                  <span className="text-small text-slate-600">{item}</span>
                  <div className="w-10 h-6 bg-brand-500 rounded-full relative cursor-pointer">
                    <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm" />
                  </div>
                </label>
              ))}
            </div>
          </motion.div>

          <Button className="w-full">Save Changes</Button>
        </div>
      </div>
    </div>
  );
}
