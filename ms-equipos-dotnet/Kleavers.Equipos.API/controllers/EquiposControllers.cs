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

    /// <summary>
    /// Consulta de equipos con paginación y filtros de búsqueda.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] string? categoria = null,
        [FromQuery] string? estado = null)
    {
        var items = await _repository.GetAllAsync(page, pageSize, search, categoria, estado);
        
        return Ok(new
        {
            totalRecords = items.Count(),
            page,
            pageSize,
            items
        });
    }

    /// <summary>
    /// Obtiene un equipo por su ID.
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var equipo = await _repository.GetByIdAsync(id);
        if (equipo == null)
            return NotFound(new { message = $"Equipo con ID {id} no fue encontrado." });

        return Ok(equipo);
    }

    /// <summary>
    /// Transacción de reserva con Bloqueo Pesimista (SELECT ... FOR UPDATE) 
    /// y publicación asíncrona a la cola de Azure (Fase II).
    /// </summary>
    [HttpPost("reservar")]
    public async Task<IActionResult> Reservar([FromBody] ReservaRequest request)
    {
        bool exito = await _equipoService.ReservarEquipoAsync(request.EquipoId, request.Cantidad);
        if (!exito)
        {
            return BadRequest(new { message = "No fue posible realizar la reserva por falta de stock o conflicto de concurrencia." });
        }

        return Ok(new { message = "Reserva realizada exitosamente. Evento enviado a la cola de Azure." });
    }
}

public record ReservaRequest(int EquipoId, int Cantidad);