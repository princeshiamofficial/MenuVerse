import { query } from "./mysql";
import { getClientIp } from "./rate-limit";

export type AuditAction =
  | "auth:login"
  | "auth:signup"
  | "auth:logout"
  | "staff:create"
  | "staff:update"
  | "staff:delete"
  | "role:assign"
  | "menu:update"
  | "order:create"
  | "order:status_update"
  | "settings:update"
  | "system:migration";

/**
 * Audit Logger: Logs administrative and security events into MySQL audit_logs table.
 * The audit_logs table is created centrally via runDatabaseMigrations() in migrations.ts.
 * This function only performs DML (INSERT) — no DDL here.
 */
export async function logAuditEvent(params: {
  action: AuditAction;
  userId?: string;
  restaurantId?: number;
  details?: Record<string, unknown>;
}): Promise<void> {
  const ip = getClientIp();
  const eventId = crypto.randomUUID();
  const detailsJson = params.details ? JSON.stringify(params.details) : null;

  try {
    await query(
      `INSERT INTO audit_logs (id, action, user_id, restaurant_id, ip_address, details_json)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [eventId, params.action, params.userId || null, params.restaurantId || null, ip, detailsJson],
    );
  } catch (err) {
    console.warn("[AuditLog] Warning recording audit log event:", (err as Error).message);
  }
}
