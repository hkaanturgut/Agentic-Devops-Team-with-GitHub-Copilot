# Managed by IAC Engineer Agent

variable "app_name" {
  type        = string
  description = "Base name for all Azure resources"
  default     = "devops-agent-demo"
}

variable "location" {
  type        = string
  description = "Azure region to deploy into"
  default     = "canadacentral"
}

variable "environment" {
  type        = string
  description = "Deployment environment"
  default     = "prod"
}

variable "node_version" {
  type        = string
  description = "Node.js runtime version for Azure Web App"
  default     = "20-lts"
}
