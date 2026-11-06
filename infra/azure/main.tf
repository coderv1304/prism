locals {
  prefix = "${var.project_name}-${var.environment}-${random_id.suffix.hex}"

  tags = merge(
    {
      project     = var.project_name
      environment = var.environment
      managed_by  = "terraform"
      workload    = "async-job-platform"
    },
    var.extra_tags,
  )

  api_name    = "${local.prefix}-api"
  worker_name = "${local.prefix}-worker"
  web_name    = "${local.prefix}-web"

  api_image    = "${var.container_image_prefix}-api:${var.image_tag}"
  worker_image = "${var.container_image_prefix}-worker:${var.image_tag}"
  web_image    = "${var.container_image_prefix}-web:${var.image_tag}"

  # Computed from the environment rather than the web resource so the API can
  # receive its CORS origin without creating a Terraform dependency cycle.
  web_fqdn = "${local.web_name}.${azurerm_container_app_environment.main.default_domain}"

  database_url = "postgresql://${azurerm_postgresql_flexible_server.main.administrator_login}:${urlencode(random_password.postgres.result)}@${azurerm_postgresql_flexible_server.main.fqdn}:5432/${azurerm_postgresql_flexible_server_database.main.name}?schema=public&sslmode=require"
  redis_url    = "rediss://:${urlencode(azurerm_redis_cache.main.primary_access_key)}@${azurerm_redis_cache.main.hostname}:6380"
}

resource "random_id" "suffix" {
  byte_length = 3
}

resource "random_password" "postgres" {
  length           = 32
  special          = true
  override_special = "!#$%*()-_=+[]{}?"
}

resource "azurerm_resource_group" "main" {
  name     = "${local.prefix}-rg"
  location = var.location
  tags     = local.tags
}

resource "azurerm_log_analytics_workspace" "main" {
  name                = "${local.prefix}-logs"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
  tags                = local.tags
}

resource "azurerm_postgresql_flexible_server" "main" {
  name                   = "${local.prefix}-pg"
  resource_group_name    = azurerm_resource_group.main.name
  location               = azurerm_resource_group.main.location
  version                = "16"
  administrator_login    = "prismops"
  administrator_password = random_password.postgres.result

  sku_name   = var.postgres_sku_name
  storage_mb = var.postgres_storage_mb

  backup_retention_days        = 7
  geo_redundant_backup_enabled = false

  # The assessment uses managed public endpoints to keep the demo affordable.
  # For a regulated production deployment, switch to VNet integration/Private
  # Link and remove the Azure-services firewall rule below.
  public_network_access_enabled = true

  tags = local.tags
}

resource "azurerm_postgresql_flexible_server_database" "main" {
  name      = "prism"
  server_id = azurerm_postgresql_flexible_server.main.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}

