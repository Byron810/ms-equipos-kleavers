namespace Kleavers.Equipos.API.DTOs;

public record EquipoDto(
    int Id, 
    string Nombre, 
    string Categoria, 
    int CantidadTotal, 
    int CantidadDisponible, 
    int CantidadAsignada, 
    string Estado
);

public record CrearEquipoDto(
    string Nombre, 
    string Categoria, 
    int CantidadTotal, 
    int CantidadDisponible, 
    int CantidadAsignada, 
    string Estado
);

public record PaginatedResponse<T>(
    int TotalRecords,
    int Page,
    int PageSize,
    IEnumerable<T> Items
);