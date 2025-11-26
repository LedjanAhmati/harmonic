/**
 * Usage Tracking Module
 * Tracks API usage per user and enforces quotas
 */

class UsageTracker {
  constructor() {
    this.name = 'UsageTracker';
    this.emoji = '📊';
    
    // Quota definitions per tier
    this.quotas = {
      free: {
        requests: 1000,
        resetPeriod: 'month',
      },
      pro: {
        requests: 10000,
        resetPeriod: 'month',
      },
      enterprise: {
        requests: Infinity,
        resetPeriod: 'month',
      },
    };
    
    // In-memory tracking (replace with DB in production)
    this.usage = new Map(); // userId -> usage records
    this.quotaUsage = new Map(); // userId -> current month usage
    
    this.stats = {
      totalRequests: 0,
      totalTracked: 0,
      quotaExceeded: 0,
      errors: 0,
    };
  }

  /**
   * Track API request
   */
  async trackRequest(userId, request) {
    try {
      const record = {
        id: `${Date.now()}_${Buffer.from(userId).toString('base64').substring(0, 7)}`,
        userId,
        timestamp: new Date(),
        endpoint: request.endpoint || '/api/v1/data',
        method: request.method || 'GET',
        source: request.source || 'unknown',
        responseTime: request.responseTime || 0,
        status: request.status || 200,
        bytesIn: request.bytesIn || 0,
        bytesOut: request.bytesOut || 0,
      };
      
      // Add to user's usage history
      if (!this.usage.has(userId)) {
        this.usage.set(userId, []);
      }
      
      this.usage.get(userId).push(record);
      
      // Keep only last 10,000 requests per user (memory limit)
      const userUsage = this.usage.get(userId);
      if (userUsage.length > 10000) {
        userUsage.shift();
      }
      
      // Increment quota usage
      this.incrementQuotaUsage(userId);
      
      this.stats.totalRequests++;
      this.stats.totalTracked++;
      
      return { success: true, recordId: record.id };
    } catch (error) {
      this.stats.errors++;
      throw new Error(`Failed to track request: ${error.message}`);
    }
  }

  /**
   * Increment quota usage for current period
   */
  incrementQuotaUsage(userId) {
    if (!this.quotaUsage.has(userId)) {
      this.quotaUsage.set(userId, {
        count: 0,
        startDate: this.getCurrentPeriodStart(),
      });
    }
    
    const usage = this.quotaUsage.get(userId);
    usage.count++;
  }

  /**
   * Get current usage for user
   */
  async getCurrentUsage(userId, tier = 'pro') {
    const periodStart = this.getCurrentPeriodStart();
    const periodEnd = this.getNextPeriodStart();
    
    const quotaRecord = this.quotaUsage.get(userId) || { count: 0 };
    const quota = this.quotas[tier];
    
    return {
      userId,
      tier,
      quota: quota.requests,
      used: quotaRecord.count,
      remaining: Math.max(0, quota.requests - quotaRecord.count),
      percentageUsed: ((quotaRecord.count / quota.requests) * 100).toFixed(1),
      periodStart,
      periodEnd,
      resetDate: new Date(periodEnd).toISOString(),
      isExceeded: quotaRecord.count >= quota.requests,
    };
  }

  /**
   * Check if quota exceeded
   */
  async checkQuota(userId, tier = 'pro') {
    const usage = await this.getCurrentUsage(userId, tier);
    
    return {
      allowed: !usage.isExceeded,
      usage,
    };
  }

  /**
   * Get detailed usage history
   */
  async getUsageHistory(userId, limit = 100) {
    if (!this.usage.has(userId)) {
      return [];
    }
    
    const allRecords = this.usage.get(userId);
    return allRecords.slice(-limit).map(r => ({
      id: r.id,
      timestamp: r.timestamp,
      endpoint: r.endpoint,
      method: r.method,
      source: r.source,
      responseTime: r.responseTime,
      status: r.status,
    }));
  }

  /**
   * Get usage breakdown by source
   */
  async getSourceBreakdown(userId) {
    if (!this.usage.has(userId)) {
      return {};
    }
    
    const records = this.usage.get(userId);
    const breakdown = {};
    
    records.forEach(r => {
      if (!breakdown[r.source]) {
        breakdown[r.source] = { count: 0, totalTime: 0 };
      }
      breakdown[r.source].count++;
      breakdown[r.source].totalTime += r.responseTime;
    });
    
    // Add averages
    Object.keys(breakdown).forEach(source => {
      breakdown[source].avgTime = (
        breakdown[source].totalTime / breakdown[source].count
      ).toFixed(0);
    });
    
    return breakdown;
  }

  /**
   * Get usage breakdown by endpoint
   */
  async getEndpointBreakdown(userId) {
    if (!this.usage.has(userId)) {
      return {};
    }
    
    const records = this.usage.get(userId);
    const breakdown = {};
    
    records.forEach(r => {
      if (!breakdown[r.endpoint]) {
        breakdown[r.endpoint] = { count: 0, errors: 0, avgTime: 0 };
      }
      breakdown[r.endpoint].count++;
      if (r.status >= 400) {
        breakdown[r.endpoint].errors++;
      }
    });
    
    return breakdown;
  }

  /**
   * Get analytics for period
   */
  async getAnalytics(userId, days = 7) {
    if (!this.usage.has(userId)) {
      return {};
    }
    
    const records = this.usage.get(userId);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    const recentRecords = records.filter(r => new Date(r.timestamp) > cutoff);
    
    const daily = {};
    recentRecords.forEach(r => {
      const day = new Date(r.timestamp).toISOString().split('T')[0];
      if (!daily[day]) {
        daily[day] = { count: 0, avgTime: 0 };
      }
      daily[day].count++;
      daily[day].avgTime += r.responseTime;
    });
    
    // Normalize averages
    Object.keys(daily).forEach(day => {
      daily[day].avgTime = (daily[day].avgTime / daily[day].count).toFixed(0);
    });
    
    return {
      period: `Last ${days} days`,
      totalRequests: recentRecords.length,
      dailyBreakdown: daily,
      avgResponseTime: (
        recentRecords.reduce((sum, r) => sum + r.responseTime, 0) / recentRecords.length
      ).toFixed(0),
    };
  }

  /**
   * Reset quota for user (admin only)
   */
  async resetQuota(userId) {
    this.quotaUsage.delete(userId);
    return { success: true, message: `Quota reset for user ${userId}` };
  }

  /**
   * Get all usage (admin only)
   */
  async getAllUsage() {
    const allUsage = {};
    
    for (const [userId, records] of this.usage.entries()) {
      allUsage[userId] = {
        totalRequests: records.length,
        lastRequest: records[records.length - 1]?.timestamp,
        currentQuotaUsage: this.quotaUsage.get(userId)?.count || 0,
      };
    }
    
    return allUsage;
  }

  /**
   * Get statistics
   */
  getStats() {
    const totalUsers = this.usage.size;
    const totalRecords = Array.from(this.usage.values()).reduce((sum, records) => sum + records.length, 0);
    
    return {
      ...this.stats,
      totalUsers,
      totalRecords,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Helper: Get current period start date
   */
  getCurrentPeriodStart() {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    return start.toISOString();
  }

  /**
   * Helper: Get next period start date
   */
  getNextPeriodStart() {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    return nextMonth.toISOString();
  }

  /**
   * Health check
   */
  healthCheck() {
    return {
      service: 'UsageTracker',
      status: 'operational',
      stats: this.getStats(),
      timestamp: new Date().toISOString(),
    };
  }
}

export default UsageTracker;
