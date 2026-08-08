import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-agency-os';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  name: string;
}

/**
 * Extract and verify the authenticated user from the request.
 * Returns null if no valid token is found.
 */
export async function getAuthUser(req: NextRequest): Promise<AuthUser | null> {
  const token = req.cookies.get('auth-token')?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Require authentication. Returns the user or a 401 response.
 */
export async function requireAuth(req: NextRequest): Promise<AuthUser | NextResponse> {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return user;
}

/**
 * Require one of the specified roles. Returns the user or a 403 response.
 */
export async function requireRole(req: NextRequest, roles: string[]): Promise<AuthUser | NextResponse> {
  const result = await requireAuth(req);
  if (result instanceof NextResponse) return result;
  
  if (!roles.includes(result.role)) {
    return NextResponse.json({ error: 'Forbidden: insufficient permissions' }, { status: 403 });
  }
  return result;
}

/**
 * Check if a user has a specific permission via their assigned policies.
 */
export async function checkPermission(userId: string, resource: string, action: string): Promise<boolean> {
  const userPolicies = await prisma.userPolicy.findMany({
    where: { userId },
    include: { policy: true }
  });

  for (const up of userPolicies) {
    try {
      const permissions: string[] = JSON.parse(up.policy.permissions);
      // Check for wildcard or specific permission
      if (
        permissions.includes('*') ||
        permissions.includes(`${action}:*`) ||
        permissions.includes(`*:${resource}`) ||
        permissions.includes(`${action}:${resource}`)
      ) {
        return true;
      }
    } catch {
      continue;
    }
  }
  return false;
}

/**
 * Log an action to the audit trail.
 */
export async function logAudit(
  userId: string,
  action: string,
  resource: string,
  resourceId?: string,
  metadata?: Record<string, any>
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        resource,
        resourceId: resourceId || null,
        metadata: metadata ? JSON.stringify(metadata) : null,
      }
    });
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}

/**
 * Helper: check if the result is an error response (NextResponse).
 */
export function isErrorResponse(result: AuthUser | NextResponse): result is NextResponse {
  return result instanceof NextResponse;
}
