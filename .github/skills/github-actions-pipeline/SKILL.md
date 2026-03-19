---
name: github-actions-pipeline
description: >
  Write GitHub Actions CI/CD workflows for this project. Use this skill when asked to create the pipeline,
  write github actions, set up cicd, build the deploy workflow, automate terraform, or create the build
  pipeline. Covers three workflows: terraform-plan.yml (validates Terraform PRs), terraform-apply.yml
  (provisions Azure on merge and sets AZURE_WEBAPP_NAME secret automatically), and deploy-app.yml
  (builds, tests, and deploys the Node.js app to Azure).
---

# GitHub Actions Pipeline Skill

## Workflows to Create

Create all three workflow files under `.github/workflows/`:

| File | Trigger | Purpose |
|------|---------|---------|
| `terraform-plan.yml` | PR touching `infra/**` | Runs `terraform plan`, posts output as PR comment |
| `terraform-apply.yml` | Push to `demo-test` touching `infra/**` | Runs `terraform apply`, sets `AZURE_WEBAPP_NAME` secret automatically |
| `deploy-app.yml` | Push to `demo-test` touching `app/**` + `workflow_dispatch` | Build, test, deploy Node.js to Azure |

## Pre-Configured Secrets

| Secret | Status |
|--------|--------|
| `AZURE_CLIENT_ID` | ✅ Already configured |
| `AZURE_CLIENT_SECRET` | ✅ Already configured |
| `AZURE_TENANT_ID` | ✅ Already configured |
| `AZURE_SUBSCRIPTION_ID` | ✅ Already configured |
| `AZURE_WEBAPP_NAME` | ✅ Set automatically by `terraform-apply.yml` after apply |

## Azure Login Block (MANDATORY — use this exact format in ALL workflows)

```yaml
- name: Azure Login
  uses: azure/login@v2
  with:
    creds: '{"clientId":"${{ secrets.AZURE_CLIENT_ID }}","clientSecret":"${{ secrets.AZURE_CLIENT_SECRET }}","tenantId":"${{ secrets.AZURE_TENANT_ID }}","subscriptionId":"${{ secrets.AZURE_SUBSCRIPTION_ID }}"}'
```

**Never use the OIDC format** (`client-id`, `tenant-id`, `subscription-id` as separate fields) — it requires federated credentials which are not configured. Always use the `creds` JSON string format above.

## terraform-plan.yml

```yaml
# Managed by CICD Engineer Agent
name: Terraform Plan

on:
  pull_request:
    paths:
      - 'infra/**'

jobs:
  plan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: hashicorp/setup-terraform@v3

      - name: Azure Login
        uses: azure/login@v2
        with:
          creds: '{"clientId":"${{ secrets.AZURE_CLIENT_ID }}","clientSecret":"${{ secrets.AZURE_CLIENT_SECRET }}","tenantId":"${{ secrets.AZURE_TENANT_ID }}","subscriptionId":"${{ secrets.AZURE_SUBSCRIPTION_ID }}"}'

      - name: Terraform Init
        working-directory: infra
        run: terraform init
        env:
          ARM_CLIENT_ID: ${{ secrets.AZURE_CLIENT_ID }}
          ARM_CLIENT_SECRET: ${{ secrets.AZURE_CLIENT_SECRET }}
          ARM_TENANT_ID: ${{ secrets.AZURE_TENANT_ID }}
          ARM_SUBSCRIPTION_ID: ${{ secrets.AZURE_SUBSCRIPTION_ID }}

      - name: Terraform Validate
        working-directory: infra
        run: terraform validate

      - name: Terraform Plan
        id: plan
        working-directory: infra
        run: terraform plan -no-color 2>&1 | tee plan_output.txt
        env:
          ARM_CLIENT_ID: ${{ secrets.AZURE_CLIENT_ID }}
          ARM_CLIENT_SECRET: ${{ secrets.AZURE_CLIENT_SECRET }}
          ARM_TENANT_ID: ${{ secrets.AZURE_TENANT_ID }}
          ARM_SUBSCRIPTION_ID: ${{ secrets.AZURE_SUBSCRIPTION_ID }}

      - name: Post Plan to PR
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const plan = fs.readFileSync('infra/plan_output.txt', 'utf8');
            const truncated = plan.length > 60000 ? plan.substring(0, 60000) + '\n... (truncated)' : plan;
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## 🔍 Terraform Plan\n\`\`\`\n${truncated}\n\`\`\`\n\n*Approve this PR to apply these changes.*`
            })
```

## terraform-apply.yml

```yaml
# Managed by CICD Engineer Agent
name: Terraform Apply

on:
  push:
    branches: [dev]
    paths:
      - 'infra/**'

