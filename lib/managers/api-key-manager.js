/**
 * API Key Management Module
 * Generates, validates, and manages API keys for SAAS users
 * 
 * Key Format: hm_[random-32-chars]
 * Stored as: bcrypt hash
 */

import crypto from 'crypto';
import bcrypt from 'bcryptjs';

class APIKeyManager {
  constructor() {
    this.name = 'APIKeyManager';
    this.emoji = '🔑';
    this.prefix = 'hm_';
    this.keyLength = 32;
    
    // In-memory storage (replace with DB in production)
    this.keys = new Map();
    this.stats = {
      generated: 0,
      validated: 0,
      revoked: 0,
      errors: 0,
    };
  }

  /**
   * Generate new API key
   */
  async generateKey(userId, name = 'Default Key') {
    try {
      // Generate random string
      const randomBytes = crypto.randomBytes(this.keyLength);
      const randomString = randomBytes.toString('hex').substring(0, this.keyLength);
      
      // Create key with prefix
      const apiKey = `${this.prefix}${randomString}`;
      
      // Hash for storage
      const hash = await bcrypt.hash(apiKey, 10);
      
      // Create record
      const keyRecord = {
        id: crypto.randomUUID(),
        userId,
        name,
        keyHash: hash,
        createdAt: new Date(),
        lastUsed: null,
        isActive: true,
        usageCount: 0,
      };
      
      // Store in map (use DB in production)
      this.keys.set(keyRecord.id, keyRecord);
      
      this.stats.generated++;
      
      // Return key (only shown once!)
      return {
        id: keyRecord.id,
        key: apiKey, // Only return on creation
        name,
        createdAt: keyRecord.createdAt,
        message: 'Save this key securely. It will not be shown again.',
      };
    } catch (error) {
      this.stats.errors++;
      throw new Error(`Failed to generate API key: ${error.message}`);
    }
  }

  /**
   * Validate API key
   */
  async validateKey(providedKey) {
    try {
      // Find key by checking hash against all stored keys
      for (const [id, record] of this.keys.entries()) {
        if (!record.isActive) continue;
        
        const isValid = await bcrypt.compare(providedKey, record.keyHash);
        
        if (isValid) {
          // Update last used
          record.lastUsed = new Date();
          record.usageCount++;
          
          this.stats.validated++;
          
          return {
            valid: true,
            keyId: record.id,
            userId: record.userId,
            name: record.name,
          };
        }
      }
      
      this.stats.errors++;
      return { valid: false };
    } catch (error) {
      this.stats.errors++;
      throw new Error(`Failed to validate API key: ${error.message}`);
    }
  }

  /**
   * List user's keys (without revealing the secret part)
   */
  async listKeys(userId) {
    const userKeys = Array.from(this.keys.values())
      .filter(k => k.userId === userId)
      .map(k => ({
        id: k.id,
        name: k.name,
        createdAt: k.createdAt,
        lastUsed: k.lastUsed,
        isActive: k.isActive,
        usageCount: k.usageCount,
        preview: `${this.prefix}...${k.keyHash.substring(k.keyHash.length - 4)}`,
      }));
    
    return {
      userId,
      keys: userKeys,
      total: userKeys.length,
    };
  }

  /**
   * Get key details
   */
  async getKeyDetails(keyId) {
    const keyRecord = this.keys.get(keyId);
    
    if (!keyRecord) {
      return null;
    }
    
    return {
      id: keyRecord.id,
      name: keyRecord.name,
      createdAt: keyRecord.createdAt,
      lastUsed: keyRecord.lastUsed,
      isActive: keyRecord.isActive,
      usageCount: keyRecord.usageCount,
    };
  }

  /**
   * Revoke key
   */
  async revokeKey(keyId) {
    try {
      const keyRecord = this.keys.get(keyId);
      
      if (!keyRecord) {
        return { success: false, error: 'Key not found' };
      }
      
      keyRecord.isActive = false;
      keyRecord.revokedAt = new Date();
      
      this.stats.revoked++;
      
      return {
        success: true,
        message: 'Key revoked successfully',
        keyId,
        revokedAt: keyRecord.revokedAt,
      };
    } catch (error) {
      this.stats.errors++;
      throw new Error(`Failed to revoke key: ${error.message}`);
    }
  }

  /**
   * Rotate key (create new, optionally revoke old)
   */
  async rotateKey(keyId, revokeOld = true) {
    try {
      const oldKeyRecord = this.keys.get(keyId);
      
      if (!oldKeyRecord) {
        return { success: false, error: 'Key not found' };
      }
      
      // Generate new key for same user
      const newKey = await this.generateKey(oldKeyRecord.userId, `${oldKeyRecord.name} (rotated)`);
      
      // Optionally revoke old key
      if (revokeOld) {
        await this.revokeKey(keyId);
      }
      
      return {
        success: true,
        oldKeyId: keyId,
        newKey,
        message: 'Key rotated successfully',
      };
    } catch (error) {
      this.stats.errors++;
      throw new Error(`Failed to rotate key: ${error.message}`);
    }
  }

  /**
   * Get statistics
   */
  getStats() {
    const totalKeys = this.keys.size;
    const activeKeys = Array.from(this.keys.values()).filter(k => k.isActive).length;
    const revokedKeys = totalKeys - activeKeys;
    
    return {
      ...this.stats,
      totalKeys,
      activeKeys,
      revokedKeys,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Health check
   */
  healthCheck() {
    return {
      service: 'APIKeyManager',
      status: 'operational',
      stats: this.getStats(),
      timestamp: new Date().toISOString(),
    };
  }
}

export default APIKeyManager;
