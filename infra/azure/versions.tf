terraform {
  required_version = ">= 1.7.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 5.13"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }

  # Configure a remote backend before using this in a team:
  #   terraform init \
  #     -backend-config="resource_group_name=prism-tfstate" \
  #     -backend-config="storage_account_name=prismtfstate" \
  #     -backend-config="container_name=tfstate" \
  #     -backend-config="key=prism.tfstate"
  backend "azurerm" {}
}

provider "azurerm" {
  features {
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
  }
}
