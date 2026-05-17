# Iatrics Load And Stress Tests

These tests use k6 to simulate many users creating consultations.

## Install k6

macOS:

```bash
brew install k6
```

Or use the official install guide for your OS.

## Start Backend

Run the backend against a disposable test or staging database:

```bash
cd /Users/mac/IatricsProjects/iatrics_workspace/iatrics_backend
npm start
```

Avoid running stress tests against production unless you have an approved maintenance window.

The backend has a global rate limiter enabled by default. For load testing, either disable it or raise it when starting the backend:

```bash
DISABLE_RATE_LIMIT=true npm start
```

Or:

```bash
RATE_LIMIT_MAX=100000 RATE_LIMIT_WINDOW_MS=900000 npm start
```

If you see about 100 requests succeed and then nearly every k6 request fails, the rate limiter is still active.

If register/login/provider creation pass but every consultation fails, repair the local consultation foreign keys:

```bash
npm run db:repair-consultations
```

This updates the legacy `Consultations` foreign keys to reference the current lowercase `users` and `providers` tables.

If the database user is not the owner of the legacy `Consultations` table, the repair command may fail with `must be owner of table Consultations`. In that case, the API will still create consultations by omitting legacy-mismatched FK columns after validating the current provider exists.

## Load Test

Moderate traffic profile:

```bash
BASE_URL=http://localhost:5002 npm run load:consultations
```

Default profile:

- Ramp to 10 virtual users for 30 seconds.
- Hold/ramp to 25 virtual users for 2 minutes.
- Ramp down for 30 seconds.

## Stress Test

Higher traffic profile:

```bash
BASE_URL=http://localhost:5002 npm run stress:consultations
```

Stress profile:

- Ramp to 25 virtual users for 1 minute.
- Ramp to 75 virtual users for 2 minutes.
- Ramp to 150 virtual users for 2 minutes.
- Ramp down for 1 minute.

## Useful Environment Variables

- `BASE_URL`: backend URL. Defaults to `http://localhost:5002`.
- `K6_SCENARIO`: `load` or `stress`.
- `TEST_PASSWORD`: password used for generated test users.
- `SLEEP_SECONDS`: delay between virtual-user iterations. Defaults to `1`.

Example:

```bash
BASE_URL=https://staging-api.example.com SLEEP_SECONDS=0.5 npm run load:consultations
```

## What The Test Does

Each virtual user iteration:

1. Registers a unique user.
2. Logs the user in.
3. Creates a provider profile.
4. Creates a video consultation.

## Pass Criteria

k6 thresholds currently require:

- HTTP failure rate below 5%.
- 95th percentile HTTP duration below 1000 ms.
- Consultation creation success rate above 95%.
- 95th percentile consultation-create duration below 1000 ms.

## Watch During Runs

- API response time.
- Database CPU and connection count.
- Memory usage.
- Error logs.
- Duplicate-user or unique-constraint failures.
- Consultation rows created per minute.
- Socket/Redis impact if realtime flows are enabled later.

## Cleanup

The test creates users, providers, and consultations with emails ending in `@load.test`.
Clean the staging database after runs if needed.
