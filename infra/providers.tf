# Managed by IAC Engineer Agent

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }

  # NOTE: Update these values to match your actual Azure Storage Account
  # used for Terraform remote state. The resource group, storage account,
  # and blob container must already exist.
  backend "azurerm" {
    resource_group_name  = "rg-terraform-state"
    storage_account_name = "sttfstatetaskapi"
    container_name       = "tfstate"
    key                  = "task-api.terraform.tfstate"
  }
}

provider "azurerm" {
  features {}
}
