import { AuditLog } from '../models/AuditLog';

export const logAudit = async (
  action: string,
  resource: string,
  options?: {
    userId?: string;
    userEmail?: string;
    resourceId?: string;
    metadata?: Record<string, any>;
  }
) => {
  try {
    await AuditLog.create({
      action,
      resource,
      userId: options?.userId,
      userEmail: options?.userEmail,
      resourceId: options?.resourceId,
      metadata: options?.metadata,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('[AuditLog] Failed to record audit log:', error);
  }
};
