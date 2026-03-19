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
