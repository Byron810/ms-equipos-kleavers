using System.Text;
using System.Text.Json;
using Azure.Storage.Queues;
using Kleavers.Equipos.Domain;
using Microsoft.Extensions.Configuration;

namespace Kleavers.Equipos.Infrastructure;

public class EquipoService
{
    private readonly AppDbContext _context;
    private readonly IEquipoRepository _repository;
    private readonly string _queueConnectionString;

    public EquipoService(AppDbContext context, IEquipoRepository repository, IConfiguration configuration)
    {
        _context = context;
        _repository = repository;
        _queueConnectionString = configuration.GetConnectionString("AzureQueueStorage") ?? "UseDevelopmentStorage=true";
    }

    public async Task<bool> ReservarEquipoAsync(int equipoId, int cantidad)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            var equipo = await _repository.GetByIdForUpdateAsync(equipoId);

            if (equipo == null) return false;

            bool exito = equipo.Reservar(cantidad);
            if (!exito)
            {
                await transaction.RollbackAsync();
                return false;
            }

            await _repository.UpdateAsync(equipo);
            await _repository.SaveChangesAsync();
            await transaction.CommitAsync();

            // Requisito Fase II: Publicar evento asíncrono a la cola
            await NotificarReservaAsincrona(equipoId, cantidad, equipo.Nombre);

            return true;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    private async Task NotificarReservaAsincrona(int equipoId, int cantidad, string nombreEquipo)
    {
        try
        {
            var queueClient = new QueueClient(_queueConnectionString, "cola-notificaciones-equipos");
            await queueClient.CreateIfNotExistsAsync(); 

            var mensaje = new
            {
                Evento = "RESERVA_EQUIPO_CONFIRMADA",
                EquipoId = equipoId,
                NombreEquipo = nombreEquipo,
                Cantidad = cantidad,
                FechaEpoch = DateTimeOffset.UtcNow.ToUnixTimeSeconds() // Formato Epoch requerido[cite: 9]
            };

            var mensajeJson = JsonSerializer.Serialize(mensaje);
            var mensajeBytes = Encoding.UTF8.GetBytes(mensajeJson);
            
            await queueClient.SendMessageAsync(Convert.ToBase64String(mensajeBytes));
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error al enviar mensaje a la cola de Azure: {ex.Message}");
        }
    }
}