using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ButtonStatistics.Migrations
{
    /// <inheritdoc />
    public partial class CountryClick : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CountryClicks",
                columns: table => new
                {
                    CountryCode = table.Column<string>(type: "varchar(2)", unicode: false, maxLength: 2, nullable: false),
                    Count = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CountryClicks", x => x.CountryCode);
                });

            migrationBuilder.InsertData(
                table: "CountryClicks",
                columns: new[] { "CountryCode", "Count" },
                values: new object[] { "ZZ", 0 });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CountryClicks");
        }
    }
}
