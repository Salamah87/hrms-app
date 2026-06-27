import crypto from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';

const SECRET = 'pulsehr-secret-key-2024';
const DATA_DIR = path.join(process.cwd(), 'data');
const REFRESH_FILE = path.join(DATA_DIR, 'refresh-tokens.json');

function base64UrlEncode(str: string): string {
  return Buffer.from(str).toString('base64url');
}

function base64UrlDecode(str: string): string {
  return Buffer.from(str, 'base64url').toString('utf-8');
}

export function signToken(payload: object): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = { ...payload, iat: now, exp: now + 86400 };

  const headerEncoded = base64UrlEncode(JSON.stringify(header));
  const payloadEncoded = base64UrlEncode(JSON.stringify(fullPayload));

  const signature = crypto
    .createHmac('sha256', SECRET)
    .update(headerEncoded + '.' + payloadEncoded)
    .digest('base64url');

  return headerEncoded + '.' + payloadEncoded + '.' + signature;
}

export function verifyToken(token: string): object | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerEncoded, payloadEncoded, signature] = parts;

    const expectedSignature = crypto
      .createHmac('sha256', SECRET)
      .update(headerEncoded + '.' + payloadEncoded)
      .digest('base64url');

    if (signature !== expectedSignature) return null;

    const payload = JSON.parse(base64UrlDecode(payloadEncoded));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch {
    return null;
  }
}

export async function getEmployeeFromToken(token: string): Promise<object | null> {
  const payload = verifyToken(token);
  if (!payload) return null;

  const { userId, sub } = payload as { userId?: string; sub?: string };
  const id = userId || sub;

  const raw = await fs.readFile(path.join(DATA_DIR, 'employees.json'), 'utf-8');
  const { employees } = JSON.parse(raw);
  return employees.find((e: { id: string }) => e.id === id) || null;
}

export async function generateRefreshToken(userId: string): Promise<string> {
  const token = crypto.randomBytes(48).toString('hex');
  let tokens: Record<string, { userId: string; createdAt: string; used: boolean }> = {};
  try {
    const raw = await fs.readFile(REFRESH_FILE, 'utf-8');
    tokens = JSON.parse(raw);
  } catch {}
  tokens[token] = { userId, createdAt: new Date().toISOString(), used: false };
  await fs.writeFile(REFRESH_FILE, JSON.stringify(tokens, null, 2), 'utf-8');
  return token;
}

export async function rotateRefreshToken(oldToken: string): Promise<{ accessToken: string; refreshToken: string } | null> {
  let tokens: Record<string, { userId: string; createdAt: string; used: boolean }> = {};
  try {
    const raw = await fs.readFile(REFRESH_FILE, 'utf-8');
    tokens = JSON.parse(raw);
  } catch {
    return null;
  }

  const entry = tokens[oldToken];
  if (!entry || entry.used) return null;

  // Mark as used (rotation)
  entry.used = true;
  tokens[oldToken] = entry;

  // Generate new pair
  const newRefresh = await generateRefreshToken(entry.userId);
  await fs.writeFile(REFRESH_FILE, JSON.stringify(tokens, null, 2), 'utf-8');

  const accessToken = signToken({ sub: entry.userId });
  return { accessToken, refreshToken: newRefresh };
}