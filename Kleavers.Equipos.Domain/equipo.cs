namespace Kleavers.Equipos.Domain;

public class Equipo
{
    public int Id { get; set; }
    
    // 1. Renombrado para que coincida con el frontend
    public string NombreEquipo { get; set; } = string.Empty; 
    
    // 2. Nuevo campo requerido para calcular montos
    public decimal PrecioAlquiler { get; set; } 
    
    // Valores esperados: Video, Audio, Mobiliario, Estructuras, Iluminación, Decoración
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