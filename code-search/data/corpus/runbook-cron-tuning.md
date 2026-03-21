# Cron Tuning Runbook

When a scheduled job moves from healthy to degraded, compare recent runtime duration against a 7-day baseline. If the runtime grows by more than 30 percent, inspect upstream dependencies and queue depth before changing the schedule.

For search indexing jobs:

1. Rebuild the lexical index first.
2. Confirm whether Ollama is reachable.
3. If the embedding provider is unavailable, continue serving lexical results and alert the operator through the dashboard.

