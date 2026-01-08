import { OperationStatus } from '@/types';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(amount);
};

export const formatDate = (date: string): string => {
  return new Intl.DateTimeFormat('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

export const formatDateTime = (date: string): string => {
  return new Intl.DateTimeFormat('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export const getStatusLabel = (status: OperationStatus): string => {
  const labels: Record<OperationStatus, string> = {
    [OperationStatus.CREADA]: 'Creada',
    [OperationStatus.ACEPTADA]: 'Aceptada',
    [OperationStatus.FONDOS_EN_CUSTODIA]: 'Fondos en Custodia',
    [OperationStatus.EN_TRANSFERENCIA]: 'En Transferencia',
    [OperationStatus.LIBERADA]: 'Liberada',
    [OperationStatus.CANCELADA]: 'Cancelada',
  };
  return labels[status] || status;
};

export const getStatusBadgeClass = (status: OperationStatus): string => {
  const classes: Record<OperationStatus, string> = {
    [OperationStatus.CREADA]: 'badge-creada',
    [OperationStatus.ACEPTADA]: 'badge-aceptada',
    [OperationStatus.FONDOS_EN_CUSTODIA]: 'badge-fondos-en-custodia',
    [OperationStatus.EN_TRANSFERENCIA]: 'badge-en-transferencia',
    [OperationStatus.LIBERADA]: 'badge-liberada',
    [OperationStatus.CANCELADA]: 'badge-cancelada',
  };
  return classes[status] || 'badge';
};

export const formatRut = (rut: string): string => {
  const cleaned = rut.replace(/[^0-9kK]/g, '');
  if (cleaned.length <= 1) return cleaned;
  
  const dv = cleaned.slice(-1);
  const numbers = cleaned.slice(0, -1);
  
  return `${numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${dv}`;
};

export const validateRut = (rut: string): boolean => {
  const cleaned = rut.replace(/[^0-9kK]/g, '');
  if (cleaned.length < 2) return false;

  const dv = cleaned.slice(-1).toUpperCase();
  const numbers = cleaned.slice(0, -1);

  let sum = 0;
  let multiplier = 2;

  for (let i = numbers.length - 1; i >= 0; i--) {
    sum += parseInt(numbers[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const calculatedDv = 11 - (sum % 11);
  const expectedDv = calculatedDv === 11 ? '0' : calculatedDv === 10 ? 'K' : calculatedDv.toString();

  return dv === expectedDv;
};
