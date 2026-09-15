import type { Property } from "../../types/property.ts";
import type { UserProfile, UserRole } from "../../types/user.ts";

// Editor autorizado solo para el prototipo. Reemplazar más adelante con el usuario autenticado.
export const MOCK_CURRENT_PUBLISHER_ID: Property["publisherId"] = 1;

export const MOCK_USERS: Record<UserRole, UserProfile> = {
  interested: {
    role: "interested", firstName: "Ana", lastName: "Pérez",
    email: "ana@example.com", phone: "",
  },
  publisher: {
    role: "publisher", publisherType: "individual", firstName: "Martín", lastName: "Gómez",
    email: "martin@example.com", phone: "+54 351 555-0100", taxId: "20123456789",
  },
  admin: {
    role: "admin", firstName: "Laura", lastName: "López",
    email: "laura@example.com", phone: "",
  },
};
