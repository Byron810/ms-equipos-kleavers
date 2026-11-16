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