resource "azurerm_postgresql_flexible_server_firewall_rule" "azure_services" {
  name             = "AllowAzureServices"
  server_id        = azurerm_postgresql_flexible_server.main.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

resource "azurerm_redis_cache" "main" {
  name                          = "${local.prefix}-redis"
  location                      = azurerm_resource_group.main.location
  resource_group_name           = azurerm_resource_group.main.name
  capacity                      = var.redis_capacity
  family                        = "C"
  sku_name                      = "Basic"
  non_ssl_port_enabled          = false
  minimum_tls_version           = "1.2"
  public_network_access_enabled = true

  redis_configuration {
    maxmemory_policy = "noeviction"
  }

  tags = local.tags
}

resource "azurerm_container_app_environment" "main" {
  name                       = "${local.prefix}-env"
  location                   = azurerm_resource_group.main.location
  resource_group_name        = azurerm_resource_group.main.name
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id
  tags                       = local.tags
}

resource "azurerm_container_app" "api" {
  name                         = local.api_name
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = azurerm_resource_group.main.name
  revision_mode                = "Single"
  tags                         = local.tags

  secret {
    name  = "database-url"
    value = local.database_url
  }

  secret {
    name  = "redis-url"
    value = local.redis_url
  }

  template {
    min_replicas = var.api_min_replicas
    max_replicas = 3

    container {
      name   = "api"
      image  = local.api_image
      cpu    = 0.5
      memory = "1Gi"

      env {
        name  = "NODE_ENV"
        value = "production"
      }

      env {
        name  = "API_PORT"
        value = "4000"
      }

      env {
        name  = "FRONTEND_ORIGIN"
        value = "https://${local.web_fqdn}"
      }

      env {
        name        = "DATABASE_URL"
        secret_name = "database-url"
      }

      env {
        name        = "REDIS_URL"
        secret_name = "redis-url"
      }

      env {
        name  = "LOG_LEVEL"
        value = "info"
      }

      env {
        name  = "APP_VERSION"
        value = var.image_tag
      }

      liveness_probe {
        transport               = "HTTP"
        port                    = 4000
        path                    = "/api/v1/health"
        initial_delay           = 10
        interval_seconds        = 30
        timeout                 = 5
        failure_count_threshold = 3
      }

      readiness_probe {
        transport               = "HTTP"
        port                    = 4000
        path                    = "/api/v1/health/ready"
        initial_delay           = 5
        interval_seconds        = 10
        timeout                 = 5
        failure_count_threshold = 3
      }
    }
  }

  ingress {
    external_enabled = false
    target_port      = 4000
    transport        = "http"

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }
}

resource "azurerm_container_app" "worker" {
  name                         = local.worker_name
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = azurerm_resource_group.main.name
  revision_mode                = "Single"
  tags                         = local.tags

  secret {
    name  = "database-url"
    value = local.database_url
  }

  secret {
    name  = "redis-url"
    value = local.redis_url
  }

  template {
    min_replicas = var.worker_min_replicas
    max_replicas = 5

    container {
      name   = "worker"
      image  = local.worker_image
      cpu    = 0.5
      memory = "1Gi"

      env {
        name  = "NODE_ENV"
        value = "production"
      }

      env {
        name  = "WORKER_PORT"
        value = "4001"
      }

      env {
        name  = "WORKER_CONCURRENCY"
        value = "4"
      }

      env {
        name  = "JOB_STAGE_DELAY_MS"
        value = "450"
      }

      env {
        name        = "DATABASE_URL"
        secret_name = "database-url"
      }

      env {
        name        = "REDIS_URL"
        secret_name = "redis-url"
      }

      env {
        name  = "LOG_LEVEL"
        value = "info"
      }

      env {
        name  = "APP_VERSION"
        value = var.image_tag
      }
    }
  }
}

resource "azurerm_container_app" "web" {
  name                         = local.web_name
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = azurerm_resource_group.main.name
  revision_mode                = "Single"
  tags                         = local.tags

  template {
    min_replicas = var.web_min_replicas
    max_replicas = 3

    container {
      name   = "web"
      image  = local.web_image
      cpu    = 0.5
      memory = "1Gi"

      env {
        name  = "NODE_ENV"
        value = "production"
      }

      env {
        name  = "PORT"
        value = "3000"
      }

      env {
        name  = "HOSTNAME"
        value = "0.0.0.0"
      }

      env {
        name  = "API_INTERNAL_URL"
        value = "https://${azurerm_container_app.api.ingress[0].fqdn}"
      }

      env {
        name  = "NEXT_PUBLIC_SITE_URL"
        value = "https://${local.web_fqdn}"
      }

      liveness_probe {
        transport               = "HTTP"
        port                    = 3000
        path                    = "/api/health"
        initial_delay           = 15
        interval_seconds        = 30
        timeout                 = 5
        failure_count_threshold = 3
      }

      readiness_probe {
        transport               = "HTTP"
        port                    = 3000
        path                    = "/api/health"
        initial_delay           = 10
        interval_seconds        = 10
        timeout                 = 5
        failure_count_threshold = 3
      }
    }
  }

  ingress {
    external_enabled = true
    target_port      = 3000
    transport        = "http"

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }
}