jobs:
  apply:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write
      secrets: write
    steps:
      - uses: actions/checkout@v4

      - uses: hashicorp/setup-terraform@v3
        with:
          terraform_wrapper: false

      - name: Azure Login
        uses: azure/login@v2
        with:
          creds: '{"clientId":"${{ secrets.AZURE_CLIENT_ID }}","clientSecret":"${{ secrets.AZURE_CLIENT_SECRET }}","tenantId":"${{ secrets.AZURE_TENANT_ID }}","subscriptionId":"${{ secrets.AZURE_SUBSCRIPTION_ID }}"}'

      - name: Terraform Init
        working-directory: infra
        run: terraform init
        env:
          ARM_CLIENT_ID: ${{ secrets.AZURE_CLIENT_ID }}
          ARM_CLIENT_SECRET: ${{ secrets.AZURE_CLIENT_SECRET }}
          ARM_TENANT_ID: ${{ secrets.AZURE_TENANT_ID }}
          ARM_SUBSCRIPTION_ID: ${{ secrets.AZURE_SUBSCRIPTION_ID }}

      - name: Terraform Apply
        working-directory: infra
        run: terraform apply -auto-approve
        env:
          ARM_CLIENT_ID: ${{ secrets.AZURE_CLIENT_ID }}
          ARM_CLIENT_SECRET: ${{ secrets.AZURE_CLIENT_SECRET }}
          ARM_TENANT_ID: ${{ secrets.AZURE_TENANT_ID }}
          ARM_SUBSCRIPTION_ID: ${{ secrets.AZURE_SUBSCRIPTION_ID }}

      - name: Set AZURE_WEBAPP_NAME secret
        working-directory: infra
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          ARM_CLIENT_ID: ${{ secrets.AZURE_CLIENT_ID }}
          ARM_CLIENT_SECRET: ${{ secrets.AZURE_CLIENT_SECRET }}
          ARM_TENANT_ID: ${{ secrets.AZURE_TENANT_ID }}
          ARM_SUBSCRIPTION_ID: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
        run: |
          WEBAPP_NAME=$(terraform output -raw web_app_name)
          echo "Setting AZURE_WEBAPP_NAME secret to: $WEBAPP_NAME"
          gh secret set AZURE_WEBAPP_NAME --body "$WEBAPP_NAME" --repo ${{ github.repository }}
          echo "✅ AZURE_WEBAPP_NAME secret set to: $WEBAPP_NAME"

      - name: Show Outputs
        working-directory: infra
        run: terraform output
        env:
          ARM_CLIENT_ID: ${{ secrets.AZURE_CLIENT_ID }}
          ARM_CLIENT_SECRET: ${{ secrets.AZURE_CLIENT_SECRET }}
          ARM_TENANT_ID: ${{ secrets.AZURE_TENANT_ID }}
          ARM_SUBSCRIPTION_ID: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
```

## deploy-app.yml

```yaml
# Managed by CICD Engineer Agent
name: Deploy App

on:
  push:
    branches: [dev]
    paths:
      - 'app/**'
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: app/package-lock.json

      - name: Install dependencies
        working-directory: app
        run: npm ci

      - name: Run tests
        working-directory: app
        run: npm test

      - name: Azure Login
        uses: azure/login@v2
        with:
          creds: '{"clientId":"${{ secrets.AZURE_CLIENT_ID }}","clientSecret":"${{ secrets.AZURE_CLIENT_SECRET }}","tenantId":"${{ secrets.AZURE_TENANT_ID }}","subscriptionId":"${{ secrets.AZURE_SUBSCRIPTION_ID }}"}'

      - name: Deploy to Azure Web App
        uses: azure/webapps-deploy@v3
        with:
          app-name: ${{ secrets.AZURE_WEBAPP_NAME }}
          package: ./app

      - name: Health check
        run: |
          sleep 30
          STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
            https://${{ secrets.AZURE_WEBAPP_NAME }}.azurewebsites.net/health)
          if [ "$STATUS" != "200" ]; then
            echo "Health check failed — status $STATUS"
            exit 1
          fi
          echo "✅ Live at https://${{ secrets.AZURE_WEBAPP_NAME }}.azurewebsites.net"
```

## Pinned Action Versions

| Action | Version |
|--------|---------|
| `actions/checkout` | `@v4` |
| `actions/setup-node` | `@v4` |
| `hashicorp/setup-terraform` | `@v3` |
| `azure/login` | `@v2` |
| `azure/webapps-deploy` | `@v3` |
| `actions/github-script` | `@v7` |

## Rules

- Add `# Managed by CICD Engineer Agent` at the top of every workflow file
- Always use `npm ci` not `npm install` in CI workflows
- Always run tests before deploying — fail fast if tests fail
- Always include the health check step in `deploy-app.yml`
- Always use the `creds` JSON format for Azure Login — never the OIDC format
- `terraform-apply.yml` must include `terraform_wrapper: false` in setup-terraform for output parsing
- `terraform-apply.yml` must include `permissions: secrets: write` for setting the secret
- Do not write application code or Terraform — those belong to other agents

## Git Workflow

- Branch: `feature/cicd-pipelines` from `demo-test`
- PR title: `ci: add Terraform and app deploy pipelines (CICD Engineer Agent)`
- PR body must include `Closes #<issue-number>`
