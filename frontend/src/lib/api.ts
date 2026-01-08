import axios, { AxiosError, AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para agregar token
    this.client.interceptors.request.use((config) => {
      const token = this.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Interceptor para manejar errores
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          this.clearToken();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  private clearToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  // Auth
  async register(data: any) {
    const response = await this.client.post('/auth/register', data);
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', { email, password });
    return response.data;
  }

  // Users
  async getProfile() {
    const response = await this.client.get('/users/me');
    return response.data;
  }

  async getUser(id: string) {
    const response = await this.client.get(`/users/${id}`);
    return response.data;
  }

  // Operations
  async createOperation(data: any) {
    const response = await this.client.post('/operations', data);
    return response.data;
  }

  async getOperations(status?: string) {
    const response = await this.client.get('/operations', {
      params: status ? { status } : {},
    });
    return response.data;
  }

  async getOperation(id: string) {
    const response = await this.client.get(`/operations/${id}`);
    return response.data;
  }

  async acceptTerms(operationId: string) {
    const response = await this.client.post(`/operations/${operationId}/accept-terms`);
    return response.data;
  }

  async updateOperationStatus(operationId: string, data: any) {
    const response = await this.client.patch(`/operations/${operationId}/status`, data);
    return response.data;
  }

  async getStats() {
    const response = await this.client.get('/operations/stats');
    return response.data;
  }

  // Escrows
  async getEscrow(operationId: string) {
    const response = await this.client.get(`/escrows/operation/${operationId}`);
    return response.data;
  }

  async validateDeposit(operationId: string, data: any) {
    const response = await this.client.post(
      `/escrows/operation/${operationId}/validate-deposit`,
      data
    );
    return response.data;
  }

  async releaseFunds(operationId: string, data: any) {
    const response = await this.client.post(
      `/escrows/operation/${operationId}/release-funds`,
      data
    );
    return response.data;
  }

  // Documents
  async uploadDocument(operationId: string, formData: FormData) {
    const response = await this.client.post(
      `/documents/operation/${operationId}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  async getDocuments(operationId: string) {
    const response = await this.client.get(`/documents/operation/${operationId}`);
    return response.data;
  }

  async validateDocument(documentId: string) {
    const response = await this.client.post(`/documents/${documentId}/validate`);
    return response.data;
  }

  async deleteDocument(documentId: string) {
    const response = await this.client.delete(`/documents/${documentId}`);
    return response.data;
  }
}

export const api = new ApiClient();
