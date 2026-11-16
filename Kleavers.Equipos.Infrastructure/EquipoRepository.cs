using Kleavers.Equipos.Domain;
using Microsoft.EntityFrameworkCore;

namespace Kleavers.Equipos.Infrastructure;

public class EquipoRepository : IEquipoRepository
{
    private readonly AppDbContext _context;

    public EquipoRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Equipo?> GetByIdAsync(int id)
    {
        return await _context.Equipos.FindAsync(id);
    }

    public async Task<Equipo?> GetByIdForUpdateAsync(int id)
    {
        return await _context.Equipos
            .FromSqlInterpolated($"SELECT * FROM \"Equipos\" WHERE \"Id\" = {id} FOR UPDATE")
            .FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<Equipo>> GetAllAsync(int page, int pageSize, string? search, string? categoria, string? estado, int? stockMaximo, long? disponibleEn)
    {
        var query = _context.Equipos.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(e => e.NombreEquipo.ToLower().Contains(search.ToLower()));
        }

        if (!string.IsNullOrWhiteSpace(categoria))
        {
            query = query.Where(e => e.Categoria == categoria);
        }

        if (!string.IsNullOrWhiteSpace(estado))
        {
            query = query.Where(e => e.Estado == estado);
        }

        if (stockMaximo.HasValue)
        {
            query = query.Where(e => e.CantidadDisponible <= stockMaximo.Value);
        }

        var equipos = await query
            .OrderBy(e => e.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        if (disponibleEn.HasValue && equipos.Count > 0)
        {
            // Normaliza a milisegundos si viene en segundos (10 dígitos)
            long epochMs = disponibleEn.Value < 10_000_000_000L
                ? disponibleEn.Value * 1000L
                : disponibleEn.Value;

            var diaUtc = DateTimeOffset.FromUnixTimeMilliseconds(epochMs).UtcDateTime.Date;
            long inicioDiaMs = new DateTimeOffset(diaUtc, TimeSpan.Zero).ToUnixTimeMilliseconds();
            long finDiaMs = new DateTimeOffset(diaUtc.AddDays(1), TimeSpan.Zero).ToUnixTimeMilliseconds() - 1;

            var ids = equipos.Select(e => e.Id).ToList();

            var reservadosPorEquipo = await _context.Reservas
                .Where(r => ids.Contains(r.EquipoId) && r.FechaEpochMs >= inicioDiaMs && r.FechaEpochMs <= finDiaMs)
                .GroupBy(r => r.EquipoId)
                .Select(g => new { EquipoId = g.Key, TotalReservado = g.Sum(r => r.Cantidad) })
                .ToDictionaryAsync(x => x.EquipoId, x => x.TotalReservado);

            foreach (var eq in equipos)
            {
                int reservadoEseDia = reservadosPorEquipo.GetValueOrDefault(eq.Id, 0);
                eq.CantidadDisponible = Math.Max(0, eq.CantidadTotal - reservadoEseDia);
                eq.CantidadAsignada = reservadoEseDia;
                eq.Estado = eq.CantidadDisponible == 0 ? "No disponible" : "Disponible";
            }
        }

        return equipos;
    }

    public async Task<int> CountAsync(string? search, string? categoria, string? estado, int? stockMaximo)
{
    var query = _context.Equipos.AsNoTracking().AsQueryable();

    if (!string.IsNullOrWhiteSpace(search))
    {
        query = query.Where(e => e.NombreEquipo.ToLower().Contains(search.ToLower()));
    }

    if (!string.IsNullOrWhiteSpace(categoria))
    {
        query = query.Where(e => e.Categoria == categoria);
    }

    if (!string.IsNullOrWhiteSpace(estado))
    {
        query = query.Where(e => e.Estado == estado);
    }

    if (stockMaximo.HasValue)
    {
        query = query.Where(e => e.CantidadDisponible <= stockMaximo.Value);
    }

    return await query.CountAsync();
}

    public async Task AddAsync(Equipo equipo)
    {
        await _context.Equipos.AddAsync(equipo);
    }

    public async Task UpdateAsync(Equipo equipo)
    {
        _context.Equipos.Update(equipo);
        await Task.CompletedTask;
    }

    public async Task DeleteAsync(Equipo equipo)
    {   
    _context.Equipos.Remove(equipo);
    await Task.CompletedTask;
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}