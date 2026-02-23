"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  Plane,
  GraduationCap,
  Eye,
  Star,
  X,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type CustomerStage =
  | "lead"
  | "discovery"
  | "student"
  | "private_pilot"
  | "renter"
  | "inactive";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  stage: CustomerStage;
  total_flights: number;
  total_revenue: number;
  last_flight: string;
  notes: string;
  created_at: string;
}

const stageConfig: Record<
  CustomerStage,
  { label: string; color: string; bg: string; border: string }
> = {
  lead: { label: "Lead", color: "text-zinc-400", bg: "bg-white/[0.03]", border: "border-white/[0.06]" },
  discovery: {
    label: "Discovery",
    color: "text-amber-400",
    bg: "bg-amber-500/15",
    border: "border-amber-200",
  },
  student: {
    label: "Student",
    color: "text-brand-400",
    bg: "bg-brand-500/20",
    border: "border-brand-500/20",
  },
  private_pilot: {
    label: "Private Pilot",
    color: "text-emerald-400",
    bg: "bg-emerald-500/15",
    border: "border-emerald-200",
  },
  renter: { label: "Renter", color: "text-sky-600", bg: "bg-sky-50", border: "border-sky-200" },
  inactive: {
    label: "Inactive",
    color: "text-zinc-500",
    bg: "bg-white/[0.03]",
    border: "border-white/[0.06]",
  },
};

const mockCustomers: Customer[] = [
  {
    id: "c-1",
    name: "John Smith",
    email: "john@email.com",
    phone: "+1 (555) 123-4567",
    stage: "student",
    total_flights: 24,
    total_revenue: 7200,
    last_flight: "2 days ago",
    notes: "Working on cross-country endorsement. Needs 3 more hours XC PIC time.",
    created_at: "2024-08-15",
  },
  {
    id: "c-2",
    name: "Sarah Lee",
    email: "sarah@email.com",
    phone: "+1 (555) 987-6543",
    stage: "renter",
    total_flights: 45,
    total_revenue: 15800,
    last_flight: "5 days ago",
    notes: "Checked out in N12345 and N67890. Prefers weekend mornings.",
    created_at: "2023-11-20",
  },
  {
    id: "c-3",
    name: "Mike Chen",
    email: "mike@email.com",
    phone: "+1 (555) 555-1234",
    stage: "student",
    total_flights: 12,
    total_revenue: 3600,
    last_flight: "1 week ago",
    notes: "Pre-solo stage. Good stick skills, needs to work on radio comms.",
    created_at: "2024-10-01",
  },
  {
    id: "c-4",
    name: "Emily Davis",
    email: "emily@email.com",
    phone: "+1 (555) 444-5678",
    stage: "discovery",
    total_flights: 1,
    total_revenue: 245,
    last_flight: "3 weeks ago",
    notes: "Loved discovery flight. Follow up about flight training program.",
    created_at: "2025-01-15",
  },
  {
    id: "c-5",
    name: "Alex Johnson",
    email: "alex@email.com",
    phone: "+1 (555) 222-3333",
    stage: "lead",
    total_flights: 0,
    total_revenue: 0,
    last_flight: "Never",
    notes: "Inquired via website about discovery flights. Birthday gift for spouse.",
    created_at: "2025-02-10",
  },
  {
    id: "c-6",
    name: "Lisa Wang",
    email: "lisa@email.com",
    phone: "+1 (555) 666-7777",
    stage: "private_pilot",
    total_flights: 68,
    total_revenue: 24500,
    last_flight: "1 day ago",
    notes: "PPL earned Oct 2024. Working on instrument rating. Very consistent student.",
    created_at: "2023-06-10",
  },
  {
    id: "c-7",
    name: "David Park",
    email: "david@email.com",
    phone: "+1 (555) 888-9999",
    stage: "renter",
    total_flights: 32,
    total_revenue: 11200,
    last_flight: "Today",
    notes: "Regular weekend renter. Checked out in all fleet aircraft including R44.",
    created_at: "2023-09-01",
  },
  {
    id: "c-8",
    name: "Rachel Kim",
    email: "rachel@email.com",
    phone: "+1 (555) 111-2222",
    stage: "inactive",
    total_flights: 8,
    total_revenue: 2400,
    last_flight: "2 months ago",
    notes: "Was a student, paused for work travel. Re-engage when schedule clears.",
    created_at: "2024-05-20",
  },
];

