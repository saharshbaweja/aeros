"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlaneTakeoff,
  Wrench,
  Clock,
  Gauge,
  Plus,
  X,
  Pencil,
  Trash2,
  Radio,
  Users,
  Save,
} from "lucide-react";
import { mockAircraft } from "@/lib/mock-data";
import { getStatusDot } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Aircraft, AircraftCategory, AircraftStatus } from "@/types";

const statusBadge = {
  available: "success",
  flying: "info",
  maintenance: "danger",
} as const;

const emptyAircraft = {
  tail_number: "",
  make: "",
  model: "",
  category: "airplane" as AircraftCategory,
  total_flight_hours: 0,
  status: "available" as AircraftStatus,
  last_oil_change_hours: 0,
  last_100hr_inspection_hours: 0,
  last_annual_inspection_hours: 0,
  icao24_hex: "",
  adsb_enabled: true,
  assigned_pilot: "",
  notes: "",
};

export default function AircraftPage() {
  const [fleet, setFleet] = useState<Aircraft[]>(mockAircraft);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyAircraft);
  const [assignments, setAssignments] = useState<
    Record<string, { pilot: string; notes: string }>
  >({
    "ac-1": { pilot: "Capt. Mike Torres", notes: "Primary trainer" },
    "ac-2": { pilot: "Sarah Chen", notes: "Rental fleet" },
    "ac-4": { pilot: "David Kim", notes: "Currently on scenic tour route" },
  });
  const [editAssignment, setEditAssignment] = useState<string | null>(null);
  const [assignForm, setAssignForm] = useState({ pilot: "", notes: "" });

  const available = fleet.filter((a) => a.status === "available").length;
  const flying = fleet.filter((a) => a.status === "flying").length;
  const maintenance = fleet.filter((a) => a.status === "maintenance").length;

  const handleAddAircraft = () => {
    if (!form.tail_number || !form.make || !form.model) return;

    const newAircraft: Aircraft = {
      id: `ac-${Date.now()}`,
      fbo_id: "fbo-1",
      tail_number: form.tail_number.toUpperCase(),
      make: form.make,
      model: form.model,
      category: form.category,
      total_flight_hours: form.total_flight_hours,
      status: form.status,
      last_oil_change_hours: form.last_oil_change_hours || form.total_flight_hours,
      last_100hr_inspection_hours:
        form.last_100hr_inspection_hours || form.total_flight_hours,
      last_annual_inspection_hours:
        form.last_annual_inspection_hours || form.total_flight_hours,
      icao24_hex: form.icao24_hex || undefined,
      adsb_enabled: form.adsb_enabled,
      created_at: new Date().toISOString(),
    };

    setFleet((prev) => [...prev, newAircraft]);

    if (form.assigned_pilot || form.notes) {
      setAssignments((prev) => ({
        ...prev,
        [newAircraft.id]: {
          pilot: form.assigned_pilot,
          notes: form.notes,
        },
      }));
    }

    setForm(emptyAircraft);
    setShowAddForm(false);
  };

  const handleUpdateAircraft = () => {
    if (!editingId || !form.tail_number || !form.make || !form.model) return;

    setFleet((prev) =>
      prev.map((a) =>
        a.id === editingId
          ? {
              ...a,
              tail_number: form.tail_number.toUpperCase(),
              make: form.make,
              model: form.model,
              category: form.category,
              total_flight_hours: form.total_flight_hours,
              status: form.status,
              icao24_hex: form.icao24_hex || undefined,
              adsb_enabled: form.adsb_enabled,
            }
          : a
      )
    );

    setEditingId(null);
    setForm(emptyAircraft);
    setShowAddForm(false);
  };

  const handleDelete = (id: string) => {
    setFleet((prev) => prev.filter((a) => a.id !== id));
    setAssignments((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const startEdit = (aircraft: Aircraft) => {
    setEditingId(aircraft.id);
    setShowAddForm(true);
    setForm({
      tail_number: aircraft.tail_number,
      make: aircraft.make,
      model: aircraft.model,
      category: aircraft.category,
      total_flight_hours: aircraft.total_flight_hours,
      status: aircraft.status,
      last_oil_change_hours: aircraft.last_oil_change_hours,
      last_100hr_inspection_hours: aircraft.last_100hr_inspection_hours,
      last_annual_inspection_hours: aircraft.last_annual_inspection_hours,
      icao24_hex: aircraft.icao24_hex || "",
      adsb_enabled: aircraft.adsb_enabled,
      assigned_pilot: assignments[aircraft.id]?.pilot || "",
      notes: assignments[aircraft.id]?.notes || "",
    });
  };

  const handleSaveAssignment = (aircraftId: string) => {
    setAssignments((prev) => ({
      ...prev,
      [aircraftId]: { pilot: assignForm.pilot, notes: assignForm.notes },
    }));
    setEditAssignment(null);
    setAssignForm({ pilot: "", notes: "" });
  };

  return (
    <div className="h-screen overflow-y-auto pb-20 md:pb-0">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <PlaneTakeoff className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-heading text-white">Fleet Management</h1>
                <p className="text-small text-gray-400">
                  {fleet.length} aircraft in fleet
                </p>
              </div>
            </div>
            <Button
              onClick={() => {
                setEditingId(null);
                setForm(emptyAircraft);
                setShowAddForm(!showAddForm);
              }}
              className="gap-2"
            >
              {showAddForm ? (
                <>
                  <X className="w-4 h-4" /> Cancel
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Add Aircraft
                </>
              )}
            </Button>
          </div>

          {/* Status summary */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-small text-gray-400">
                {available} available
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="text-small text-gray-400">{flying} flying</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-rose-400" />
              <span className="text-small text-gray-400">
                {maintenance} maintenance
              </span>
            </div>
          </div>
        </motion.div>

        {/* Add/Edit Aircraft Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="bg-surface-200 border border-surface-400 rounded-xl p-6">
                <h3 className="text-subheading text-white mb-4">
                  {editingId ? "Edit Aircraft" : "Add New Aircraft"}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-500 font-medium">
                      Tail Number *
                    </label>
                    <Input
                      placeholder="N12345"
                      value={form.tail_number}
                      onChange={(e) =>
                        setForm({ ...form, tail_number: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-500 font-medium">
                      Make *
                    </label>
                    <Input
                      placeholder="Cessna"
                      value={form.make}
                      onChange={(e) =>
                        setForm({ ...form, make: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-500 font-medium">
                      Model *
                    </label>
                    <Input
                      placeholder="172S Skyhawk"
                      value={form.model}
                      onChange={(e) =>
                        setForm({ ...form, model: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-500 font-medium">
                      Category
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          category: e.target.value as AircraftCategory,
                        })
                      }
                      className="w-full bg-surface-300 border border-surface-400 rounded-xl px-3 py-2.5 text-body text-white outline-none"
                    >
                      <option value="airplane">Airplane</option>
                      <option value="helicopter">Helicopter</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-500 font-medium">
                      Status
                    </label>
                    <select
                      value={form.status}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          status: e.target.value as AircraftStatus,
                        })
                      }
                      className="w-full bg-surface-300 border border-surface-400 rounded-xl px-3 py-2.5 text-body text-white outline-none"
                    >
                      <option value="available">Available</option>
                      <option value="flying">Flying</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-500 font-medium">
                      Total Flight Hours
                    </label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={form.total_flight_hours || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          total_flight_hours: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-500 font-medium">
                      ICAO24 Hex (for ADS-B)
                    </label>
                    <Input
                      placeholder="A12345"
                      value={form.icao24_hex}
                      onChange={(e) =>
                        setForm({ ...form, icao24_hex: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-500 font-medium">
                      Assigned Pilot
                    </label>
                    <Input
                      placeholder="Pilot name"
                      value={form.assigned_pilot}
                      onChange={(e) =>
                        setForm({ ...form, assigned_pilot: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-gray-500 font-medium">
                      Notes / Nickname
                    </label>
                    <Input
                      placeholder='e.g. "Primary trainer"'
                      value={form.notes}
                      onChange={(e) =>
                        setForm({ ...form, notes: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.adsb_enabled}
                      onChange={(e) =>
                        setForm({ ...form, adsb_enabled: e.target.checked })
                      }
                      className="w-4 h-4 rounded border-surface-400 bg-surface-300 text-brand-500 focus:ring-brand-500/50"
                    />
                    <span className="text-xs text-gray-400">
                      ADS-B enabled (track on map)
                    </span>
                  </label>
                </div>

                <div className="flex items-center gap-3 mt-5">
                  <Button
                    onClick={editingId ? handleUpdateAircraft : handleAddAircraft}
                    disabled={!form.tail_number || !form.make || !form.model}
                    className="gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {editingId ? "Save Changes" : "Add to Fleet"}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingId(null);
                      setForm(emptyAircraft);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Aircraft list */}
        <div className="space-y-3">
          {fleet.map((aircraft, i) => {
            const hoursToOilChange =
              50 -
              (aircraft.total_flight_hours - aircraft.last_oil_change_hours);
            const hoursTo100hr =
              100 -
              (aircraft.total_flight_hours -
                aircraft.last_100hr_inspection_hours);
            const needsAttention = hoursToOilChange <= 10 || hoursTo100hr <= 10;
            const assignment = assignments[aircraft.id];
            const isEditingAssignment = editAssignment === aircraft.id;

            return (
              <motion.div
                key={aircraft.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-surface-200 border border-surface-400 rounded-xl p-5 hover:border-surface-500 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${getStatusDot(
                        aircraft.status
                      )}`}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-body text-white font-semibold">
                          {aircraft.tail_number}
                        </span>
                        <Badge variant={statusBadge[aircraft.status]}>
                          {aircraft.status}
                        </Badge>
                        {needsAttention && (
                          <Badge variant="warning">Attention</Badge>
                        )}
                        {aircraft.adsb_enabled && aircraft.icao24_hex && (
                          <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 bg-cyan-500/10 text-cyan-500 rounded">
                            <Radio className="w-2.5 h-2.5" />
                            ADS-B
                          </span>
                        )}
                      </div>
                      <p className="text-small text-gray-400 mt-0.5">
                        {aircraft.make} {aircraft.model}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500 capitalize mr-2">
                      {aircraft.category}
                    </span>
                    <button
                      onClick={() => startEdit(aircraft)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-300 hover:bg-surface-300 transition-all"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(aircraft.id)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 ml-6 mb-3">
                  <div className="flex items-center gap-2">
                    <Gauge className="w-3.5 h-3.5 text-gray-500" />
                    <div>
                      <p className="font-mono text-xs text-gray-400">
                        Total Hours
                      </p>
                      <p className="font-mono text-small text-white">
                        {aircraft.total_flight_hours.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Wrench className="w-3.5 h-3.5 text-gray-500" />
                    <div>
                      <p className="font-mono text-xs text-gray-400">
                        Oil Change
                      </p>
                      <p
                        className={`font-mono text-small ${
                          hoursToOilChange <= 10
                            ? "text-amber-400"
                            : "text-white"
                        }`}
                      >
                        in {hoursToOilChange}hrs
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-gray-500" />
                    <div>
                      <p className="font-mono text-xs text-gray-400">
                        100hr Insp
                      </p>
                      <p
                        className={`font-mono text-small ${
                          hoursTo100hr <= 10 ? "text-amber-400" : "text-white"
                        }`}
                      >
                        in {hoursTo100hr}hrs
                      </p>
                    </div>
                  </div>
                </div>

                {/* Assignment */}
                <div className="ml-6 pt-3 border-t border-surface-400/50">
                  {isEditingAssignment ? (
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-gray-500" />
                      <input
                        type="text"
                        placeholder="Pilot name"
                        value={assignForm.pilot}
                        onChange={(e) =>
                          setAssignForm({
                            ...assignForm,
                            pilot: e.target.value,
                          })
                        }
                        className="flex-1 bg-surface-300 border border-surface-400 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:ring-1 focus:ring-brand-500/50"
                      />
                      <input
                        type="text"
                        placeholder="Notes / nickname"
                        value={assignForm.notes}
                        onChange={(e) =>
                          setAssignForm({
                            ...assignForm,
                            notes: e.target.value,
                          })
                        }
                        className="flex-1 bg-surface-300 border border-surface-400 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:ring-1 focus:ring-brand-500/50"
                      />
                      <button
                        onClick={() => handleSaveAssignment(aircraft.id)}
                        className="px-2.5 py-1.5 bg-brand-500 text-white text-xs rounded-lg hover:bg-brand-600 transition-all"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditAssignment(null)}
                        className="px-2 py-1.5 text-gray-500 text-xs hover:text-gray-300 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : assignment ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-gray-500" />
                        <span className="text-xs text-gray-300">
                          {assignment.pilot}
                        </span>
                        {assignment.notes && (
                          <span className="text-[10px] text-gray-600">
                            &bull; {assignment.notes}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setEditAssignment(aircraft.id);
                          setAssignForm({
                            pilot: assignment.pilot,
                            notes: assignment.notes,
                          });
                        }}
                        className="text-[10px] text-brand-400 hover:text-brand-300 transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditAssignment(aircraft.id);
                        setAssignForm({ pilot: "", notes: "" });
                      }}
                      className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-400 transition-colors"
                    >
                      <Users className="w-3.5 h-3.5" />
                      Assign pilot & notes...
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {fleet.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <PlaneTakeoff className="w-12 h-12 text-gray-700 mb-4" />
            <h3 className="text-subheading text-gray-400 mb-2">
              No aircraft in your fleet
            </h3>
            <p className="text-small text-gray-600 mb-4">
              Add your first aircraft to get started with fleet management and
              ADS-B tracking.
            </p>
            <Button
              onClick={() => {
                setShowAddForm(true);
                setEditingId(null);
                setForm(emptyAircraft);
              }}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Aircraft
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
