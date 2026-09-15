export interface Consultation {
  id: string;
  propertyId: string;
  publisherId: number;
  propertyTitle: string;
  propertyImage: string;
  createdAt: string;
  userEmail?: string;
  contact: { firstName: string; lastName: string; email: string; phone: string };
  message?: string;
}
