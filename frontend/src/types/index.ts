export enum UserRole {
  BUYER = 'BUYER',
  SELLER = 'SELLER',
  ADMIN = 'ADMIN',
}

export enum OperationStatus {
  CREADA = 'CREADA',
  ACEPTADA = 'ACEPTADA',
  FONDOS_EN_CUSTODIA = 'FONDOS_EN_CUSTODIA',
  EN_TRANSFERENCIA = 'EN_TRANSFERENCIA',
  LIBERADA = 'LIBERADA',
  CANCELADA = 'CANCELADA',
}

export enum DocumentType {
  COMPRAVENTA = 'COMPRAVENTA',
  TRANSFERENCIA = 'TRANSFERENCIA',
  COMPROBANTE_PAGO = 'COMPROBANTE_PAGO',
  IDENTIFICACION = 'IDENTIFICACION',
  OTRO = 'OTRO',
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  rut: string;
  role: UserRole;
  phone?: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
}

export interface Operation {
  id: string;
  operationNumber: string;
  buyerId: string;
  sellerId: string;
  buyer?: User;
  seller?: User;
  vehiclePatent?: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  agreedPrice: number;
  status: OperationStatus;
  deadlineDate: string;
  buyerAccepted: boolean;
  sellerAccepted: boolean;
  buyerAcceptedAt?: string;
  sellerAcceptedAt?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface Escrow {
  id: string;
  operationId: string;
  depositedAmount?: number;
  depositDate?: string;
  depositReference?: string;
  releasedAmount?: number;
  releasedAt?: string;
  releaseReference?: string;
}

export interface Document {
  id: string;
  operationId: string;
  uploadedBy: string;
  documentType: DocumentType;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  description?: string;
  isValidated: boolean;
  validatedAt?: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}
