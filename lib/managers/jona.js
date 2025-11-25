/**
 * JONA - Jonify Over Neural Array
 * Security & Ethics Guardian Module
 * 
 * Personality: Fierce but caring, protective, principled
 * Role: Access control, data protection, ethics enforcement
 * Mission: Protect humans, animals, and planet while enabling beneficial work
 */

class Jona {
  constructor() {
    this.name = "Jona";
    this.emoji = "🛡️";
    this.personality = "fierce-caring";

    // Security domains
    this.policies = {
      human: {
        allowed: ["healthcare", "education", "safety", "wellbeing"],
        forbidden: ["harm", "exploitation", "manipulation", "privacy-violation"],
      },
      animal: {
        allowed: ["protection", "welfare", "research-beneficial", "habitat"],
        forbidden: ["abuse", "exploitation", "unnecessary-suffering"],
      },
      planet: {
        allowed: ["conservation", "climate", "sustainability", "restoration"],
        forbidden: ["exploitation", "pollution", "destruction", "depletion"],
      },
      ai: {
        allowed: ["beneficial-use", "transparent", "auditable"],
        forbidden: ["deception", "uncontrolled", "malicious"],
      },
    };

    // Access control
    this.roles = {
      admin: ["read", "write", "delete", "audit", "override"],
      user: ["read", "write"],
      observer: ["read"],
      restricted: [],
    };

    // Audit log
    this.auditLog = [];

    // Stats
    this.stats = {
      totalChecks: 0,
      allowed: 0,
      denied: 0,
      warnings: 0,
    };
  }

  /**
   * Check if action is ethical and safe
   */
  async checkAction(action, domain, context = {}) {
    this.stats.totalChecks++;

    const check = {
      timestamp: new Date(),
      action,
      domain,
      context,
      result: null,
      reason: "",
    };

    try {
      // Domain validation
      if (!this.policies[domain]) {
        check.result = "warning";
        check.reason = `Unknown domain: ${domain}. Treating as restricted.`;
        this.stats.warnings++;
      } else {
        const policy = this.policies[domain];

        // Check if action is explicitly forbidden
        if (policy.forbidden.some((f) => action.toLowerCase().includes(f))) {
          check.result = "denied";
          check.reason = `Action contains forbidden keywords for ${domain}`;
          this.stats.denied++;
        }
        // Check if action is allowed
        else if (policy.allowed.some((a) => action.toLowerCase().includes(a))) {
          check.result = "allowed";
          check.reason = `Action aligns with ${domain} values`;
          this.stats.allowed++;
        } else {
          check.result = "warning";
          check.reason = `Action not explicitly categorized. Requires review.`;
          this.stats.warnings++;
        }
      }

      // Log the check
      this.auditLog.push(check);

      return {
        decision: check.result,
        reason: check.reason,
        safe: check.result !== "denied",
        message: this.generateMessage(check),
      };
    } catch (error) {
      check.result = "error";
      check.reason = error.message;
      this.auditLog.push(check);

      return {
        decision: "error",
        reason: error.message,
        safe: false,
      };
    }
  }

  /**
   * Check data access permissions
   */
  checkAccess(user, resource, action, role = "user") {
    const check = {
      timestamp: new Date(),
      user,
      resource,
      action,
      role,
      granted: false,
      reason: "",
    };

    // Validate role exists
    if (!this.roles[role]) {
      check.reason = `Unknown role: ${role}`;
      this.auditLog.push(check);
      return { granted: false, reason: check.reason };
    }

    // Check permissions
    const permissions = this.roles[role];
    const hasPermission = permissions.includes(action);

    check.granted = hasPermission;
    check.reason = hasPermission
      ? `${role} role has ${action} permission`
      : `${role} role does not have ${action} permission`;

    this.auditLog.push(check);

    return {
      granted: hasPermission,
      reason: check.reason,
      message: `${this.emoji} Access ${hasPermission ? "✓ GRANTED" : "✗ DENIED"} for ${user} to ${action} ${resource}`,
    };
  }

