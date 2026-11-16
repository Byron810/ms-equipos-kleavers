namespace Kleavers.Equipos.Domain;

public class Reserva
{
    public int Id { get; set; }
    public string EventoId { get; set; } = string.Empty;
    public int EquipoId { get; set; }
    public int Cantidad { get; set; }
    public long FechaEpochMs { get; set; }

    public Equipo? Equipo { get; set; }
}