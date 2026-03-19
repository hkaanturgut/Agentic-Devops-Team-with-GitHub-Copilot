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
