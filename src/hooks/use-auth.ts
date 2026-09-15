import { useContext } from "react";
import { AuthContext } from "../context/auth-context";

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("La autenticación debe estar dentro de AuthProvider.");
  return context;
}
