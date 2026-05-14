/**
 * Centralized API configuration for the AgriML application.
 * Uses environment variable for production, falls back to local for development.
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

export const AUTH_ENDPOINTS = {
  SEND_OTP: `${API_BASE_URL}/api/auth/send-otp`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  FORGOT_PASSWORD: `${API_BASE_URL}/api/auth/forgot-password`,
  RESET_PASSWORD: `${API_BASE_URL}/api/auth/reset-password`,
  SOCIAL_SYNC: `${API_BASE_URL}/api/auth/social-sync`,
  UPDATE_PROFILE: `${API_BASE_URL}/api/auth/update`,
};
