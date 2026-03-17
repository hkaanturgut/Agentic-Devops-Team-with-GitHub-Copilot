# MCP bootstrap for GitHub Copilot coding agent

This repository starts small with the Azure MCP server, following GitHub's coding-agent MCP documentation.

## Files in this folder

- `copilot-coding-agent-mcp.azure.json`: ready-to-paste JSON for repository MCP configuration.

## Step 1: Configure MCP in GitHub repository settings

In GitHub:

1. Open repository `Settings`.
2. Go to `Copilot` -> `Coding agent`.
3. Paste the JSON from `mcp/copilot-coding-agent-mcp.azure.json`.
4. Save.

## Step 2: Configure copilot environment secrets

Create environment `copilot` and add these secrets:

- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`

If you add additional Azure MCP servers later and they need MCP-prefixed secrets/vars, use names starting with:

- `COPILOT_MCP_`

## Step 3: Setup workflow for coding-agent runtime auth

This repo includes `.github/workflows/copilot-setup-steps.yml` with Azure login for the `copilot` environment.

## Optional quick-start with Azure Developer CLI

From repo root, you can run:

```bash
azd coding-agent config
```

This can generate/setup Azure coding-agent prerequisites automatically.
