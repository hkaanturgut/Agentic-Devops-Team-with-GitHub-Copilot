# Managed by IAC Engineer Agent

output "web_app_url" {
  value       = "https://${azurerm_linux_web_app.main.default_hostname}"
  description = "Live URL of the deployed Azure Web App"
}

output "web_app_name" {
  value       = azurerm_linux_web_app.main.name
  description = "Azure Web App name — used as AZURE_WEBAPP_NAME secret in CI/CD"
}

output "resource_group_name" {
  value       = azurerm_resource_group.main.name
  description = "Resource group name for reference"
}
