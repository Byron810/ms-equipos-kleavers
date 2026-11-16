using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Kleavers.Equipos.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AjustesContratoNahomy : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Nombre",
                table: "Equipos",
                newName: "NombreEquipo");

            migrationBuilder.AddColumn<decimal>(
                name: "PrecioAlquiler",
                table: "Equipos",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PrecioAlquiler",
                table: "Equipos");

            migrationBuilder.RenameColumn(
                name: "NombreEquipo",
                table: "Equipos",
                newName: "Nombre");
        }
    }
}
