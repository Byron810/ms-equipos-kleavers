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

    public async Task<IEnumerable<Equipo>> GetAllAsync(int page, int pageSize, string? search, string? categoria, string? estado)
    {
        var query = _context.Equipos.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(e => e.Nombre.ToLower().Contains(search.ToLower()));
        }

        if (!string.IsNullOrWhiteSpace(categoria))
        {
            query = query.Where(e => e.Categoria == categoria);
        }

        if (!string.IsNullOrWhiteSpace(estado))
        {
            query = query.Where(e => e.Estado == estado);
        }

        return await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
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

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}