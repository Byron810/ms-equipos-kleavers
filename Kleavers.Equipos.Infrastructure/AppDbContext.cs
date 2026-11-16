using Microsoft.EntityFrameworkCore;
using Kleavers.Equipos.Domain; 

namespace Kleavers.Equipos.Infrastructure;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Equipo> Equipos { get; set; }
    public DbSet<Reserva> Reservas { get; set; }
}