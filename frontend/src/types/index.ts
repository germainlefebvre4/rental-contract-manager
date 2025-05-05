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
}

export interface Contract {
  id: string;
  productId: string;
  userId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
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
  // User information
  renterName: string;
  renterEmail: string;
  renterPhone: string;
  renterAddress: string;
  renterCity: string;
  // Contract details
  totalAmount: number;
  stateBefore: string;
  stateAfter: string;
  usageDate: string;
  retrievalDates: string;
  // Additional fields
  currentDate: string;
  city: string;
}