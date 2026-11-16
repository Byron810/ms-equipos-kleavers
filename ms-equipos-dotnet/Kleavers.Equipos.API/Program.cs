using System.Reflection;
using Microsoft.OpenApi.Models;
using Kleavers.Equipos.Domain;
using Kleavers.Equipos.Infrastructure;
using Microsoft.AspNetCore.Authentication.Certificate;
using Microsoft.EntityFrameworkCore;
using Azure.Storage.Queues;

var builder = WebApplication.CreateBuilder(args);

// 1. Configuración de mTLS (Certificados Digitales para APIM)
builder.Services.AddAuthentication(CertificateAuthenticationDefaults.AuthenticationScheme)
    .AddCertificate(options =>
    {
        options.AllowedCertificateTypes = CertificateTypes.All;
        options.Events = new CertificateAuthenticationEvents
        {
            OnCertificateValidated = context =>
            {
                // Thumbprint temporal - se actualizará al configurar el APIM definitivo
                var apimThumbprint = "BAB5E85A57A07E249C5F304CBF392E82EBF75EA3"; 

                if (context.ClientCertificate.Thumbprint.ToUpper() != apimThumbprint)
                {
                    context.Fail("Acceso denegado: El certificado no coincide con el APIM autorizado.");
                }
                return Task.CompletedTask;
            }
        };
    });

// 2. Configuración de PostgreSQL
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("PostgreSQLConnection"),
        b => b.MigrationsAssembly("Kleavers.Equipos.Infrastructure")
    )
);

// 3. Registrar el cliente de Azure Storage Queue para notificaciones
builder.Services.AddSingleton(sp =>
{
    string connectionString = builder.Configuration.GetConnectionString("AzureQueueStorage") 
                              ?? "UseDevelopmentStorage=true";
    return new QueueClient(connectionString, "cola-notificaciones-equipos");
});

// 4. Inyección de dependencias Clean Architecture
builder.Services.AddScoped<IEquipoRepository, EquipoRepository>();
builder.Services.AddScoped<EquipoService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// 5. Configuración completa de Swagger
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Kleavers - Microservicio de Equipos API",
        Version = "v1",
        Description = """
            ### Descripción General
            Microservicio independiente desarrollado en **.NET 8 (Clean Architecture)** con **PostgreSQL** en Azure, encargado de la gestión de inventario de equipos, disponibilidad por fecha (Epoch) y reservas transaccionales con bloqueo pesimista (`SELECT ... FOR UPDATE`).

            ---

            ### Arquitectura y Seguridad Aplicada (Fase II)
            * **Exposición Centralizada (Azure API Management):** Todos los endpoints se consumen exclusivamente a través del gateway APIM bajo el prefijo `/v1/equipos` y asociados al producto correspondiente.
            * **Autenticación y Autorización (JWT):** APIM ejecuta la política `<validate-jwt>` verificando el token emitido por **Google OAuth** (`issuer` y `audience`) antes de enrutar la petición al backend, además de gestionar `<cors>` para la SPA.
            * **Comunicación Segura Backend (mTLS):** La conexión entre APIM y Azure App Service está protegida mediante certificados digitales cliente (`clientCertEnabled = true` y validación de *Thumbprint* en .NET), rechazando con `403 Forbidden` cualquier llamada directa que no provenga del gateway APIM.
            * **Mensajería Asíncrona:** Al confirmar una reserva, el servicio publica un evento JSON con marca de tiempo **Epoch** en **Azure Queue Storage** (`cola-notificaciones-equipos`) para el microservicio de Notificaciones.
            """
    });

    // Cargar comentarios XML de EquiposControllers
    var xmlFilename = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFilename);
    if (File.Exists(xmlPath))
    {
        options.IncludeXmlComments(xmlPath);
    }

    // Esquema 1: Token JWT validado en APIM (Google OAuth)
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Token JWT emitido por Google OAuth y validado mediante política <validate-jwt> en Azure API Management (pegar sin la palabra Bearer)."
    });

    // Esquema 2: Certificado Cliente mTLS entre APIM y App Service
    options.AddSecurityDefinition("mTLS", new OpenApiSecurityScheme
    {
        Name = "X-ARR-ClientCert",
        Type = SecuritySchemeType.ApiKey,
        In = ParameterLocation.Header,
        Description = "Certificado digital cliente X.509 adjuntado exclusivamente por Azure API Management (mTLS) hacia Azure App Service."
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        },
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "mTLS" }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// 6. Habilitar Swagger (activo también en producción para Azure)
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Kleavers Equipos API v1");
    c.RoutePrefix = "swagger"; // Accesible en /swagger
});

// Orden estricto de Middleware
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();