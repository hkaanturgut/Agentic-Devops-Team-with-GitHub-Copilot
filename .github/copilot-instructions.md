# GitHub Copilot Instructions

This is **"From Copilot to Colleagues"** — an AI DevOps agent team demo. A stakeholder submits a feature request and an autonomous team of 5 GitHub Copilot agents builds, provisions infrastructure, sets up CI/CD, and deploys a Node.js app to Azure.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Application | Node.js 20 + Express REST API, files under `app/` |
| Infrastructure | Terraform, files under `infra/` |
| Cloud | Azure Web App (Linux, B1 SKU, canadacentral) |
| CI/CD | GitHub Actions under `.github/workflows/` |
| Terraform Remote State | Storage account: `satfbackenddemo`, container: `tfstate`, RG: `rg-cc-agent-tf-backend` |

## Coding Standards

- Node.js: use `async/await` only, `process.env.PORT || 3000` for port, always expose `GET /health`
- Terraform: never modify the `backend "azurerm"` block, never hardcode credentials
- GitHub Actions: use pinned action versions (`@v4`, `@v3`), use `npm ci` not `npm install`
- Always branch from `dev` — never commit directly to `dev`
- Always open a PR — never merge directly

## GitHub Actions Secrets

| Secret | Status |
|--------|--------|
| `AZURE_CLIENT_ID` | ✅ Configured |
| `AZURE_CLIENT_SECRET` | ✅ Configured |
| `AZURE_TENANT_ID` | ✅ Configured |
| `AZURE_SUBSCRIPTION_ID` | ✅ Configured |
| `AZURE_WEBAPP_NAME` | ⏳ Added manually after Terraform apply — value from `web_app_name` output |
