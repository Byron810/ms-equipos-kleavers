namespace Kleavers.Equipos.Domain;

public class Equipo
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Categoria { get; set; } = string.Empty;
    public int CantidadTotal { get; set; }
    public int CantidadDisponible { get; set; }
    public int CantidadAsignada { get; set; }
    public string Estado { get; set; } = "Disponible";

    public bool Reservar(int cantidad)
    {
        if (cantidad <= 0 || CantidadDisponible < cantidad)
        {
            return false;
        }

        CantidadDisponible -= cantidad;
        CantidadAsignada += cantidad;

        if (CantidadDisponible == 0)
        {
            Estado = "Agotado";
        }

        return true;
    }
}