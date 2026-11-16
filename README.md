# Microservicio de Equipos (`ms-equipos`) — Proyecto Kleavers (Fase II)

Microservicio independiente desarrollado en **.NET 8 (C#)** bajo **Clean Architecture**, encargado de la gestión de inventario de equipos, cálculo de disponibilidad por fecha (Epoch) y reservas transaccionales concurrentes.

---

## Arquitectura y Tecnologías

* **Framework:** ASP.NET Core Web API (.NET 8)
* **Arquitectura:** Clean Architecture (`Kleavers.Equipos.Domain`, `Kleavers.Equipos.Infrastructure`, `Kleavers.Equipos.API`)
* **Base de Datos Relacional:** Azure Database for PostgreSQL (Flexible Server) + Entity Framework Core
* **Mensajería Asíncrona:** Azure Queue Storage (`cola-notificaciones-equipos`)
* **Exposición y Seguridad:** Azure API Management (APIM) con validación JWT (Google OAuth) y certificados cliente **mTLS**
* **Despliegue y CI/CD:** Azure App Service (Linux) + GitHub Actions

---

## Estructura del Repositorio

```text
├── .github/workflows/deploy-equipos.yml   # Pipeline CI/CD hacia Azure App Service
├── Kleavers.Equipos.Domain/               # Entidades (Equipo, Reserva) e interfaces de repositorio
├── Kleavers.Equipos.Infrastructure/       # AppDbContext, migraciones EF Core, bloqueo pesimista y Azure Queue
├── Kleavers.Equipos.API/                  # Controladores REST, Swagger OpenAPI y configuración mTLS
└── docs/                                  # Colección de Postman (JSON) y especificación Swagger
```

---

## Endpoints Expuestos (`/v1/equipos`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/v1/equipos` | Listado paginado (`totalRecords`, `page`, `pageSize`, `items`) con filtros (`search`, `categoria`, `estado`, `disponibleEn=<epoch>`). |
| `GET` | `/v1/equipos/{id}` | Consulta el detalle de un equipo por su identificador. |
| `POST` | `/v1/equipos` | Registra un nuevo equipo en el inventario. |
| `PATCH` | `/v1/equipos/{id}` | Actualiza parcialmente los datos o stock de un equipo. |
| `DELETE` | `/v1/equipos/{id}` | Elimina un equipo (si no tiene unidades asignadas). |
| `POST` | `/v1/equipos/reservar` | Reserva unidades usando bloqueo pesimista (`SELECT ... FOR UPDATE`) y publica evento en Azure Queue. |
| `PUT` | `/v1/equipos/reservas/{eventoId}` | Reserva todo-o-nada los equipos de un evento para una fecha Epoch (responde `409` si no alcanza el stock). |
| `DELETE` | `/v1/equipos/reservas/{eventoId}` | Libera todas las reservas asociadas a un evento (`204 No Content`). |

---

## Seguridad Aplicada

* **Azure API Management (APIM):** Gateway único de entrada; valida tokens JWT de Google OAuth (`<validate-jwt>`) y políticas CORS.
* **Certificados Digitales (mTLS):** Azure App Service (`clientCertEnabled=true`) y .NET (`Microsoft.AspNetCore.Authentication.Certificate`) validan el certificado cliente enviado por APIM, rechazando llamadas directas externas con `403 Forbidden`.

---

## Ejecución Local

1. Configurar las cadenas `PostgreSQLConnection` y `AzureQueueStorage` en `appsettings.Development.json` (o variables de entorno).
2. Ejecutar desde `Kleavers.Equipos.API`:

```bash
dotnet restore
dotnet ef database update --project ../Kleavers.Equipos.Infrastructure
dotnet run
```

3. Acceder a la documentación interactiva en `http://localhost:<puerto>/swagger`.

## Servicio de Almacenamiento en Azure y Justificación

De acuerdo con la arquitectura distribuida del sistema —donde cada microservicio integra un tipo de almacenamiento distinto en Azure (**Azure Database for PostgreSQL** en Equipos, **Azure SQL Database** en Eventos y **Azure Cosmos DB / Service Bus** en Notificaciones)—[cite: 3, 6], este microservicio utiliza:

| Servicio en Azure | Tipo | Uso en `ms-equipos` | Justificación Técnica |
| :--- | :--- | :--- | :--- |
| **Azure Database for PostgreSQL** (`kleavers-equipos-db`) | Relacional (SQL) | Persistencia del inventario (`Equipos`) y reservas por fecha (`Reservas`). | Garantiza integridad transaccional ACID y permite aplicar bloqueo pesimista a nivel de fila (`SELECT ... FOR UPDATE`), evitando sobre-reservas cuando múltiples solicitudes intentan apartar el mismo equipo en una misma fecha[cite: 5, 6]. |

### Evidencia en Portal de Azure
* **Servidor PostgreSQL Flexible Server (`kleavers-equipos-db`):
{
    "sku": {
        "name": "Standard_B1ms",
        "tier": "Burstable"
    },
    "systemData": {
        "createdAt": "2026-11-04T03:54:23.2225973Z"
    },
    "properties": {
        "replica": {
            "role": "Primary",
            "capacity": 5
        },
        "storage": {
            "type": "Premium_LRS",
            "iops": 120,
            "tier": "P4",
            "storageSizeGB": 32,
            "autoGrow": "Disabled"
        },
        "network": {
            "publicNetworkAccess": "Enabled"
        },
        "privateEndpointConnections": [],
        "dataEncryption": {
            "type": "SystemManaged"
        },
        "authConfig": {
            "activeDirectoryAuth": "Disabled",
            "passwordAuth": "Enabled"
        },
        "fullyQualifiedDomainName": "kleavers-equipos-db.postgres.database.azure.com",
        "version": "18",
        "minorVersion": "6",
        "administratorLogin": "kleavers_admin",
        "state": "Ready",
        "availabilityZone": "2",
        "backup": {
            "backupRetentionDays": 7,
            "geoRedundantBackup": "Disabled",
            "earliestRestoreDate": "2026-11-10T04:12:40.0852501+00:00"
        },
        "highAvailability": {
            "mode": "Disabled",
            "state": "NotEnabled"
        },
        "maintenanceWindow": {
            "customWindow": "Disabled",
            "dayOfWeek": 0,
            "startHour": 0,
            "startMinute": 0
        },
        "replicationRole": "Primary",
        "replicaCapacity": 5
    },
    "location": "Chile Central",
    "tags": {},
    "id": "/subscriptions/d58246db-9d73-40e5-8b6d-bde8e093ad59/resourceGroups/rg-kleavers/providers/Microsoft.DBforPostgreSQL/flexibleServers/kleavers-equipos-db",
    "name": "kleavers-equipos-db",
    "type": "Microsoft.DBforPostgreSQL/flexibleServers"
}
