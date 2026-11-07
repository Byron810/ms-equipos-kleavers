using Kleavers.Equipos.Domain;
using Kleavers.Equipos.Infrastructure;
using Microsoft.AspNetCore.Authentication.Certificate;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// 1. Configuración mTLS (Certificados Digitales) para la Fase II
builder.Services.AddAuthentication(CertificateAuthenticationDefaults.AuthenticationScheme)
    .AddCertificate(options =>
    {
        options.AllowedCertificateTypes = CertificateTypes.All;
        options.Events = new CertificateAuthenticationEvents
        {
            OnCertificateValidated = context =>
            {
                // Reemplaza esto con el Thumbprint real configurado en Azure APIM por tu compañero de DevOps
                var apimThumbprint = "THUMBPRINT_DEL_CERTIFICADO_APIM"; 

                if (context.ClientCertificate.Thumbprint.ToUpper() != apimThumbprint)
                {
                    context.Fail("Acceso denegado: El certificado no coincide con el APIM autorizado.");
                }
                return Task.CompletedTask;
            }
        };
    });

// 2. Base de Datos y Repositorios
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("PostgreSQLConnection"),
        b => b.MigrationsAssembly("Kleavers.Equipos.Infrastructure")
    )
);

builder.Services.AddScoped<IEquipoRepository, EquipoRepository>();
builder.Services.AddScoped<EquipoService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// 3. Middlewares de seguridad en orden estricto
app.UseAuthentication(); // Debe ir antes de UseAuthorization
app.UseAuthorization();

app.MapControllers();

app.Run();