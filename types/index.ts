export interface FBO {
  id: string;
  name: string;
  airport_code: string;
  phone?: string;
  email?: string;
  created_at: string;
}

export interface User {
  id: string;
  fbo_id: string;
  email: string;
  full_name: string;
  created_at: string;
}

export type AircraftCategory = "airplane" | "helicopter";
export type AircraftStatus = "available" | "flying" | "maintenance";

export interface Aircraft {
  id: string;
  fbo_id: string;
  tail_number: string;
  make: string;
  model: string;
  category: AircraftCategory;
  total_flight_hours: number;
  status: AircraftStatus;
  last_oil_change_hours: number;
  last_100hr_inspection_hours: number;
  last_annual_inspection_hours: number;
  icao24_hex?: string;
  adsb_enabled: boolean;
  created_at: string;
}

export type ServiceType = "discovery" | "rental" | "lesson" | "tour";
export type FlightStatus = "scheduled" | "completed" | "cancelled";

export interface Flight {
  id: string;
  fbo_id: string;
  aircraft_id: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  flight_date: string;
  flight_time: string;
  duration_minutes: number;
  service_type: ServiceType;
  status: FlightStatus;
  actual_start_time?: string;
  actual_end_time?: string;
  flight_hours?: number;
  created_at: string;
  aircraft?: Aircraft;
}

export type AlertType = "maintenance" | "weather" | "safety";
export type AlertPriority = "low" | "medium" | "high" | "critical";
export type AlertStatus = "active" | "acknowledged" | "resolved";

export interface Alert {
  id: string;
  fbo_id: string;
  aircraft_id?: string;
  alert_type: AlertType;
  priority: AlertPriority;
  message: string;
  status: AlertStatus;
  created_at: string;
  aircraft?: Aircraft;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface WeatherData {
  raw_metar: string;
  station: string;
  temperature: number;
  dewpoint: number;
  wind_direction: number;
  wind_speed: number;
  wind_gust?: number;
  visibility: number;
  ceiling?: number;
  flight_category: "VFR" | "MVFR" | "IFR" | "LIFR";
  conditions: string;
}
