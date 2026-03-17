# Managed by IAC Engineer Agent

variable "resource_group_name" {
  type        = string
  description = "Name of the Azure Resource Group"
  default     = "rg-task-api"
}

variable "location" {
  type        = string
  description = "Azure region to deploy into"
  default     = "East US"
}

variable "app_service_plan_name" {
  type        = string
  description = "Name of the Azure App Service Plan"
  default     = "asp-task-api"
}

# NOTE: This must be globally unique across all of Azure.
# Append a random suffix (e.g., webapp-task-api-abc123) to avoid conflicts.
variable "web_app_name" {
  type        = string
  description = "Name of the Azure Linux Web App (must be globally unique)"
  default     = "webapp-task-api"
}

variable "node_version" {
  type        = string
  description = "Node.js runtime version for the Azure Web App"
  default     = "20-lts"
}
