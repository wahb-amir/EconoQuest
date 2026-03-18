"use client";
import { useAuthContext } from "@/lib/authContext";

// clean public hook for components
export function useAuth() {
  return useAuthContext();
}