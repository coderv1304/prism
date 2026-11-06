variable "project_name" {
  description = "Short project identifier used in every resource name."
  type        = string
  default     = "prism"

  validation {
    condition     = can(regex("^[a-z][a-z0-9-]{1,18}$", var.project_name))
    error_message = "project_name must be 2-19 lowercase letters, digits or hyphens, starting with a letter."
  }
}

variable "environment" {
  description = "Deployment environment (for example prod or staging)."
  type        = string
  default     = "prod"
}

variable "location" {
  description = "Azure region for all resources."
  type        = string
  default     = "eastus"
}

variable "container_image_prefix" {
  description = "Registry prefix without the service suffix. Images are <prefix>-api, <prefix>-worker and <prefix>-web."
  type        = string
  default     = "ghcr.io/your-github-owner/prism"
}

variable "image_tag" {
  description = "Image tag to deploy. CI uses sha-<full commit SHA>; initial bootstrap can use latest."
  type        = string
  default     = "latest"
}

variable "postgres_sku_name" {
  description = "PostgreSQL Flexible Server SKU. B_Standard_B1ms keeps the demo cheap."
  type        = string
  default     = "B_Standard_B1ms"
}

variable "postgres_storage_mb" {
  description = "PostgreSQL storage in MB."
  type        = number
  default     = 32768
}

variable "redis_capacity" {
  description = "Azure Cache for Redis capacity (1 = 1 GB on the Basic tier)."
  type        = number
  default     = 1
}

variable "web_min_replicas" {
  description = "Minimum web replicas. Keep at least one for a warm public endpoint."
  type        = number
  default     = 1
}

variable "api_min_replicas" {
  description = "Minimum API replicas."
  type        = number
  default     = 1
}

variable "worker_min_replicas" {
  description = "Minimum worker replicas. Scale this independently from the API."
  type        = number
  default     = 1
}

variable "extra_tags" {
  description = "Additional tags applied to every resource."
  type        = map(string)
  default     = {}
}
