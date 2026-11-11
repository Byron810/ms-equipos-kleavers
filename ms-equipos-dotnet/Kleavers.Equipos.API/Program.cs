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
                var apimThumbprint = "THUMBPRINT_TEMPORAL_APIM"; 

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

// Configuración de Swagger
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Habilitar Swagger UI
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Kleavers Equipos API v1");
    c.RoutePrefix = string.Empty; // Swagger como landing page
});

// Orden estricto de Middleware
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();