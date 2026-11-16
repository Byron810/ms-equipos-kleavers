namespace Kleavers.Equipos.Domain;

public interface IEquipoRepository
{
    Task<Equipo?> GetByIdAsync(int id);
    Task<Equipo?> GetByIdForUpdateAsync(int id);
    // Agregados los nuevos parámetros
    Task<IEnumerable<Equipo>> GetAllAsync(int page, int pageSize, string? search, string? categoria, string? estado, int? stockMaximo, long? disponibleEn);
    Task AddAsync(Equipo equipo);
    Task UpdateAsync(Equipo equipo);
    Task SaveChangesAsync();
    Task DeleteAsync(Equipo equipo);
    Task<int> CountAsync(string? search, string? categoria, string? estado, int? stockMaximo);
}