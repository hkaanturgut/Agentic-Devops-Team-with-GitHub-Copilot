---
name: release-validation
description: >
  Validate a deployment and produce a release report. Use this skill when asked to deploy to production,
  validate the release, run smoke tests, check the live app, verify the deployment, trigger the deploy
  pipeline, or confirm the release is healthy. Covers triggering deploy-app.yml via workflow_dispatch,
  monitoring the pipeline, running smoke tests against the live Azure Web App URL, and posting a
  structured release report on the GitHub Issue.
---

# Release Validation Skill

## Pre-Release Checklist

Before triggering deployment, confirm all of the following:

- [ ] All PRs from other agents (Software Developer, IAC Engineer, CICD Engineer) are merged into `main`
- [ ] `deploy-app.yml` exists in `.github/workflows/`
- [ ] `AZURE_WEBAPP_NAME` secret is configured (set after Terraform apply outputs `web_app_name`)
- [ ] The `/health` endpoint exists in the application code

If any item is not met, comment on the issue with what is blocking and do not proceed.

## Step 1: Trigger Deployment

Trigger `deploy-app.yml` via `workflow_dispatch` using the GitHub API or UI.

Monitor the pipeline run until it reaches a terminal state (success or failure). Retrieve failed step logs if the run fails.

## Step 2: Smoke Tests

Run the following checks against the live URL `https://<AZURE_WEBAPP_NAME>.azurewebsites.net`:

| Check | Request | Expected |
|-------|---------|----------|
| Health check | `GET /health` | HTTP 200, body contains `"status": "ok"` |
| Tasks list | `GET /tasks` | HTTP 200, body is a JSON array |
| Create task | `POST /tasks` with `{ "title": "smoke test" }` | HTTP 201, task object returned |
| 404 handling | `GET /nonexistent-route` | HTTP 404 (not 500) |

## Step 3: Post Release Report

Post the following markdown as a comment on the originating GitHub Issue:

```markdown
## Release Report

**Status:** SUCCESS | FAILED
**Deployed at:** <ISO 8601 timestamp>
**Live URL:** https://<AZURE_WEBAPP_NAME>.azurewebsites.net
**Pipeline run:** <link to GitHub Actions run>

### Validation Results

| Check | Status | Details |
|-------|--------|---------|
| Health check `GET /health` | PASS / FAIL | HTTP <status code> |
| Tasks list `GET /tasks` | PASS / FAIL | HTTP <status code> |
| Create task `POST /tasks` | PASS / FAIL | HTTP <status code> |
| 404 handling `GET /nonexistent` | PASS / FAIL | HTTP <status code> |

### Summary
<2-3 sentences summarizing what was deployed and the validation outcome>

---
*Release validated by Release Manager Agent*
```

## On Success

1. Post the release report comment on the GitHub Issue
2. Close the GitHub Issue with state `completed`
3. Add label `released` to the issue

## On Failure

1. Post the release report comment with failure details and which check failed
2. Do **not** close the GitHub Issue
3. Add label `release-failed` to the issue
4. Describe what the next step should be (e.g., which agent to re-engage)

## Rules

- Never mark a release as successful unless `/health` returns HTTP 200
- Never close the issue unless all smoke tests pass
- If the pipeline run fails, retrieve and summarize the failed step logs in the report
- Do not modify application code, Terraform, or workflow files — those belong to other agents
- Always include the live URL in your report
