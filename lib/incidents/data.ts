export type IncidentSeverity = "critical" | "high" | "medium" | "low"
export type IncidentStatus = "open" | "investigating" | "mitigated" | "resolved"

export interface RootCause {
  category: string
  description: string
  confidence: number // 0–1
}

export interface Incident {
  id: string
  title: string
  severity: IncidentSeverity
  status: IncidentStatus
  service: string
  environment: string
  startedAt: string
  resolvedAt?: string
  description: string
  rootCause?: RootCause
  affectedSystems: string[]
  timeline: { at: string; event: string }[]
  remediationSteps?: string[]
  tags: string[]
}

// Seed data — realistic integration failure scenarios
export const INCIDENTS: Incident[] = [
  {
    id: "INC-001",
    title: "Payment Gateway Timeout Cascade",
    severity: "critical",
    status: "open",
    service: "payments-service",
    environment: "production",
    startedAt: "2025-04-28T03:14:00Z",
    description:
      "The Stripe webhook processor began returning HTTP 504 gateway timeouts, causing a downstream cascade that blocked checkout completions across all regions. Error rate spiked to 94% within 3 minutes of onset.",
    rootCause: {
      category: "External Dependency Failure",
      description:
        "Database connection pool exhaustion on the payments DB replica caused query latency to exceed the 30s webhook timeout threshold.",
      confidence: 0.91,
    },
    affectedSystems: ["payments-service", "checkout-api", "order-service", "notification-worker"],
    timeline: [
      { at: "2025-04-28T03:14:00Z", event: "First 504 errors detected on /api/webhooks/stripe" },
      { at: "2025-04-28T03:16:30Z", event: "PagerDuty alert triggered — error rate >10%" },
      { at: "2025-04-28T03:21:00Z", event: "Error rate reached 94%; checkout fully blocked" },
      { at: "2025-04-28T03:35:00Z", event: "On-call engineer began investigation" },
      { at: "2025-04-28T04:02:00Z", event: "DB connection pool limit increased from 50 to 200" },
    ],
    remediationSteps: [
      "Increase payments DB connection pool limit to 200",
      "Add circuit breaker around Stripe webhook processor",
      "Set max-connections alert at 80% pool utilization",
      "Add read replica with auto-failover",
    ],
    tags: ["payments", "database", "connection-pool", "stripe"],
  },
  {
    id: "INC-002",
    title: "Auth Service Redis Cache Miss Storm",
    severity: "high",
    status: "investigating",
    service: "auth-service",
    environment: "production",
    startedAt: "2025-04-29T11:45:00Z",
    description:
      "Redis cluster failover triggered a full cache invalidation. All session lookups fell through to PostgreSQL, causing 10x normal query load and 3s+ login latency for ~40k concurrent users.",
    rootCause: {
      category: "Cache Infrastructure Failure",
      description:
        "Redis sentinel misconfiguration caused a split-brain scenario during a rolling upgrade, evicting all keys.",
      confidence: 0.78,
    },
    affectedSystems: ["auth-service", "user-api", "dashboard-frontend"],
    timeline: [
      { at: "2025-04-29T11:45:00Z", event: "Redis cluster failover initiated by rolling upgrade" },
      { at: "2025-04-29T11:47:00Z", event: "Cache hit rate dropped from 99% to 0%" },
      { at: "2025-04-29T11:48:00Z", event: "PostgreSQL CPU spiked to 100%" },
      { at: "2025-04-29T11:52:00Z", event: "Login latency p99 exceeded 3s" },
      { at: "2025-04-29T12:10:00Z", event: "Warm-up job started to repopulate cache" },
    ],
    remediationSteps: [
      "Fix Redis sentinel quorum configuration",
      "Add cache warm-up job triggered on failover events",
      "Implement stale-while-revalidate pattern for session cache",
      "Rate-limit DB fallback to prevent thundering herd",
    ],
    tags: ["auth", "redis", "cache", "database", "latency"],
  },
  {
    id: "INC-003",
    title: "Notification Worker Dead Letter Queue Overflow",
    severity: "high",
    status: "mitigated",
    service: "notification-worker",
    environment: "production",
    startedAt: "2025-04-27T18:00:00Z",
    resolvedAt: "2025-04-27T21:30:00Z",
    description:
      "SQS dead letter queue reached its maximum depth of 100k messages. Email and SMS notifications for password resets and order confirmations were silently dropped for ~2 hours.",
    rootCause: {
      category: "Message Queue Misconfiguration",
      description:
        "A new template variable introduced a null-pointer exception in the notification serializer, causing every message to fail and be routed to DLQ.",
      confidence: 0.97,
    },
    affectedSystems: ["notification-worker", "email-service", "sms-gateway"],
    timeline: [
      { at: "2025-04-27T18:00:00Z", event: "Notification worker began throwing NullPointerException" },
      { at: "2025-04-27T18:01:00Z", event: "DLQ depth started climbing" },
      { at: "2025-04-27T19:45:00Z", event: "DLQ reached 100k cap — messages dropped" },
      { at: "2025-04-27T20:15:00Z", event: "Customer support tickets flagged missing emails" },
      { at: "2025-04-27T20:30:00Z", event: "Root cause identified: null template variable" },
      { at: "2025-04-27T21:30:00Z", event: "Hotfix deployed; DLQ replay initiated" },
    ],
    remediationSteps: [
      "Add null-safety checks in notification serializer",
      "Set DLQ depth alarm at 1k messages (not 100k)",
      "Add canary deployment check for notification worker",
      "Implement DLQ auto-replay on hotfix deployment",
    ],
    tags: ["notifications", "sqs", "dlq", "serializer"],
  },
  {
    id: "INC-004",
    title: "API Rate Limiter False Positives — Partners Blocked",
    severity: "medium",
    status: "resolved",
    service: "api-gateway",
    environment: "production",
    startedAt: "2025-04-26T09:00:00Z",
    resolvedAt: "2025-04-26T10:45:00Z",
    description:
      "A misconfigured rate limiter applied partner-tier limits to enterprise accounts after a config deploy. Three enterprise partners were blocked for 1h45m, impacting their production integrations.",
    rootCause: {
      category: "Configuration Error",
      description:
        "A Terraform change incorrectly mapped enterprise account IDs to the 'partner' rate limit tier in the API gateway config.",
      confidence: 0.99,
    },
    affectedSystems: ["api-gateway", "rate-limiter"],
    timeline: [
      { at: "2025-04-26T09:00:00Z", event: "Terraform config deployed to production" },
      { at: "2025-04-26T09:05:00Z", event: "Enterprise partner A reported 429 errors" },
      { at: "2025-04-26T09:30:00Z", event: "Two more partners reported same issue" },
      { at: "2025-04-26T09:45:00Z", event: "Rollback of rate limiter config initiated" },
      { at: "2025-04-26T10:45:00Z", event: "All enterprise accounts restored" },
    ],
    remediationSteps: [
      "Add config validation test for account tier mappings",
      "Implement canary deployment for rate limiter config changes",
      "Add partner/enterprise 429 alert to on-call runbook",
    ],
    tags: ["api-gateway", "rate-limiting", "configuration", "terraform"],
  },
  {
    id: "INC-005",
    title: "Data Pipeline Schema Mismatch — Reports Corrupted",
    severity: "high",
    status: "open",
    service: "data-pipeline",
    environment: "production",
    startedAt: "2025-04-30T06:00:00Z",
    description:
      "A breaking schema change in the events Kafka topic caused the downstream analytics pipeline to silently write null values for all `user_id` fields. 24h of report data is affected.",
    rootCause: {
      category: "Schema Evolution Failure",
      description:
        "Producer added a required field `user_id_v2` without backward-compatible schema evolution. Consumers using old schema version silently coerced it to null.",
      confidence: 0.88,
    },
    affectedSystems: ["data-pipeline", "analytics-service", "reporting-dashboard"],
    timeline: [
      { at: "2025-04-30T06:00:00Z", event: "New producer schema deployed" },
      { at: "2025-04-30T06:01:00Z", event: "Pipeline consumers began writing null user_id values" },
      { at: "2025-04-30T14:00:00Z", event: "Analytics team flagged incorrect user attribution in reports" },
      { at: "2025-04-30T15:30:00Z", event: "Schema mismatch identified as root cause" },
    ],
    remediationSteps: [
      "Enforce schema registry compatibility check (BACKWARD mode)",
      "Replay 24h of events through corrected consumer",
      "Add schema version alerting on consumer lag",
      "Require schema evolution approval for breaking changes",
    ],
    tags: ["kafka", "schema", "data-pipeline", "analytics"],
  },
]

export type TimeRange = "1h" | "6h" | "24h" | "7d" | "30d"
