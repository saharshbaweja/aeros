"use client";

import { motion } from "framer-motion";
import { Check, DollarSign, Zap, Shield, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Starter",
    description: "For small FBOs getting started",
    price: 99,
    interval: "mo",
    highlight: false,
    features: [
      "Up to 5 aircraft",
      "50 flights/month",
      "AI Copilot (basic)",
      "Flight scheduling",
      "Weather briefings",
      "Email support",
    ],
  },
  {
    name: "Professional",
    description: "For growing flight schools & FBOs",
    price: 249,
    interval: "mo",
    highlight: true,
    features: [
      "Up to 20 aircraft",
      "Unlimited flights",
      "AI Copilot (advanced)",
      "Live ADS-B flight tracking",
      "Maintenance alerts & tracking",
      "SMS notifications (Twilio)",
      "Custom reports & analytics",
      "Priority support",
    ],
  },
  {
    name: "Enterprise",
    description: "For large operations & chains",
    price: null,
    interval: null,
    highlight: false,
    features: [
      "Unlimited aircraft & flights",
      "AI Copilot (full suite)",
      "Multi-location support",
      "API access & integrations",
      "Custom AI training on your data",
      "SSO & advanced security",
      "Dedicated account manager",
      "24/7 phone support",
      "Custom onboarding",
    ],
  },
];

const addOns = [
  {
    name: "ADS-B Live Tracking",
    price: 49,
    description: "Real-time aircraft position tracking on interactive maps",
  },
  {
    name: "SMS Notifications",
    price: 29,
    description: "Automated customer & pilot SMS via Twilio integration",
  },
  {
    name: "Advanced Analytics",
    price: 39,
    description: "Revenue forecasting, utilization reports, and trend analysis",
  },
];

export default function PricingPage() {
  return (
    <div className="h-screen overflow-y-auto pb-20 md:pb-0">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-brand-400" />
            </div>
          </div>
          <h1 className="text-display text-white mb-3">
            Simple, transparent pricing
          </h1>
          <p className="text-body text-gray-400 max-w-lg mx-auto">
            Choose the plan that fits your operation. All plans include a 14-day
            free trial with no credit card required.
          </p>
        </motion.div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className={`relative rounded-2xl p-6 ${
                plan.highlight
                  ? "bg-white/[0.08] border-2 border-brand-500/30 shadow-lg shadow-brand-500/10"
                  : "bg-white/[0.04] backdrop-blur-xl border border-white/[0.06]"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-brand-500 text-white text-xs font-semibold rounded-full">
                  Most Popular
                </div>
              )}

              <h3 className="text-subheading text-white mb-1">{plan.name}</h3>
              <p className="text-small text-gray-500 mb-4">
                {plan.description}
              </p>

              <div className="mb-6">
                {plan.price !== null ? (
                  <div className="flex items-baseline gap-1">
                    <span className="text-display text-white font-mono">
                      ${plan.price}
                    </span>
                    <span className="text-small text-gray-500">
                      /{plan.interval}
                    </span>
                  </div>
                ) : (
                  <div className="text-display text-white">Custom</div>
                )}
              </div>

              <Button
                className={`w-full mb-6 ${
                  plan.highlight ? "" : "bg-surface-300 hover:bg-surface-400"
                }`}
                variant={plan.highlight ? "default" : "outline"}
              >
                {plan.price !== null ? "Start free trial" : "Contact sales"}
              </Button>

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-small"
                  >
                    <Check
                      className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                        plan.highlight ? "text-brand-400" : "text-emerald-400"
                      }`}
                    />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Add-ons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-heading text-white mb-6 text-center">Add-ons</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {addOns.map((addon, i) => (
              <div
                key={addon.name}
                className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] rounded-xl p-5"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-white">
                    {addon.name}
                  </h4>
                  <span className="text-sm font-mono text-brand-400">
                    +${addon.price}/mo
                  </span>
                </div>
                <p className="text-small text-gray-500">{addon.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bottom section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-8 text-center"
        >
          <div className="flex items-center justify-center gap-8 mb-6">
            <div className="flex items-center gap-2 text-small text-gray-400">
              <Zap className="w-4 h-4 text-amber-400" />
              14-day free trial
            </div>
            <div className="flex items-center gap-2 text-small text-gray-400">
              <Shield className="w-4 h-4 text-emerald-400" />
              No credit card required
            </div>
            <div className="flex items-center gap-2 text-small text-gray-400">
              <Headphones className="w-4 h-4 text-cyan-400" />
              Cancel anytime
            </div>
          </div>
          <p className="text-small text-gray-500">
            Questions? Email us at{" "}
            <span className="text-brand-400">sales@aeros.ai</span> or chat with
            our AI copilot.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
