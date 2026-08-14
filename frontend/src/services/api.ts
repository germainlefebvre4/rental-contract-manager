import axios from 'axios';
import { Product, User, Contract } from '../types';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      REACT_APP_API_URL?: string;
    }
  }
}

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const createProduct = async (product: Partial<Product>): Promise<Product> => {
  const response = await api.post('/products', product);
  return response.data;
};

export const getProducts = async (): Promise<Product[]> => {
  const response = await api.get('/products');
  return response.data;
};

export const updateProduct = async (id: string, product: Partial<Product>): Promise<Product> => {
  const response = await api.put(`/products/${id}`, product);
  return response.data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  await api.delete(`/products/${id}`);
};

export const createContract = async (contract: Partial<Contract>, user?: Partial<User>): Promise<Contract> => {
  if (user) {
    // Send both the contract and user data in the same request
    const response = await api.post('/contracts', {
      contract,
      user
    });
    return response.data;
  } else {
    // Fallback to the old approach for backward compatibility
    const response = await api.post('/contracts', contract);
    return response.data;
  }
};

export const getContracts = async (): Promise<Contract[]> => {
  const response = await api.get('/contracts');
  return response.data;
};

export const updateContract = async (id: string, contract: Partial<Contract>): Promise<Contract> => {
  const response = await api.put(`/contracts/${id}`, contract);
  return response.data;
};

export const deleteContract = async (id: string): Promise<void> => {
  await api.delete(`/contracts/${id}`);
};

export const getContractsByDateRange = async (start: Date, end: Date): Promise<Contract[]> => {
  const startStr = start.toISOString().split('T')[0];
  const endStr = end.toISOString().split('T')[0];
  const response = await api.get(`/contracts/date-range?start=${startStr}&end=${endStr}`);
  return response.data;
};

export const createUser = async (user: Partial<User>): Promise<User> => {
  const response = await api.post('/users', user);
  return response.data;
};

export const getUsers = async (kind?: string): Promise<User[]> => {
  const response = await api.get('/users', { params: { kind } });
  return response.data;
};