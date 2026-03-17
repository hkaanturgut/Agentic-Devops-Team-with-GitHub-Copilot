# Managed by IAC Engineer Agent
#
# Project-specific variable values for the Task Management REST API.
# NOTE: web_app_name must be globally unique. If the default conflicts,
# append a random suffix, e.g.: webapp-task-api-x7k9m2

resource_group_name    = "rg-task-api"
location               = "East US"
app_service_plan_name  = "asp-task-api"
web_app_name           = "webapp-task-api"
node_version           = "20-lts"
