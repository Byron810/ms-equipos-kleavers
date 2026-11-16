using Kleavers.Equipos.Domain;
using Kleavers.Equipos.Infrastructure;
using Microsoft.AspNetCore.Mvc;

namespace Kleavers.Equipos.API.Controllers;

[ApiController]
[Route("v1/equipos")]
public class EquiposController : ControllerBase
{
    private readonly IEquipoRepository _repository;
    private readonly EquipoService _equipoService;

    public EquiposController(IEquipoRepository repository, EquipoService equipoService)
    {
        _repository = repository;
        _equipoService = equipoService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] string? categoria = null,
        [FromQuery] string? estado = null,
        [FromQuery] int? stockMaximo = null,
        [FromQuery] long? disponibleEn = null)
    {
        // 1. Obtener el conteo real total de registros filtrados
        var totalRecords = await _repository.CountAsync(search, categoria, estado, stockMaximo);
        
        // 2. Obtener los items de la página actual
        var items = await _repository.GetAllAsync(page, pageSize, search, categoria, estado, stockMaximo, disponibleEn);
        
        return Ok(new
        {
            totalRecords,
            page,
            pageSize,
            items
        });
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var equipo = await _repository.GetByIdAsync(id);
        if (equipo == null)
            return NotFound(new { message = $"Equipo con ID {id} no fue encontrado." });

        return Ok(equipo);
    }

    /// <summary>
    /// Crear un nuevo equipo: POST /v1/equipos
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CrearEquipoRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.NombreEquipo) || request.CantidadTotal < 0)
        {
            return BadRequest(new { message = "El nombre del equipo es obligatorio y la cantidad no puede ser negativa." });
        }

        var nuevoEquipo = new Equipo
        {
            NombreEquipo = request.NombreEquipo,
            Categoria = request.Categoria,
            CantidadTotal = request.CantidadTotal,
            CantidadDisponible = request.CantidadTotal,
            CantidadAsignada = 0,
            Estado = request.CantidadTotal > 0 ? "Disponible" : "No disponible",
            PrecioAlquiler = request.PrecioAlquiler
        };

        await _repository.AddAsync(nuevoEquipo);
        await _repository.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = nuevoEquipo.Id }, nuevoEquipo);
    }

    /// <summary>
    /// Editar parcialmente un equipo: PATCH /v1/equipos/{id} (y alias PUT por compatibilidad)
    /// </summary>
    [HttpPatch("{id:int}")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] ActualizarEquipoRequest request)
    {
        var equipo = await _repository.GetByIdAsync(id);
        if (equipo == null)
        {
            return NotFound(new { message = $"No se encontró el equipo con ID {id}." });
        }

        if (!string.IsNullOrWhiteSpace(request.NombreEquipo))
            equipo.NombreEquipo = request.NombreEquipo;

        if (!string.IsNullOrWhiteSpace(request.Categoria))
            equipo.Categoria = request.Categoria;

        if (request.PrecioAlquiler.HasValue)
            equipo.PrecioAlquiler = request.PrecioAlquiler.Value;

        if (request.CantidadTotal.HasValue)
        {
            if (request.CantidadTotal.Value < equipo.CantidadAsignada)
            {
                return BadRequest(new
                {
                    message = $"La cantidad total ({request.CantidadTotal.Value}) no puede ser menor a las unidades ya asignadas ({equipo.CantidadAsignada})."
                });
            }

            equipo.CantidadTotal = request.CantidadTotal.Value;
            equipo.CantidadDisponible = equipo.CantidadTotal - equipo.CantidadAsignada;
        }

        if (request.CantidadDisponible.HasValue)
            equipo.CantidadDisponible = request.CantidadDisponible.Value;

        if (request.CantidadAsignada.HasValue)
            equipo.CantidadAsignada = request.CantidadAsignada.Value;

        equipo.Estado = !string.IsNullOrWhiteSpace(request.Estado)
            ? request.Estado
            : (equipo.CantidadDisponible > 0 ? "Disponible" : "No disponible");

        await _repository.UpdateAsync(equipo);
        await _repository.SaveChangesAsync();

        return Ok(equipo);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var equipo = await _repository.GetByIdAsync(id);
        if (equipo == null)
        {
            return NotFound(new { message = $"No se encontró el equipo con ID {id}." });
        }

        if (equipo.CantidadAsignada > 0)
        {
            return BadRequest(new { message = "No se puede eliminar un equipo que tiene unidades asignadas a eventos." });
        }

        await _repository.DeleteAsync(equipo);
        await _repository.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// PUT /v1/equipos/reservas/{eventoId} — Reserva todo o nada para un evento y fecha.
    /// </summary>
    [HttpPut("reservas/{eventoId}")]
    public async Task<IActionResult> ReservarPorEvento(string eventoId, [FromBody] ReservaEventoRequest request)
    {
        var resultado = await _equipoService.ReemplazarReservaEventoAsync(
            eventoId,
            request.Fecha,
            request.Items ?? []
        );

        if (!resultado.Exito)
        {
            return Conflict(new { message = resultado.ErrorMessage });
        }

        return Ok(new { items = resultado.Items });
    }

    /// <summary>
    /// DELETE /v1/equipos/reservas/{eventoId} — Libera todas las reservas del evento (siempre 204).
    /// </summary>
    [HttpDelete("reservas/{eventoId}")]
    public async Task<IActionResult> LiberarReservaPorEvento(string eventoId)
    {
        await _equipoService.LiberarReservaEventoAsync(eventoId);
        return NoContent();
    }
}

public record CrearEquipoRequest(
    string NombreEquipo,
    string Categoria,
    int CantidadTotal,
    decimal PrecioAlquiler
);

public record ActualizarEquipoRequest(
    string? NombreEquipo,
    string? Categoria,
    int? CantidadTotal,
    decimal? PrecioAlquiler,
    int? CantidadDisponible,
    int? CantidadAsignada,
    string? Estado
);

public record ReservaRequest(int EquipoId, int Cantidad);
public record ReservaCantidadRequest(int Cantidad);
public record ReservaEventoRequest(long Fecha, List<ReservaEventoItemInput> Items);