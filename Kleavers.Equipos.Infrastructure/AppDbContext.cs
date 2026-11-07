using Microsoft.EntityFrameworkCore;
using Kleavers.Equipos.Domain;
using Microsoft.EntityFrameworkCore;
using Kleavers.Equipos.Domain; // O el namespace donde tengas tu entidad de Equipo

namespace Kleavers.Equipos.Infrastructure;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Equipo> Equipos { get; set; }
}