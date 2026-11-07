namespace Kleavers.Equipos.Domain;

public interface IEquipoRepository
{
    Task<Equipo?> GetByIdAsync(int id);
    Task<Equipo?> GetByIdForUpdateAsync(int id);
    Task<IEnumerable<Equipo>> GetAllAsync(int page, int pageSize, string? search, string? categoria, string? estado);
    Task AddAsync(Equipo equipo);
    Task UpdateAsync(Equipo equipo);
    Task SaveChangesAsync();
}