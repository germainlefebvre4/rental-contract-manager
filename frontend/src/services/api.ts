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
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
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

export const createContract = async (contract: Partial<Contract>): Promise<Contract> => {
  const response = await api.post('/contracts', contract);
  return response.data;
};

export const getContracts = async (): Promise<Contract[]> => {
  const response = await api.get('/contracts');
  return response.data;
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

export const getUsers = async (): Promise<User[]> => {
  const response = await api.get('/users');
  return response.data;
};