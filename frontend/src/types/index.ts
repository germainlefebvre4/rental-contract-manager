// Shared interface definitions to prevent TypeScript errors from duplicate type declarations

export interface Product {
  id: string;
  object: string;
  brand: string;
  model: string;
  quantity: number;
  description: string;
  pricePerDay: number;
  pricePerWeek: number;
  cautionDeposit: number;
  status?: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  postalAddress: string;
  city: string;
  birthDate?: string;
  phoneNumber: string;
  kind: 'admin' | 'renter';
}

export interface Contract {
  id: string;
  productId: string;
  userId: string;
  startDate: string;              // Usage start date
  endDate: string;                // Usage end date
  retrievalStartDate?: string;    // Start date for retrieving the item
  retrievalEndDate?: string;      // End date for retrieving the item
  totalPrice: number;             // Frontend property
  totalAmount?: number;           // Backend property (same as totalPrice)
  durationDays?: number;          // Rental duration in days
  status: string;
  product?: Product;
  user?: User;
}

// PDF generation related type
export interface ContractPDFData {
  // Contract ID
  contractId: string;
  // Product information
  object: string;
  brand: string;
  model: string;
  quantity: number;
  description: string;
  precautions: string;
  pricePerDay: number;
  pricePerWeek: number;
  deposit: number;
  // Renter information
  renterName: string;
  renterEmail: string;
  renterPhone: string;
  renterAddress: string;
  renterCity: string;
  // Owner information
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerAddress: string;
  ownerCity: string;
  // Contract details
  totalAmount: number;
  durationDays?: number;
  stateBefore: string;
  stateAfter: string;
  usageDate: string;
  retrievalDates: string;
  // Additional fields
  currentDate: string;
  city: string;
}