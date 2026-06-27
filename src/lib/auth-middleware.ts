import { verifyToken } from './auth-utils';

export interface AuthUser {
  id: string;
  companyId: string;
  role: string;
  managerId: string | null;
  email: string;
}

export function authenticate(token: string): AuthUser | null {
  const payload = verifyToken(token) as any;
  if (!payload) return null;
  return {
    id: payload.sub || payload.userId,
    companyId: payload.companyId || 'company-1',
    role: payload.role || 'employee',
    managerId: payload.managerId || null,
    email: payload.email || '',
  };
}

export function getTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.slice(7);
}