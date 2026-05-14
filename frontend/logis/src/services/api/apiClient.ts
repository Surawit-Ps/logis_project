import axios from "axios";
import type {ApiResponse,LoginResponse,FuelClaimDetail,Trip } from "../../interfaces/index";

const API_BASE_URL = "http://localhost:3000/";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  login: (username: string, password: string) =>
    api.post<any>("/login", {
      username,
      password,
    }),

  register: (username: string, password: string) =>
    api.post<ApiResponse<{ message: string }>>("/api/users/register", {
      username,
      password,
    }),
};


export const tripAPI = {
  createTrip: (driverId: string, origin: string, destination: string, startTime: string) =>
    api.post<ApiResponse<Trip>>("/api/trips", {
      driver_id: driverId,
      origin,
      destination,
      start_time: startTime,
    }),

  getTrip: (tripId: string) =>
    api.get<ApiResponse<Trip>>(`/api/trips/${tripId}`),

  findTrip: (tripId: string) =>
    api.get<ApiResponse<Trip>>(`/api/trips/find/${tripId}`),

  getAllTripsByDriverID: () =>
    api.get<any>(`/api/trips/driver`),
};

// Fuel Claim APIs
export const fuelClaimAPI = {
  submitClaim: (tripId: string, amount: number, receiptRef: string, receiptUrl: string) =>
    api.post<ApiResponse<FuelClaimDetail>>("/api/fuel-claims", {
      trip_id: tripId,
      amount,
      receipt_ref: receiptRef,
      receipt_url: receiptUrl,
    }),

  getClaimWithAuditTrail: (claimId: string) =>
    api.get<ApiResponse<FuelClaimDetail>>(`/api/fuel-claims/${claimId}`),

  getClaimsByDriver: () =>
    api.get<ApiResponse<FuelClaimDetail[]>>("/api/fuel-claims/driver"),

  getClaimsForSupervisor: () =>
    api.get<ApiResponse<FuelClaimDetail[]>>("/api/fuel-claims/status/supervisor"),

  getClaimsForFinance: () =>
    api.get<ApiResponse<FuelClaimDetail[]>>("/api/fuel-claims/status/finance"),

  approveBySupervisor: (claimId: string, supervisorId: string, remarks?: string) =>
    api.post<ApiResponse<{ message: string }>>(`/api/fuel-claims/${claimId}/approve-supervisor`, {
      supervisor_id: supervisorId,
      remarks: remarks || "",
    }),

  rejectBySupervisor: (claimId: string, supervisorId: string, remarks: string) =>
    api.post<ApiResponse<{ message: string }>>(`/api/fuel-claims/${claimId}/reject-supervisor`, {
      supervisor_id: supervisorId,
      remarks,
    }),

  approveByFinance: (claimId: string, financeId: string, remarks?: string) =>
    api.post<ApiResponse<{ message: string }>>(`/api/fuel-claims/${claimId}/approve-finance`, {
      finance_id: financeId,
      remarks: remarks || "",
    }),

  rejectByFinance: (claimId: string, financeId: string, remarks: string) =>
    api.post<ApiResponse<{ message: string }>>(`/api/fuel-claims/${claimId}/reject-finance`, {
      finance_id: financeId,
      remarks,
    }),
};

export default api;
