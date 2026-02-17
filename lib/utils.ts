import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":");
  const h = parseInt(hours);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function getServiceTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    discovery: "Discovery Flight",
    rental: "Aircraft Rental",
    lesson: "Flight Lesson",
    tour: "Scenic Tour",
  };
  return labels[type] || type;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    available: "text-emerald-400",
    flying: "text-cyan-400",
    maintenance: "text-rose-400",
    scheduled: "text-brand-400",
    completed: "text-emerald-400",
    cancelled: "text-rose-400",
  };
  return colors[status] || "text-gray-400";
}

export function getStatusDot(status: string): string {
  const dots: Record<string, string> = {
    available: "bg-emerald-400",
    flying: "bg-cyan-400",
    maintenance: "bg-rose-400",
  };
  return dots[status] || "bg-gray-400";
}
