export interface User {
  id: string;
  username: string;
  role: "driver" | "supervisor" | "finance";
  createdAt?: string;
}

export interface Trip {
  id: string;
  driver_id: string;
  origin: string;
  destination: string;
  status: string;
  created_at?: string;
}

export interface AuditLogInfo {
  id: string;
  action: string;
  actor_name?: string;
  actor_role?: string;
  from_status?: string;
  to_status?: string;
  remarks?: string;
  created_at: string;
}

export interface FuelClaimDetail {
  id: string;
  status: string;
  amount: number;
  receipt_ref: string;
  receipt_url: string;
  created_at: string;
  updated_at: string;
  driver: {
    id: string;
    username: string;
  };
  trip: {
    id: string;
    origin: string;
    destination: string;
    status: string;
  };
  audit_trail: AuditLogInfo[];
}

export interface LoginResponse {
  token: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}
