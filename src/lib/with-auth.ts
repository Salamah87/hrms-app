import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authenticate, getTokenFromHeader, type AuthUser } from './auth-middleware';
import { logAudit } from './audit-store';

type RouteHandler = (request: NextRequest, user: AuthUser) => Promise<Response>;

interface WithAuthOptions {
  requireAuth?: boolean;
  audit?: boolean;
}

export function withAuth(handler: RouteHandler, options: WithAuthOptions = {}) {
  const { requireAuth = true, audit = false } = options;

  return async (request: NextRequest) => {
    const token = getTokenFromHeader(request.headers.get('Authorization'));

    if (requireAuth) {
      if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const user = authenticate(token);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      try {
        const response = await handler(request, user);
        if (audit) {
          const url = new URL(request.url);
          logAudit({ userId: user.id, email: user.email, action: request.method + '_' + url.pathname, resource: url.pathname, resourceId: null, success: true, ip: request.headers.get('x-forwarded-for') || 'unknown' });
        }
        return response;
      } catch (err) {
        logAudit({ userId: user.id, email: user.email, action: request.method + '_' + new URL(request.url).pathname, resource: new URL(request.url).pathname, resourceId: null, success: false, ip: request.headers.get('x-forwarded-for') || 'unknown', details: String(err) });
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
      }
    }

    return handler(request, null as any);
  };
}

export function forbidden(message = 'Forbidden'): Response {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function notFound(message = 'Not found'): Response {
  return NextResponse.json({ error: message }, { status: 404 });
}