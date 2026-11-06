output "resource_group_name" {
  description = "Resource group that contains the deployment."
  value       = azurerm_resource_group.main.name
}

output "web_url" {
  description = "Public URL for the Prism console and marketing site."
  value       = "https://${local.web_fqdn}"
}

output "api_internal_fqdn" {
  description = "Private Container Apps ingress FQDN for the API."
  value       = azurerm_container_app.api.ingress[0].fqdn
}

output "postgres_fqdn" {
  description = "Managed PostgreSQL hostname."
  value       = azurerm_postgresql_flexible_server.main.fqdn
}

output "redis_hostname" {
  description = "Azure Managed Redis hostname (TLS only)."
  value       = azurerm_managed_redis.main.hostname
}

output "container_app_names" {
  description = "Container App names used by the deploy workflow."
  value = {
    api    = azurerm_container_app.api.name
    worker = azurerm_container_app.worker.name
    web    = azurerm_container_app.web.name
  }
}

output "current_images" {
  description = "Images currently configured on each Container App."
  value = {
    api    = local.api_image
    worker = local.worker_image
    web    = local.web_image
  }
}
