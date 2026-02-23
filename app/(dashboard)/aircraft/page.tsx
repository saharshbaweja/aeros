"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlaneTakeoff,
  Plus,
  Edit3,
  Trash2,
  X,
  Check,
  Radio,
  Wrench,
  UserPlus,
  User,
} from "lucide-react";
import { mockAircraft } from "@/lib/mock-data";
import { Aircraft, AircraftCategory, AircraftStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PilotAssignment {
  name: string;
  role: string;
}

export default function AircraftPage() {
  const [fleet, setFleet] = useState<Aircraft[]>(mockAircraft);
  const [pilots, setPilots] = useState<Record<string, PilotAssignment[]>>({
    "ac-1": [{ name: "Capt. Mike Reynolds", role: "Primary CFI" }],
    "ac-2": [{ name: "James Torres", role: "Renter Pilot" }],
    "ac-4": [{ name: "Sarah Chen", role: "Chief Pilot" }],
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingPilotTo, setAddingPilotTo] = useState<string | null>(null);
  const [newPilotName, setNewPilotName] = useState("");
  const [newPilotRole, setNewPilotRole] = useState("");
  const [form, setForm] = useState({
    tail_number: "",
    make: "",
    model: "",
    category: "airplane" as AircraftCategory,
    status: "available" as AircraftStatus,
    total_flight_hours: 0,
    icao24_hex: "",
    adsb_enabled: true,
  });

  const resetForm = () => {
    setForm({
      tail_number: "",
      make: "",
      model: "",
      category: "airplane",
      status: "available",
      total_flight_hours: 0,
      icao24_hex: "",
      adsb_enabled: true,
    });
  };

  const handleAdd = () => {
    if (!form.tail_number || !form.make || !form.model) return;

    const newAc: Aircraft = {
      id: `ac-${Date.now()}`,
      fbo_id: "fbo-1",
      tail_number: form.tail_number.toUpperCase(),
      make: form.make,
      model: form.model,
      category: form.category,
      total_flight_hours: form.total_flight_hours,
      status: form.status,
      last_oil_change_hours: form.total_flight_hours - 30,
      last_100hr_inspection_hours: form.total_flight_hours - 80,
      last_annual_inspection_hours: form.total_flight_hours - 300,
      icao24_hex: form.icao24_hex || undefined,
      adsb_enabled: form.adsb_enabled,
      created_at: new Date().toISOString(),
    };

    setFleet((prev) => [...prev, newAc]);
    resetForm();
    setShowAddForm(false);
  };

  const handleEdit = (id: string) => {
    const ac = fleet.find((a) => a.id === id);
    if (!ac) return;
    setForm({
      tail_number: ac.tail_number,
      make: ac.make,
      model: ac.model,
      category: ac.category,
      status: ac.status,
      total_flight_hours: ac.total_flight_hours,
      icao24_hex: ac.icao24_hex || "",
      adsb_enabled: ac.adsb_enabled,
    });
    setEditingId(id);
    setShowAddForm(true);
  };

  const handleUpdate = () => {
    if (!editingId || !form.tail_number || !form.make || !form.model) return;
    setFleet((prev) =>
      prev.map((ac) =>
        ac.id === editingId
          ? {
              ...ac,
              tail_number: form.tail_number.toUpperCase(),
              make: form.make,
              model: form.model,
              category: form.category,
              status: form.status,
              total_flight_hours: form.total_flight_hours,
              icao24_hex: form.icao24_hex || undefined,
              adsb_enabled: form.adsb_enabled,
            }
          : ac
      )
    );
    resetForm();
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleDelete = (id: string) => {
    setFleet((prev) => prev.filter((a) => a.id !== id));
    const newPilots = { ...pilots };
    delete newPilots[id];
    setPilots(newPilots);
  };

  const handleAddPilot = (acId: string) => {
    if (!newPilotName.trim()) return;
    setPilots((prev) => ({
      ...prev,
      [acId]: [...(prev[acId] || []), { name: newPilotName.trim(), role: newPilotRole.trim() || "Pilot" }],
    }));
    setNewPilotName("");
    setNewPilotRole("");
    setAddingPilotTo(null);
  };

  const handleRemovePilot = (acId: string, pilotIdx: number) => {
    setPilots((prev) => ({
      ...prev,
      [acId]: (prev[acId] || []).filter((_, i) => i !== pilotIdx),
    }));
  };

  const statusVariant = (s: string) =>
    s === "available" ? "success" : s === "flying" ? "info" : "danger";

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="max-w-xl mx-auto px-4 sm:px-6 py-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-6"
          >
            <div>
              <h1 className="text-heading text-zinc-100">Fleet Management</h1>
              <p className="text-small text-zinc-400">
                {fleet.length} aircraft &bull; Add by tail number &bull; Assign pilots
              </p>
            </div>
            <Button
              onClick={() => {
                resetForm();
                setEditingId(null);
                setShowAddForm(!showAddForm);
              }}
              size="sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Aircraft
            </Button>
          </motion.div>

          {/* Add/Edit form */}
          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-zinc-100">
                      {editingId ? "Edit Aircraft" : "Add New Aircraft"}
                    </h3>
                    <button
                      onClick={() => { setShowAddForm(false); setEditingId(null); resetForm(); }}
                      className="text-zinc-500 hover:text-zinc-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-xs text-zinc-400 mb-1 block">Tail Number *</label>
                      <input
                        value={form.tail_number}
                        onChange={(e) => setForm({ ...form, tail_number: e.target.value })}
                        placeholder="N12345"
                        className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-brand-500/30 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-400 mb-1 block">ICAO24 Hex</label>
                      <input
                        value={form.icao24_hex}
                        onChange={(e) => setForm({ ...form, icao24_hex: e.target.value })}
                        placeholder="A12345"
                        className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-brand-500/30 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-xs text-zinc-400 mb-1 block">Make *</label>
                      <input
                        value={form.make}
                        onChange={(e) => setForm({ ...form, make: e.target.value })}
                        placeholder="Cessna"
                        className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-brand-500/30"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-400 mb-1 block">Model *</label>
                      <input
                        value={form.model}
                        onChange={(e) => setForm({ ...form, model: e.target.value })}
                        placeholder="172S Skyhawk"
                        className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-brand-500/30"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div>
                      <label className="text-xs text-zinc-400 mb-1 block">Category</label>
                      <select
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value as AircraftCategory })}
                        className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-brand-500/30"
                      >
                        <option value="airplane">Airplane</option>
                        <option value="helicopter">Helicopter</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-zinc-400 mb-1 block">Status</label>
                      <select
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value as AircraftStatus })}
                        className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-brand-500/30"
                      >
                        <option value="available">Available</option>
                        <option value="flying">Flying</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-zinc-400 mb-1 block">Total Hours</label>
                      <input
                        type="number"
                        value={form.total_flight_hours}
                        onChange={(e) => setForm({ ...form, total_flight_hours: Number(e.target.value) })}
                        className="w-full h-9 px-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-brand-500/30 font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      checked={form.adsb_enabled}
                      onChange={(e) => setForm({ ...form, adsb_enabled: e.target.checked })}
                      className="rounded border-white/[0.08]"
                    />
                    <label className="text-xs text-zinc-300">ADS-B Out enabled</label>
                  </div>

                  <Button
                    onClick={editingId ? handleUpdate : handleAdd}
                    disabled={!form.tail_number || !form.make || !form.model}
                    className="w-full"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    {editingId ? "Update Aircraft" : "Add to Fleet"}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Fleet list */}
          <div className="space-y-3">
            {fleet.map((ac, idx) => (
              <motion.div
                key={ac.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] rounded-2xl overflow-hidden"
              >
                {/* Aircraft header */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        ac.status === "available" ? "bg-emerald-400" : ac.status === "flying" ? "bg-sky-400 animate-pulse" : "bg-rose-400"
                      }`} />
                      <span className="font-mono text-base font-bold text-zinc-100">{ac.tail_number}</span>
                      <Badge variant={statusVariant(ac.status)}>{ac.status}</Badge>
                      {ac.adsb_enabled && (
                        <span className="flex items-center gap-1 text-[10px] text-sky-400 bg-sky-500/15 px-1.5 py-0.5 rounded border border-sky-500/20">
                          <Radio className="w-2.5 h-2.5" />
                          ADS-B
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(ac.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-brand-400 hover:bg-brand-500/20 transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(ac.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-rose-500 hover:bg-rose-500/15 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-zinc-400">
                    <span>{ac.make} {ac.model}</span>
                    <span className="font-mono">{ac.total_flight_hours.toLocaleString()} hrs</span>
                    {ac.icao24_hex && <span className="font-mono text-zinc-500">ICAO: {ac.icao24_hex}</span>}
                  </div>

                  {/* Maintenance */}
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center gap-1 text-[10px]">
                      <Wrench className="w-3 h-3 text-zinc-500" />
                      <span className="text-zinc-400">
                        Oil: {ac.total_flight_hours - ac.last_oil_change_hours > 40
                          ? <span className="text-amber-500 font-medium">{50 - (ac.total_flight_hours - ac.last_oil_change_hours)}hrs left</span>
                          : <span className="text-emerald-500">{50 - (ac.total_flight_hours - ac.last_oil_change_hours)}hrs</span>
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px]">
                      <span className="text-zinc-400">
                        100hr: {100 - (ac.total_flight_hours - ac.last_100hr_inspection_hours)}hrs
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pilot assignments */}
                <div className="border-t border-white/[0.04] bg-white/[0.03] px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                      Assigned Pilots
                    </span>
                    <button
                      onClick={() => {
                        setAddingPilotTo(addingPilotTo === ac.id ? null : ac.id);
                        setNewPilotName("");
                        setNewPilotRole("");
                      }}
                      className="flex items-center gap-1 text-[10px] text-brand-400 hover:text-brand-300 transition-colors"
                    >
                      <UserPlus className="w-3 h-3" />
                      Add Pilot
                    </button>
                  </div>

                  {(pilots[ac.id] || []).length === 0 && addingPilotTo !== ac.id && (
                    <p className="text-[11px] text-zinc-500 italic">No pilots assigned</p>
                  )}

                  <div className="space-y-1.5">
                    {(pilots[ac.id] || []).map((pilot, pi) => (
                      <div key={pi} className="flex items-center justify-between bg-white/[0.04] backdrop-blur-xl rounded-lg px-3 py-2 border border-white/[0.04]">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-zinc-500" />
                          <div>
                            <span className="text-xs font-medium text-zinc-200">{pilot.name}</span>
                            <span className="text-[10px] text-zinc-500 ml-2">{pilot.role}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemovePilot(ac.id, pi)}
                          className="text-zinc-600 hover:text-rose-500 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add pilot inline form */}
                  <AnimatePresence>
                    {addingPilotTo === ac.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 overflow-hidden"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            value={newPilotName}
                            onChange={(e) => setNewPilotName(e.target.value)}
                            placeholder="Pilot name"
                            className="flex-1 h-8 px-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-zinc-100 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-brand-500/30"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleAddPilot(ac.id);
                              if (e.key === "Escape") setAddingPilotTo(null);
                            }}
                          />
                          <input
                            value={newPilotRole}
                            onChange={(e) => setNewPilotRole(e.target.value)}
                            placeholder="Role (CFI, Renter...)"
                            className="w-28 h-8 px-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-zinc-100 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-brand-500/30"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleAddPilot(ac.id);
                              if (e.key === "Escape") setAddingPilotTo(null);
                            }}
                          />
                          <button
                            onClick={() => handleAddPilot(ac.id)}
                            disabled={!newPilotName.trim()}
                            className="w-8 h-8 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:opacity-30 flex items-center justify-center transition-all"
                          >
                            <Check className="w-3.5 h-3.5 text-white" />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
