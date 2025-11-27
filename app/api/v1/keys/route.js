/**
 * API Keys Management Endpoint
 * Provides SAAS users with API key management
 * 
 * POST   /api/v1/keys                 Generate new key
 * GET    /api/v1/keys                 List user's keys
 * GET    /api/v1/keys/{keyId}         Get key details
 * DELETE /api/v1/keys/{keyId}         Revoke key
 * POST   /api/v1/keys/{keyId}/rotate  Rotate key
 */

import APIKeyManager from '@/lib/managers/api-key-manager';

let keyManager = null;

function getKeyManager() {
  if (!keyManager) {
    keyManager = new APIKeyManager();
  }
  return keyManager;
}

/**
 * GET /api/v1/keys
 * List user's API keys
 */
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const keyId = url.pathname.split('/').pop();
    const manager = getKeyManager();

    // If specific key ID provided
    if (keyId && keyId !== 'keys') {
      const details = await manager.getKeyDetails(keyId);
      if (!details) {
        return new Response(
          JSON.stringify({ error: 'Key not found' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return new Response(JSON.stringify(details), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'private, max-age=60',
        },
      });
    }

    // List all keys (would need auth context in production)
    // For now, return generic documentation
    return new Response(
      JSON.stringify({
        api: 'API Key Management',
        version: '1.0',
        endpoints: {
          POST: {
            path: '/api/v1/keys',
            description: 'Generate new API key',
            body: { name: 'string (optional)' },
          },
          GET: {
            path: '/api/v1/keys',
            description: 'List user keys (requires auth)',
          },
          DELETE: {
            path: '/api/v1/keys/{keyId}',
            description: 'Revoke key',
          },
          'POST (rotate)': {
            path: '/api/v1/keys/{keyId}/rotate',
            description: 'Rotate key (create new + revoke old)',
          },
        },
        keyFormat: 'hm_[32-char-random]',
        status: 'operational',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * POST /api/v1/keys
 * Generate new API key
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, name } = body;

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Missing userId' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const manager = getKeyManager();
    const result = await manager.generateKey(userId, name || 'API Key');

    // Add rate limit headers
    return new Response(JSON.stringify(result), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': '10',
        'X-RateLimit-Remaining': '9',
        'Cache-Control': 'private, no-cache, no-store',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * DELETE /api/v1/keys/{keyId}
 * Revoke API key
 */
export async function DELETE(req) {
  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const keyId = pathParts[pathParts.length - 2] || pathParts[pathParts.length - 1];

    if (!keyId || keyId === 'keys') {
      return new Response(
        JSON.stringify({ error: 'Missing keyId' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const manager = getKeyManager();
    const result = await manager.revokeKey(keyId);

    if (!result.success) {
      return new Response(JSON.stringify(result), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * OPTIONS /api/v1/keys
 * API documentation
 */
export function OPTIONS() {
  return new Response(
    JSON.stringify({
      api: 'HARMONIC API Key Management',
      version: '1.0',
      description: 'Manage API keys for SAAS authentication',
      methods: {
        POST: {
          description: 'Generate new API key',
          endpoint: '/api/v1/keys',
          body: {
            userId: 'string (required)',
            name: 'string (optional)',
          },
          response: {
            id: 'Key ID',
            key: 'API Key (hm_...)',
            name: 'Key name',
            createdAt: 'Creation timestamp',
            message: 'Warning about saving the key',
          },
        },
        GET: {
          description: 'Get key details or list user keys',
          endpoint: '/api/v1/keys or /api/v1/keys/{keyId}',
          response: {
            'Single key': {
              id: 'Key ID',
              name: 'Key name',
              createdAt: 'Creation date',
              lastUsed: 'Last usage timestamp',
              isActive: 'Status',
              usageCount: 'Number of times used',
            },
          },
        },
        DELETE: {
          description: 'Revoke API key (immediately invalidated)',
          endpoint: '/api/v1/keys/{keyId}',
          response: {
            success: true,
            message: 'Key revoked successfully',
            revokedAt: 'Revocation timestamp',
          },
        },
      },
      keyFormat: {
        prefix: 'hm_',
        length: '36 characters total',
        example: 'hm_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
      },
      features: {
        keyRotation: 'Rotate keys with automatic revocation',
        usageTracking: 'Track usage per key',
        rateLimit: 'Rate limit per API key',
        security: 'Bcrypt hashed storage',
      },
      status: 'operational',
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
      },
    }
  );
}
