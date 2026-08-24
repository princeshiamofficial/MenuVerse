# aMenuVerse — Operations & Monitoring Runbook

> Last updated: 2026-08-07

---

## 1. CI/CD Pipeline Overview

```
push to dev/main/master
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│  JOB 1 · static-analysis (TypeScript + ESLint + Prettier)  │
│  JOB 2 · unit-tests         (security, migrations, backup)  │
│  JOB 3 · integration-tests  (RBAC, Zod, price, tenant)     │
│  JOB 4 · database-tests     (MySQL 8 service container)     │
│  JOB 5 · security-tests     (npm audit + secret scan)      │
│  JOB 6 · build              (vite build)                    │
│  JOB 7 · deploy             (main/master only)              │
│  JOB 8 · health-check       (post-deploy /api/health)       │
└─────────────────────────────────────────────────────────────┘
```

Nightly scheduled scan: **02:00 UTC** (jobs 1, 5)

---

## 2. Required GitHub Secrets

| Secret Name          | Description                             | Example                                |
| -------------------- | --------------------------------------- | -------------------------------------- |
| `VITE_IMGBB_API_KEY` | ImgBB CDN API key                       | (stored only in GitHub Secrets)        |
| `SESSION_SECRET`     | Cryptographically random 64-char string | `openssl rand -hex 32`                 |
| `MYSQL_HOST`         | Production DB host                      | `your-db.railway.app`                  |
| `MYSQL_USER`         | DB app user (NOT root)                  | `menuverse_app`                        |
| `MYSQL_PASSWORD`     | DB app user password                    | (generated random string)              |
| `MYSQL_DATABASE`     | Database name                           | `amenuverse_prod`                      |
| `PRODUCTION_URL`     | Production URL for health check probe   | `https://your-app.railway.app`         |
| `SLACK_WEBHOOK`      | (Optional) Slack channel for CI alerts  | `https://hooks.slack.com/services/...` |

---

## 3. Running Tests Locally

```bash
# TypeScript type check
npm run typecheck

# ESLint
npm run lint

# Prettier format check
npx prettier --check .

# All unit tests (security, migrations, backup)
npm run test:migration
npm run test:backup
npm run test:security

# Integration tests (no DB needed)
npx tsx scripts/integration-test.ts

# Dependency & secret scan
npx tsx scripts/dependency-scan.ts

# Run ALL CI checks locally in sequence
npm run test:all
```

---

## 4. Health Check Endpoint

**Endpoint:** `GET /api/health`

**Healthy Response (HTTP 200):**

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2026-08-07T12:00:00.000Z",
  "uptime_seconds": 86400,
  "checks": {
    "database": { "ok": true, "latency_ms": 3 },
    "environment": { "ok": true }
  }
}
```

**Unhealthy Response (HTTP 503):**

```json
{
  "status": "unhealthy",
  "checks": {
    "database": { "ok": false, "error": "ECONNREFUSED" },
    "environment": { "ok": true }
  }
}
```

### Uptime Monitor Setup

| Service       | URL to Monitor          | Expected Status | Check Interval |
| ------------- | ----------------------- | --------------- | -------------- |
| UptimeRobot   | `{PROD_URL}/api/health` | HTTP 200        | 5 minutes      |
| Better Uptime | `{PROD_URL}/api/health` | HTTP 200        | 1 minute       |

---

## 5. Audit Log Monitoring

Audit events are written to the `audit_logs` MySQL table automatically for all security-critical actions:

| Action                | Trigger                                 |
| --------------------- | --------------------------------------- |
| `auth:login`          | Every successful login                  |
| `auth:signup`         | New account registration                |
| `auth:logout`         | Logout                                  |
| `staff:create`        | New staff member added                  |
| `staff:update`        | Staff profile updated                   |
| `staff:delete`        | Staff account deleted                   |
| `role:assign`         | Role changed for any user               |
| `order:create`        | New order placed                        |
| `order:status_update` | Order status changed (preparing, ready) |
| `menu:update`         | Menu item or category modified          |
| `settings:update`     | Restaurant settings changed             |
| `system:migration`    | Database migration ran                  |

**Query recent suspicious events:**

```sql
SELECT action, user_id, ip_address, created_at
FROM audit_logs
WHERE action IN ('auth:login', 'staff:delete', 'role:assign')
  AND created_at > NOW() - INTERVAL 24 HOUR
ORDER BY created_at DESC
LIMIT 100;
```

---

## 6. Automated Database Backups

### Via mysqldump (recommended for Railway/VPS)

```bash
# Create a backup snapshot
mysqldump -h $MYSQL_HOST -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE \
  --single-transaction --routines --triggers \
  > backups/amenuverse_$(date +%Y%m%d_%H%M%S).sql

# Verify backup integrity (must contain expected tables)
grep -c "CREATE TABLE" backups/latest.sql
```

### Restore Integrity Test

```bash
# Run the automated restore integrity test (CI-safe, no live DB needed)
node scripts/backup-restore-test.js
```

### Backup Schedule (Cron on VPS or Railway cron job)

```cron
# Daily backup at 03:00
0 3 * * * /opt/scripts/backup-amenuverse.sh

# Weekly full backup on Sundays at 04:00
0 4 * * 0 /opt/scripts/backup-full-amenuverse.sh
```

---

## 7. Security Testing Schedule

| Test Type                     | Frequency           | Script/Tool                         |
| ----------------------------- | ------------------- | ----------------------------------- |
| npm audit (HIGH+)             | Every CI push       | `npm audit --audit-level=high`      |
| Secret detection              | Every CI push       | `scripts/dependency-scan.ts`        |
| XSS / MIME pen tests          | Every CI push       | `scripts/security-test.js`          |
| Integration contracts         | Every CI push       | `scripts/integration-test.ts`       |
| Full dependency scan report   | Nightly (02:00 UTC) | GitHub Actions scheduled workflow   |
| Manual penetration testing    | Quarterly           | External security firm / OWASP ZAP  |
| Dependency vulnerability scan | Nightly             | `npm audit` + `scripts/dep-scan.ts` |

---

## 8. Incident Response

### P1 — Production Down

1. Check `/api/health` endpoint directly
2. Check MySQL connection (database check in health response)
3. Check Railway / VPS process manager: `pm2 status`
4. Restart if needed: `pm2 restart amenuverse`
5. Check `audit_logs` for recent `system:migration` events that may have caused breakage
6. Rollback: restore from latest nightly backup

### P2 — Security Incident (unauthorized access)

1. Immediately rotate: `SESSION_SECRET`, `MYSQL_PASSWORD`, `VITE_IMGBB_API_KEY`
2. Invalidate all active sessions (truncate `sessions` table)
3. Query `audit_logs` for suspicious IP addresses and actions
4. Block offending IPs at reverse proxy / firewall level
5. Notify affected restaurant tenants

---

## 9. PM2 Process Management (VPS)

```bash
# Start / restart
pm2 restart ecosystem.config.cjs

# View logs
pm2 logs amenuverse --lines 100

# Monitor CPU/memory
pm2 monit
```

---

## 10. Docker Health Check

The `Dockerfile` should include a health check directive:

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1
```

---

_This runbook is automatically kept in sync with the CI/CD workflow at `.github/workflows/ci-cd.yml`._
