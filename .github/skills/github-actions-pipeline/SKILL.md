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
| `terraform-plan.yml` | PR touching `infra/**` targeting `<BASE_BRANCH>` | Runs `terraform plan` |
| `terraform-apply.yml` | Push to `<BASE_BRANCH>` touching `infra/**` | Runs `terraform apply`, sets `AZURE_WEBAPP_NAME` secret automatically |
| `deploy-app.yml` | Push to `<BASE_BRANCH>` touching `app/**` + `workflow_dispatch` | Build and deploy Node.js to Azure |

## Base Branch

Use whatever branch is specified in the GitHub Issue (e.g. `demo-test`, `main`).
Replace every `<BASE_BRANCH>` placeholder with that branch name.
**Never hardcode `dev` or any other branch.**

## Pre-Configured Secrets

| Secret | Status |
|--------|--------|
| `AZURE_CLIENT_ID` | ✅ Already configured |
| `AZURE_CLIENT_SECRET` | ✅ Already configured |
| `AZURE_TENANT_ID` | ✅ Already configured |
| `AZURE_SUBSCRIPTION_ID` | ✅ Already configured |
| `AZURE_WEBAPP_NAME` | ✅ Set automatically by `terraform-apply.yml` after apply |

## ⚠️ CRITICAL: Copy These Workflows EXACTLY

These are battle-tested. Do NOT restructure, add extra steps, change the init approach,
remove `environment: copilot`, or move `working-directory` to individual steps.

---

## terraform-plan.yml

```yaml
# Managed by CICD Engineer Agent
name: Terraform Plan

on:
  pull_request:
    branches:
      - <BASE_BRANCH>
    paths:
      - 'infra/**'

permissions:
  contents: read
  pull-requests: write

jobs:
  terraform-plan:
    name: Terraform Plan
    runs-on: ubuntu-latest
    environment: copilot

    defaults:
      run:
        working-directory: infra

    env:
      ARM_CLIENT_ID: ${{ secrets.AZURE_CLIENT_ID }}
      ARM_CLIENT_SECRET: ${{ secrets.AZURE_CLIENT_SECRET }}
      ARM_TENANT_ID: ${{ secrets.AZURE_TENANT_ID }}
      ARM_SUBSCRIPTION_ID: ${{ secrets.AZURE_SUBSCRIPTION_ID }}

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Login to Azure
        uses: azure/login@v2
        with:
          creds: '{"clientId":"${{ secrets.AZURE_CLIENT_ID }}","clientSecret":"${{ secrets.AZURE_CLIENT_SECRET }}","subscriptionId":"${{ secrets.AZURE_SUBSCRIPTION_ID }}","tenantId":"${{ secrets.AZURE_TENANT_ID }}"}'

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3

      - name: Terraform Init
        run: |
          terraform init \
            -backend-config="storage_account_name=satfbackenddemo" \
            -backend-config="container_name=tfstate" \
            -backend-config="resource_group_name=rg-cc-agent-tf-backend" \
            -backend-config="key=task-mgmt-api.tfstate"

      - name: Terraform Validate
        run: terraform validate

      - name: Terraform Plan
        run: terraform plan -no-color
```

---

## terraform-apply.yml