const stages: CustomerStage[] = [
  "lead",
  "discovery",
  "student",
  "private_pilot",
  "renter",
  "inactive",
];

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<CustomerStage | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    phone: "",
    stage: "lead" as CustomerStage,
    notes: "",
  });

  const filtered = customers.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchStage = stageFilter === "all" || c.stage === stageFilter;
    return matchSearch && matchStage;
  });

  const totalRevenue = customers.reduce((sum, c) => sum + c.total_revenue, 0);

  const handleAdd = () => {
    if (!addForm.name) return;
    setCustomers((prev) => [
      ...prev,
      {
        ...addForm,
        id: `c-${Date.now()}`,
        total_flights: 0,
        total_revenue: 0,
        last_flight: "Never",
        created_at: new Date().toISOString().split("T")[0],
      },
    ]);
    setAddForm({ name: "", email: "", phone: "", stage: "lead", notes: "" });
    setShowAdd(false);
  };

  const updateStage = (id: string, newStage: CustomerStage) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, stage: newStage } : c))
    );
  };

  return (
    <div className="h-screen overflow-y-auto pb-20 md:pb-0">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-200 flex items-center justify-center">
                <Users className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h1 className="text-heading text-zinc-100">Customers</h1>
                <p className="text-small text-zinc-400">
                  {customers.length} total &bull; ${totalRevenue.toLocaleString()} lifetime revenue
                </p>
              </div>
            </div>
            <Button onClick={() => setShowAdd(!showAdd)} className="gap-2">
              {showAdd ? (
                <>
                  <X className="w-4 h-4" /> Cancel
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Add Customer
                </>
              )}
            </Button>
          </div>

          {/* Pipeline stats */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {stages.map((stage) => {
              const count = customers.filter((c) => c.stage === stage).length;
              const cfg = stageConfig[stage];
              return (
                <button
                  key={stage}
                  onClick={() =>
                    setStageFilter(stageFilter === stage ? "all" : stage)
                  }
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all whitespace-nowrap ${
                    stageFilter === stage
                      ? `${cfg.bg} ${cfg.border} ${cfg.color}`
                      : "bg-white/[0.04] backdrop-blur-xl border-white/[0.06] text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <span className="text-xs font-medium">{cfg.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded ${
                      stageFilter === stage
                        ? `${cfg.bg} ${cfg.color}`
                        : "bg-white/[0.06] text-zinc-500"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Add form */}
        <AnimatePresence>
          {showAdd && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-zinc-100 mb-4">
                  Add New Customer
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-400">Name *</label>
                    <Input
                      placeholder="Full name"
                      value={addForm.name}
                      onChange={(e) =>
                        setAddForm({ ...addForm, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-400">Email</label>
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      value={addForm.email}
                      onChange={(e) =>
                        setAddForm({ ...addForm, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-400">Phone</label>
                    <Input
                      placeholder="+1 (555) 000-0000"
                      value={addForm.phone}
                      onChange={(e) =>
                        setAddForm({ ...addForm, phone: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-400">Stage</label>
                    <select
                      value={addForm.stage}
                      onChange={(e) =>
                        setAddForm({
                          ...addForm,
                          stage: e.target.value as CustomerStage,
                        })
                      }
                      className="w-full bg-white/[0.04] border border-white/[0.08] text-zinc-100 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-brand-500/30 rounded-xl px-3 py-2.5 text-sm"
                    >
                      {stages.map((s) => (
                        <option key={s} value={s}>
                          {stageConfig[s].label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs text-zinc-400">Notes</label>
                    <Input
                      placeholder="How did they find you? Any preferences?"
                      value={addForm.notes}
                      onChange={(e) =>
                        setAddForm({ ...addForm, notes: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={handleAdd}
                    disabled={!addForm.name}
                    className="gap-2"
                  >
                    <Save className="w-4 h-4" /> Add Customer
                  </Button>
                  <Button variant="ghost" onClick={() => setShowAdd(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/[0.08] text-zinc-100 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-brand-500/30 rounded-xl pl-10 pr-4 py-2.5 text-sm"
          />
        </div>

        {/* Customer list */}
        <div className="space-y-2">
          {filtered.map((customer, i) => {
            const cfg = stageConfig[customer.stage];
            const isSelected = selectedId === customer.id;

            return (
              <motion.div
                key={customer.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() =>
                  setSelectedId(isSelected ? null : customer.id)
                }
                className={`bg-white/[0.04] backdrop-blur-xl border rounded-2xl p-4 cursor-pointer transition-all ${
                  isSelected
                    ? "border-brand-300 ring-1 ring-brand-200"
                    : "border-white/[0.06] hover:border-zinc-600"
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/[0.06] flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-zinc-400">
                      {customer.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-zinc-100 truncate">
                        {customer.name}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-medium border ${cfg.bg} ${cfg.color} ${cfg.border}`}
                      >
                        {cfg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-[11px] text-zinc-400">
                      <span>{customer.email}</span>
                      <span>&bull;</span>
                      <span>Last flight: {customer.last_flight}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="hidden md:flex items-center gap-6 flex-shrink-0">
                    <div className="text-right">
                      <p className="font-mono text-xs text-zinc-200">
                        {customer.total_flights}
                      </p>
                      <p className="text-[10px] text-zinc-500">flights</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-xs text-emerald-400">
                        ${customer.total_revenue.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-zinc-500">revenue</p>
                    </div>
                  </div>
                </div>

                {/* Expanded */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 pt-3 border-t border-white/[0.06]">
                        {/* Contact */}
                        <div className="flex items-center gap-4 mb-3">
                          <a
                            href={`mailto:${customer.email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-xs text-zinc-400 hover:text-zinc-200 transition-all"
                          >
                            <Mail className="w-3 h-3" />
                            Email
                          </a>
                          <a
                            href={`tel:${customer.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-xs text-zinc-400 hover:text-zinc-200 transition-all"
                          >
                            <Phone className="w-3 h-3" />
                            Call
                          </a>
                        </div>

                        {/* Notes */}
                        {customer.notes && (
                          <div className="p-2.5 bg-white/[0.03] border border-white/[0.06] rounded-lg mb-3">
                            <p className="text-xs text-zinc-300">
                              {customer.notes}
                            </p>
                          </div>
                        )}

                        {/* Stage update */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] text-zinc-500 mr-1">
                            Move to:
                          </span>
                          {stages
                            .filter((s) => s !== customer.stage)
                            .map((s) => (
                              <button
                                key={s}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateStage(customer.id, s);
                                }}
                                className={`text-[10px] px-2 py-1 rounded border ${stageConfig[s].bg} ${stageConfig[s].color} ${stageConfig[s].border} hover:opacity-80 transition-all`}
                              >
                                {stageConfig[s].label}
                              </button>
                            ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-sm text-zinc-400">No customers found</p>
          </div>
        )}
      </div>
    </div>
  );
}
