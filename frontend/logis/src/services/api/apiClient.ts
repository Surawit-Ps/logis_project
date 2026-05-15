import axios from "axios";
import type {ApiResponse,FuelClaimDetail,Trip } from "../../interfaces/index";

const API_BASE_URL = "http://localhost:3000/";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Add error logging interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error("Response Error:", {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
    } else if (error.request) {
      console.error("Request Error:", error.request);
    } else {
      console.error("Error:", error.message);
    }
    return Promise.reject(error);
  }
);

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
        submitClaim: (data: {
        trip_id: string;
        amount: number;
        receipt_ref: string;
        receipt_url: string;
      }) =>
        api.post<ApiResponse<FuelClaimDetail>>(
          "/api/fuel-claims",
          data
        ),

  getClaimWithAuditTrail: (claimId: string) =>
    api.get<any>(`/api/fuel-claims/${claimId}`),

  getClaimsByDriver: () =>
    api.get<any>("/api/fuel-claims/driver"),

  getClaimsForSupervisor: () =>
    api.get<any>("/api/fuel-claims/status/supervisor"),

  getClaimsForFinance: () =>
    api.get<any>("/api/fuel-claims/status/finance"),

  approveBySupervisor: (claimId: string, remarks?: string) =>
    api.post<ApiResponse<{ message: string }>>(`/api/fuel-claims/${claimId}/approve-supervisor`, {
      remarks: remarks || "",
    }),

  rejectBySupervisor: (claimId: string, remarks: string) =>
    api.post<ApiResponse<{ message: string }>>(`/api/fuel-claims/${claimId}/reject-supervisor`, {
      remarks,
    }),

  approveByFinance: (claimId: string, remarks?: string) =>
    api.post<ApiResponse<{ message: string }>>(`/api/fuel-claims/${claimId}/approve-finance`, {
      remarks: remarks || "",
    }),

  rejectByFinance: (claimId: string, remarks: string) =>
    api.post<ApiResponse<{ message: string }>>(`/api/fuel-claims/${claimId}/reject-finance`, {
      remarks,
    }),
};

export default api;