```yaml
# Managed by CICD Engineer Agent
name: Terraform Apply

on:
  push:
    branches:
      - <BASE_BRANCH>
    paths:
      - 'infra/**'

permissions:
  contents: read

jobs:
  terraform-apply:
    name: Terraform Apply
    runs-on: ubuntu-latest
    environment: copilot

    defaults:
      run:
        working-directory: infra

    env:
      ARM_CLIENT_ID: ${{ secrets.AZURE_CLIENT_ID }}
      ARM_CLIENT_SECRET: ${{ secrets.AZURE_CLIENT_SECRET }}
      ARM_TENANT_ID: ${{ secrets.AZURE_TENANT_ID }}
      ARM_SUBSCRIPTION_ID: ${{ secrets.AZURE_SUBSCRIPTION_ID }}

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Login to Azure
        uses: azure/login@v2
        with:
          creds: '{"clientId":"${{ secrets.AZURE_CLIENT_ID }}","clientSecret":"${{ secrets.AZURE_CLIENT_SECRET }}","subscriptionId":"${{ secrets.AZURE_SUBSCRIPTION_ID }}","tenantId":"${{ secrets.AZURE_TENANT_ID }}"}'

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_wrapper: false

      - name: Terraform Init
        run: |
          terraform init \
            -backend-config="storage_account_name=satfbackenddemo" \
            -backend-config="container_name=tfstate" \
            -backend-config="resource_group_name=rg-cc-agent-tf-backend" \
            -backend-config="key=task-mgmt-api.tfstate"

      - name: Terraform Apply
        run: terraform apply -auto-approve -no-color

      - name: Set AZURE_WEBAPP_NAME secret
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          WEBAPP_NAME=$(terraform output -raw web_app_name)
          echo "Setting AZURE_WEBAPP_NAME to: $WEBAPP_NAME"
          gh secret set AZURE_WEBAPP_NAME --body "$WEBAPP_NAME" --repo ${{ github.repository }}
          echo "✅ AZURE_WEBAPP_NAME set to: $WEBAPP_NAME"
```

---

## deploy-app.yml

```yaml
# Managed by CICD Engineer Agent
name: Deploy App

on:
  push:
    branches:
      - <BASE_BRANCH>
    paths:
      - 'app/**'
  workflow_dispatch:

permissions:
  contents: read

jobs:
  build-and-deploy:
    name: Build and Deploy to Azure Web App
    runs-on: ubuntu-latest
    environment: copilot

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        working-directory: app
        run: npm ci

      - name: Login to Azure
        uses: azure/login@v2
        with:
          creds: '{"clientId":"${{ secrets.AZURE_CLIENT_ID }}","clientSecret":"${{ secrets.AZURE_CLIENT_SECRET }}","subscriptionId":"${{ secrets.AZURE_SUBSCRIPTION_ID }}","tenantId":"${{ secrets.AZURE_TENANT_ID }}"}'

      - name: Deploy to Azure Web App
        uses: azure/webapps-deploy@v3
        with:
          app-name: ${{ secrets.AZURE_WEBAPP_NAME }}
          package: app

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

---

## Pinned Action Versions

| Action | Version |
|--------|---------|
| `actions/checkout` | `@v4` |
| `actions/setup-node` | `@v4` |
| `hashicorp/setup-terraform` | `@v3` |
| `azure/login` | `@v2` |
| `azure/webapps-deploy` | `@v3` |

## Rules

- **Copy workflows EXACTLY** — do not restructure, reorder steps, or add extras
- Always replace `<BASE_BRANCH>` with the actual base branch from the GitHub Issue
- Always use `environment: copilot` on every job — secrets are scoped to this environment and jobs WILL FAIL without it
- Always use `defaults: run: working-directory: infra` on Terraform jobs — never `working-directory:` on individual steps
- Always use `terraform_wrapper: false` on terraform-apply — required for `terraform output -raw` to work
- Always use `-backend-config` flags on `terraform init` — never rely on inline backend blocks
- Always use the `creds` JSON string format for Azure Login — never the OIDC format with separate fields
- Never add `npm test` or `npm cache` to deploy-app.yml — not configured in this project
- Never add a "Show Outputs" step — not in the working template
- Add `# Managed by CICD Engineer Agent` at the top of every workflow file
- Do not write application code or Terraform — those belong to other agents

## Git Workflow

- Branch: `feature/cicd-pipelines` from `<BASE_BRANCH>` (append `-v1`, `-v2` if branch exists)
- PR title: `ci: add Terraform and app deploy pipelines (CICD Engineer Agent)`
- PR body must include `Closes #<issue-number>`
