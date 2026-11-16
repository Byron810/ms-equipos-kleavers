using System.Text;
using System.Text.Json;
using Azure.Storage.Queues;
using Kleavers.Equipos.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace Kleavers.Equipos.Infrastructure;

public record ReservaEventoItemInput(int EquipoId, int Cantidad);
public record ReservaEventoItemOutput(int EquipoId, string NombreEquipo, int Cantidad, decimal PrecioAlquiler);
public record ResultadoReservaEvento(bool Exito, string? ErrorMessage, List<ReservaEventoItemOutput> Items);

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

            await NotificarReservaAsincrona(equipoId, cantidad, equipo.NombreEquipo);
            return true;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<ResultadoReservaEvento> ReemplazarReservaEventoAsync(string eventoId, long fechaEpoch, List<ReservaEventoItemInput> items)
    {
        long epochMs = fechaEpoch < 10_000_000_000L ? fechaEpoch * 1000L : fechaEpoch;
        var diaUtc = DateTimeOffset.FromUnixTimeMilliseconds(epochMs).UtcDateTime.Date;
        long inicioDiaMs = new DateTimeOffset(diaUtc, TimeSpan.Zero).ToUnixTimeMilliseconds();
        long finDiaMs = new DateTimeOffset(diaUtc.AddDays(1), TimeSpan.Zero).ToUnixTimeMilliseconds() - 1;

        // Agrupar cantidades por si el mismo equipo viene repetido en el array
        var itemsAgrupados = items
            .GroupBy(i => i.EquipoId)
            .Select(g => new ReservaEventoItemInput(g.Key, g.Sum(x => x.Cantidad)))
            .ToList();

        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            // 1. Obtener reservas previas de este evento para reemplazarlas
            var reservasPrevias = await _context.Reservas
                .Where(r => r.EventoId == eventoId)
                .ToListAsync();

            var equiposAfectadosIds = reservasPrevias.Select(r => r.EquipoId)
                .Union(itemsAgrupados.Select(i => i.EquipoId))
                .Distinct()
                .OrderBy(id => id)
                .ToList();

            // 2. Bloqueo pesimista (FOR UPDATE) en orden determinístico para evitar deadlocks
            var equiposBloqueados = new Dictionary<int, Equipo>();
            foreach (var eqId in equiposAfectadosIds)
            {
                var eq = await _repository.GetByIdForUpdateAsync(eqId);
                if (eq != null)
                {
                    equiposBloqueados[eqId] = eq;
                }
            }

            if (reservasPrevias.Count > 0)
            {
                _context.Reservas.RemoveRange(reservasPrevias);
                await _context.SaveChangesAsync();
            }

            // 3. Validar disponibilidad todo-o-nada para ese día
            var respuestaItems = new List<ReservaEventoItemOutput>();

            foreach (var item in itemsAgrupados)
            {
                if (item.Cantidad <= 0)
                {
                    await transaction.RollbackAsync();
                    return new ResultadoReservaEvento(false, $"La cantidad para el equipo {item.EquipoId} debe ser mayor a 0.", []);
                }

                if (!equiposBloqueados.TryGetValue(item.EquipoId, out var equipo))
                {
                    await transaction.RollbackAsync();
                    return new ResultadoReservaEvento(false, $"El equipo con ID {item.EquipoId} no existe.", []);
                }

                int reservadoEseDia = await _context.Reservas
                    .Where(r => r.EquipoId == item.EquipoId && r.FechaEpochMs >= inicioDiaMs && r.FechaEpochMs <= finDiaMs)
                    .SumAsync(r => r.Cantidad);

                int disponibleEseDia = equipo.CantidadTotal - reservadoEseDia;

                if (item.Cantidad > disponibleEseDia)
                {
                    await transaction.RollbackAsync();
                    return new ResultadoReservaEvento(
                        false,
                        $"Stock insuficiente para '{equipo.NombreEquipo}' en la fecha solicitada. Disponible: {Math.Max(0, disponibleEseDia)}, solicitado: {item.Cantidad}.",
                        []);
                }

                await _context.Reservas.AddAsync(new Reserva
                {
                    EventoId = eventoId,
                    EquipoId = item.EquipoId,
                    Cantidad = item.Cantidad,
                    FechaEpochMs = epochMs
                });

                respuestaItems.Add(new ReservaEventoItemOutput(
                    equipo.Id,
                    equipo.NombreEquipo,
                    item.Cantidad,
                    equipo.PrecioAlquiler
                ));
            }

            await _context.SaveChangesAsync();

            // 4. Recalcular contadores globales en la tabla Equipos
            foreach (var eq in equiposBloqueados.Values)
            {
                int totalAsignado = await _context.Reservas
                    .Where(r => r.EquipoId == eq.Id)
                    .SumAsync(r => r.Cantidad);

                eq.CantidadAsignada = totalAsignado;
                eq.CantidadDisponible = Math.Max(0, eq.CantidadTotal - totalAsignado);
                eq.Estado = eq.CantidadDisponible == 0 ? "No disponible" : "Disponible";
                await _repository.UpdateAsync(eq);
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            // Notificar a la cola de Azure por cada equipo reservado
            foreach (var res in respuestaItems)
            {
                await NotificarReservaAsincrona(res.EquipoId, res.Cantidad, res.NombreEquipo);
            }

            return new ResultadoReservaEvento(true, null, respuestaItems);
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task LiberarReservaEventoAsync(string eventoId)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            var reservas = await _context.Reservas
                .Where(r => r.EventoId == eventoId)
                .ToListAsync();

            if (reservas.Count == 0)
            {
                await transaction.CommitAsync();
                return;
            }

            var equiposIds = reservas.Select(r => r.EquipoId).Distinct().OrderBy(id => id).ToList();

            var equiposBloqueados = new List<Equipo>();
            foreach (var eqId in equiposIds)
            {
                var eq = await _repository.GetByIdForUpdateAsync(eqId);
                if (eq != null) equiposBloqueados.Add(eq);
            }

            _context.Reservas.RemoveRange(reservas);
            await _context.SaveChangesAsync();

            foreach (var eq in equiposBloqueados)
            {
                int totalAsignado = await _context.Reservas
                    .Where(r => r.EquipoId == eq.Id)
                    .SumAsync(r => r.Cantidad);

                eq.CantidadAsignada = totalAsignado;
                eq.CantidadDisponible = Math.Max(0, eq.CantidadTotal - totalAsignado);
                eq.Estado = eq.CantidadDisponible == 0 ? "No disponible" : "Disponible";
                await _repository.UpdateAsync(eq);
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
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
                FechaEpoch = DateTimeOffset.UtcNow.ToUnixTimeSeconds()
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