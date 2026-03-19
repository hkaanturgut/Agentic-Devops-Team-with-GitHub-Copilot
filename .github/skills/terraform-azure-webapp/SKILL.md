---
name: terraform-azure-webapp
description: >
  Write Terraform to provision an Azure Web App for this project. Use this skill when asked to write
  terraform, provision azure, create infra, set up the cloud infrastructure, or deploy to azure web app.
  Covers full file structure under infra/, exact providers.tf with pre-configured remote backend,
  variables.tf without hardcoded defaults (values come from terraform.tfvars confirmed by stakeholder),
  main.tf with Azure resource group, service plan, and linux web app, and outputs.tf.
---

# Terraform Azure Web App Skill

## File Structure

Create all Terraform files under `infra/`:

```
infra/
├── providers.tf        # AzureRM provider + remote backend (DO NOT MODIFY BACKEND CONFIG)
├── variables.tf        # Variable declarations — NO defaults (values in terraform.tfvars)
├── main.tf             # Core Azure resource definitions
├── outputs.tf          # Key outputs (web app URL, web app name, resource group name)
└── terraform.tfvars    # Stakeholder-confirmed values — app_name, location, environment
```

## providers.tf — Use EXACTLY This Content

**Never modify the backend block.** The remote state backend is pre-configured for this project.

```hcl
# Managed by IAC Engineer Agent

terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }

  backend "azurerm" {
    resource_group_name  = "rg-cc-agent-tf-backend"
    storage_account_name = "satfbackenddemo"
    container_name       = "tfstate"
    key                  = "demo.tfstate"
  }
}

provider "azurerm" {
  features {}
}
```

## variables.tf — No Defaults (values come from terraform.tfvars)

```hcl
# Managed by IAC Engineer Agent

variable "app_name" {
  type        = string
  description = "Base name for all Azure resources (e.g. myapp-demo)"
}

variable "location" {
  type        = string
  description = "Azure region to deploy into (e.g. canadacentral, eastus, westeurope)"
}

variable "environment" {
  type        = string
  description = "Deployment environment (e.g. prod, staging, dev)"
}

variable "node_version" {
  type        = string
  description = "Node.js runtime version for Azure Web App"
  default     = "20-lts"
}
```

## terraform.tfvars — Use Stakeholder-Confirmed Values

```hcl
# Managed by IAC Engineer Agent
# Values confirmed by stakeholder before provisioning

app_name    = "<stakeholder-confirmed-app-name>"
location    = "<stakeholder-confirmed-region>"
environment = "<stakeholder-confirmed-environment>"
```

Replace the placeholders with the actual values confirmed by the stakeholder in Phase 0b.

## main.tf

Naming convention: `${var.app_name}-${var.environment}-<resource-type>`

```hcl
# Managed by IAC Engineer Agent

resource "azurerm_resource_group" "main" {
  name     = "${var.app_name}-${var.environment}-rg"
  location = var.location
}

resource "azurerm_service_plan" "main" {
  name                = "${var.app_name}-${var.environment}-asp"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  os_type             = "Linux"
  sku_name            = "B1"
}

resource "azurerm_linux_web_app" "main" {
  name                = "${var.app_name}-${var.environment}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  service_plan_id     = azurerm_service_plan.main.id

  app_settings = {
    WEBSITES_ENABLE_APP_SERVICE_STORAGE = "false"
    SCM_DO_BUILD_DURING_DEPLOYMENT      = "true"
    NODE_ENV                            = "production"
  }

  site_config {
    application_stack {
      node_version = var.node_version
    }
    always_on = true
  }
}
```

## outputs.tf

```hcl
# Managed by IAC Engineer Agent

output "web_app_url" {
  value       = "https://${azurerm_linux_web_app.main.default_hostname}"
  description = "Live URL of the deployed Azure Web App"
}

output "web_app_name" {
  value       = azurerm_linux_web_app.main.name
  description = "Azure Web App name — set automatically as AZURE_WEBAPP_NAME secret by terraform-apply.yml"
}

output "resource_group_name" {
  value       = azurerm_resource_group.main.name
  description = "Resource group name for reference"
}
```

## Azure Regions Reference

| Region | Code |
|--------|------|
| Canada Central | `canadacentral` |
| East US | `eastus` |
| West Europe | `westeurope` |
| UK South | `uksouth` |
| Australia East | `australiaeast` |

## Important Rules

- **Never** modify the `backend "azurerm"` block — it is pre-configured for this project
- **Never** hardcode subscription IDs, tenant IDs, or credentials in `.tf` files
- **Never** run `terraform apply` — the CI/CD pipeline handles this automatically on merge
- **Never** add defaults to `app_name`, `location`, or `environment` in `variables.tf` — values come from `terraform.tfvars`
- **node_version must be `"20-lts"`** — NOT `"NODE|20-lts"` (the `NODE|` prefix is invalid for the azurerm provider)
- Always use `terraform.tfvars` for stakeholder-confirmed values
- Keep SKU at `B1` unless explicitly requested otherwise
- Add `# Managed by IAC Engineer Agent` at the top of every `.tf` file

## Git Workflow

- Branch: `feature/infra-azure-webapp` from `demo-test`
- PR title: `infra: provision Azure Web App (IAC Engineer Agent)`
- PR body must include the confirmed configuration table and `Closes #<issue-number>`
- After merge: `terraform-apply.yml` runs automatically AND sets `AZURE_WEBAPP_NAME` secret automatically