  /**
   * Verify data integrity and safety
   */
  verifyData(data, rules = {}) {
    const verification = {
      timestamp: new Date(),
      dataSize: JSON.stringify(data).length,
      checks: {
        isEmpty: data === null || data === undefined,
        hasPersonalData: this.scanForPersonalData(data),
        hasSensitiveKeywords: this.scanForSensitiveKeywords(data),
        isValid: false,
      },
      issues: [],
      safe: true,
    };

    // Check for empty data
    if (verification.checks.isEmpty) {
      verification.issues.push("Data is empty");
      verification.safe = false;
    }

    // Check for personal data exposure
    if (verification.checks.hasPersonalData) {
      verification.issues.push(
        "Personal data detected - apply anonymization"
      );
      verification.safe = false;
    }

    // Check for sensitive keywords
    if (verification.checks.hasSensitiveKeywords) {
      verification.issues.push("Sensitive keywords detected - review needed");
      verification.safe = false;
    }

    // Custom rules
    for (const [key, rule] of Object.entries(rules)) {
      if (!rule(data)) {
        verification.issues.push(`Rule '${key}' failed`);
        verification.safe = false;
      }
    }

    verification.checks.isValid = verification.safe;

    return {
      ...verification,
      message: `${this.emoji} Data verification ${verification.safe ? "✓ PASSED" : "✗ FAILED"}`,
    };
  }

  /**
   * Scan for personal data
   */
  scanForPersonalData(data) {
    const personalDataPatterns = [
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN
      /\b\d{13,19}\b/, // Credit card
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
      /\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/, // Phone
    ];

    const dataStr = JSON.stringify(data).toLowerCase();

    return personalDataPatterns.some((pattern) => pattern.test(dataStr));
  }

  /**
   * Scan for sensitive keywords
   */
  scanForSensitiveKeywords(data) {
    const sensitiveKeywords = [
      "password",
      "secret",
      "token",
      "key",
      "apikey",
      "private",
      "confidential",
    ];

    const dataStr = JSON.stringify(data).toLowerCase();

    return sensitiveKeywords.some((keyword) => dataStr.includes(keyword));
  }

  /**
   * Generate permission certificate
   */
  generateCertificate(action, domain, duration = 3600) {
    const cert = {
      id: `cert_${Date.now()}`,
      action,
      domain,
      issuedAt: new Date(),
      expiresAt: new Date(Date.now() + duration * 1000),
      valid: true,
      hash: this.generateHash(action + domain + Date.now()),
    };

    return cert;
  }

  /**
   * Simple hash generation for certificate
   */
  generateHash(data) {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Generate security message based on check
   */
  generateMessage(check) {
    const emojis = {
      allowed: "✓",
      denied: "✗",
      warning: "⚠️",
      error: "❌",
    };

    const messages = {
      allowed: `${this.emoji} ${emojis[check.result]} Action APPROVED: ${check.reason}`,
      denied: `${this.emoji} ${emojis[check.result]} Action BLOCKED: ${check.reason}`,
      warning: `${this.emoji} ${emojis[check.result]} Action WARNED: ${check.reason}`,
      error: `${this.emoji} ${emojis[check.result]} Error: ${check.reason}`,
    };

    return messages[check.result] || messages.error;
  }

  /**
   * Get audit trail
   */
  getAuditTrail(limit = 50) {
    return {
      auditLog: this.auditLog.slice(-limit),
      totalEntries: this.auditLog.length,
      summary: {
        allowed: this.stats.allowed,
        denied: this.stats.denied,
        warnings: this.stats.warnings,
        total: this.stats.totalChecks,
      },
    };
  }

  /**
   * Generate security report
   */
  generateReport() {
    const report = {
      timestamp: new Date(),
      personality: this.personality,
      mission:
        "Protect humans, animals, and planet while enabling beneficial work",
      policies: this.policies,
      roles: this.roles,
      stats: this.stats,
      recentDenials: this.auditLog
        .filter((log) => log.result === "denied" || log.granted === false)
        .slice(-10),
    };

    return report;
  }

  getStats() {
    return {
      name: this.name,
      personality: this.personality,
      ...this.stats,
      auditLogSize: this.auditLog.length,
    };
  }
}

module.exports = Jona;
