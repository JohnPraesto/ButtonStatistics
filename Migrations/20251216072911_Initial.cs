using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ButtonStatistics.Migrations
{
    /// <inheritdoc />
    public partial class Initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Days",
                columns: table => new
                {
                    Index = table.Column<int>(type: "INTEGER", nullable: false),
                    Count = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Days", x => x.Index);
                });

            migrationBuilder.CreateTable(
                name: "Hours",
                columns: table => new
                {
                    Index = table.Column<int>(type: "INTEGER", nullable: false),
                    Count = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Hours", x => x.Index);
                });

            migrationBuilder.CreateTable(
                name: "LocalHours",
                columns: table => new
                {
                    Index = table.Column<int>(type: "INTEGER", nullable: false),
                    Count = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LocalHours", x => x.Index);
                });

            migrationBuilder.CreateTable(
                name: "LocalMonths",
                columns: table => new
                {
                    Index = table.Column<int>(type: "INTEGER", nullable: false),
                    Count = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LocalMonths", x => x.Index);
                });

            migrationBuilder.CreateTable(
                name: "LocalWeekdays",
                columns: table => new
                {
                    Index = table.Column<int>(type: "INTEGER", nullable: false),
                    Count = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LocalWeekdays", x => x.Index);
                });

            migrationBuilder.CreateTable(
                name: "Minutes",
                columns: table => new
                {
                    Index = table.Column<int>(type: "INTEGER", nullable: false),
                    Count = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Minutes", x => x.Index);
                });

            migrationBuilder.CreateTable(
                name: "Months",
                columns: table => new
                {
                    Index = table.Column<int>(type: "INTEGER", nullable: false),
                    Count = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Months", x => x.Index);
                });

            migrationBuilder.CreateTable(
                name: "Seconds",
                columns: table => new
                {
                    Index = table.Column<int>(type: "INTEGER", nullable: false),
                    Count = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Seconds", x => x.Index);
                });

            migrationBuilder.CreateTable(
                name: "TotalClicks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Count = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TotalClicks", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Years",
                columns: table => new
                {
                    Index = table.Column<int>(type: "INTEGER", nullable: false),
                    Count = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Years", x => x.Index);
                });

            migrationBuilder.InsertData(
                table: "Days",
                columns: new[] { "Index", "Count" },
                values: new object[,]
                {
                    { 1, 0 },
                    { 2, 0 },
                    { 3, 0 },
                    { 4, 0 },
                    { 5, 0 },
                    { 6, 0 },
                    { 7, 0 },
                    { 8, 0 },
                    { 9, 0 },
                    { 10, 0 },
                    { 11, 0 },
                    { 12, 0 },
                    { 13, 0 },
                    { 14, 0 },
                    { 15, 0 },
                    { 16, 0 },
                    { 17, 0 },
                    { 18, 0 },
                    { 19, 0 },
                    { 20, 0 },
                    { 21, 0 },
                    { 22, 0 },
                    { 23, 0 },
                    { 24, 0 },
                    { 25, 0 },
                    { 26, 0 },
                    { 27, 0 },
                    { 28, 0 },
                    { 29, 0 },
                    { 30, 0 },
                    { 31, 0 }
                });

            migrationBuilder.InsertData(
                table: "Hours",
                columns: new[] { "Index", "Count" },
                values: new object[,]
                {
                    { 0, 0 },
                    { 1, 0 },
                    { 2, 0 },
                    { 3, 0 },
                    { 4, 0 },
                    { 5, 0 },
                    { 6, 0 },
                    { 7, 0 },
                    { 8, 0 },
                    { 9, 0 },
                    { 10, 0 },
                    { 11, 0 },
                    { 12, 0 },
                    { 13, 0 },
                    { 14, 0 },
                    { 15, 0 },
                    { 16, 0 },
                    { 17, 0 },
                    { 18, 0 },
                    { 19, 0 },
                    { 20, 0 },
                    { 21, 0 },
                    { 22, 0 },
                    { 23, 0 }
                });

            migrationBuilder.InsertData(
                table: "LocalHours",
                columns: new[] { "Index", "Count" },
                values: new object[,]
                {
                    { 0, 0 },
                    { 1, 0 },
                    { 2, 0 },
                    { 3, 0 },
                    { 4, 0 },
                    { 5, 0 },
                    { 6, 0 },
                    { 7, 0 },
                    { 8, 0 },
                    { 9, 0 },
                    { 10, 0 },
                    { 11, 0 },
                    { 12, 0 },
                    { 13, 0 },
                    { 14, 0 },
                    { 15, 0 },
                    { 16, 0 },
                    { 17, 0 },
                    { 18, 0 },
                    { 19, 0 },
                    { 20, 0 },
                    { 21, 0 },
                    { 22, 0 },
                    { 23, 0 }
                });

            migrationBuilder.InsertData(
                table: "LocalMonths",
                columns: new[] { "Index", "Count" },
                values: new object[,]
                {
                    { 0, 0 },
                    { 1, 0 },
                    { 2, 0 },
                    { 3, 0 },
                    { 4, 0 },
                    { 5, 0 },
                    { 6, 0 },
                    { 7, 0 },
                    { 8, 0 },
                    { 9, 0 },
                    { 10, 0 },
                    { 11, 0 }
                });

            migrationBuilder.InsertData(
                table: "LocalWeekdays",
                columns: new[] { "Index", "Count" },
                values: new object[,]
                {
                    { 0, 0 },
                    { 1, 0 },
                    { 2, 0 },
                    { 3, 0 },
                    { 4, 0 },
                    { 5, 0 },
                    { 6, 0 }
                });

            migrationBuilder.InsertData(
                table: "Minutes",
                columns: new[] { "Index", "Count" },
                values: new object[,]
                {
                    { 0, 0 },
                    { 1, 0 },
                    { 2, 0 },
                    { 3, 0 },
                    { 4, 0 },
                    { 5, 0 },
                    { 6, 0 },
                    { 7, 0 },
                    { 8, 0 },
                    { 9, 0 },
                    { 10, 0 },
                    { 11, 0 },
                    { 12, 0 },
                    { 13, 0 },
                    { 14, 0 },
                    { 15, 0 },
                    { 16, 0 },
                    { 17, 0 },
                    { 18, 0 },
                    { 19, 0 },
                    { 20, 0 },
                    { 21, 0 },
                    { 22, 0 },
                    { 23, 0 },
                    { 24, 0 },
                    { 25, 0 },
                    { 26, 0 },
                    { 27, 0 },
                    { 28, 0 },
                    { 29, 0 },
                    { 30, 0 },
                    { 31, 0 },
                    { 32, 0 },
                    { 33, 0 },
                    { 34, 0 },
                    { 35, 0 },
                    { 36, 0 },
                    { 37, 0 },
                    { 38, 0 },
                    { 39, 0 },
                    { 40, 0 },
                    { 41, 0 },
                    { 42, 0 },
                    { 43, 0 },
                    { 44, 0 },
                    { 45, 0 },
                    { 46, 0 },
                    { 47, 0 },
                    { 48, 0 },
                    { 49, 0 },
                    { 50, 0 },
                    { 51, 0 },
                    { 52, 0 },
                    { 53, 0 },
                    { 54, 0 },
                    { 55, 0 },
                    { 56, 0 },
                    { 57, 0 },
                    { 58, 0 },
                    { 59, 0 }
                });

            migrationBuilder.InsertData(
                table: "Months",
                columns: new[] { "Index", "Count" },
                values: new object[,]
                {
                    { 1, 0 },
                    { 2, 0 },
                    { 3, 0 },
                    { 4, 0 },
                    { 5, 0 },
                    { 6, 0 },
                    { 7, 0 },
                    { 8, 0 },
                    { 9, 0 },
                    { 10, 0 },
                    { 11, 0 },
                    { 12, 0 }
                });

            migrationBuilder.InsertData(
                table: "Seconds",
                columns: new[] { "Index", "Count" },
                values: new object[,]
                {
                    { 0, 0 },
                    { 1, 0 },
                    { 2, 0 },
                    { 3, 0 },
                    { 4, 0 },
                    { 5, 0 },
                    { 6, 0 },
                    { 7, 0 },
                    { 8, 0 },
                    { 9, 0 },
                    { 10, 0 },
                    { 11, 0 },
                    { 12, 0 },
                    { 13, 0 },
                    { 14, 0 },
                    { 15, 0 },
                    { 16, 0 },
                    { 17, 0 },
                    { 18, 0 },
                    { 19, 0 },
                    { 20, 0 },
                    { 21, 0 },
                    { 22, 0 },
                    { 23, 0 },
                    { 24, 0 },
                    { 25, 0 },
                    { 26, 0 },
                    { 27, 0 },
                    { 28, 0 },
                    { 29, 0 },
                    { 30, 0 },
                    { 31, 0 },
                    { 32, 0 },
                    { 33, 0 },
                    { 34, 0 },
                    { 35, 0 },
                    { 36, 0 },
                    { 37, 0 },
                    { 38, 0 },
                    { 39, 0 },
                    { 40, 0 },
                    { 41, 0 },
                    { 42, 0 },
                    { 43, 0 },
                    { 44, 0 },
                    { 45, 0 },
                    { 46, 0 },
                    { 47, 0 },
                    { 48, 0 },
                    { 49, 0 },
                    { 50, 0 },
                    { 51, 0 },
                    { 52, 0 },
                    { 53, 0 },
                    { 54, 0 },
                    { 55, 0 },
                    { 56, 0 },
                    { 57, 0 },
                    { 58, 0 },
                    { 59, 0 }
                });

            migrationBuilder.InsertData(
                table: "TotalClicks",
                columns: new[] { "Id", "Count" },
                values: new object[] { 1, 0 });

            migrationBuilder.InsertData(
                table: "Years",
                columns: new[] { "Index", "Count" },
                values: new object[,]
                {
                    { 2015, 0 },
                    { 2016, 0 },
                    { 2017, 0 },
                    { 2018, 0 },
                    { 2019, 0 },
                    { 2020, 0 },
                    { 2021, 0 },
                    { 2022, 0 },
                    { 2023, 0 },
                    { 2024, 0 },
                    { 2025, 0 },
                    { 2026, 0 },
                    { 2027, 0 },
                    { 2028, 0 },
                    { 2029, 0 },
                    { 2030, 0 },
                    { 2031, 0 },
                    { 2032, 0 },
                    { 2033, 0 },
                    { 2034, 0 },
                    { 2035, 0 },
                    { 2036, 0 },
                    { 2037, 0 },
                    { 2038, 0 },
                    { 2039, 0 },
                    { 2040, 0 },
                    { 2041, 0 },
                    { 2042, 0 },
                    { 2043, 0 },
                    { 2044, 0 },
                    { 2045, 0 },
                    { 2046, 0 },
                    { 2047, 0 },
                    { 2048, 0 },
                    { 2049, 0 },
                    { 2050, 0 },
                    { 2051, 0 },
                    { 2052, 0 },
                    { 2053, 0 },
                    { 2054, 0 },
                    { 2055, 0 },
                    { 2056, 0 },
                    { 2057, 0 },
                    { 2058, 0 },
                    { 2059, 0 },
                    { 2060, 0 },
                    { 2061, 0 },
                    { 2062, 0 },
                    { 2063, 0 },
                    { 2064, 0 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Days");

            migrationBuilder.DropTable(
                name: "Hours");

            migrationBuilder.DropTable(
                name: "LocalHours");

            migrationBuilder.DropTable(
                name: "LocalMonths");

            migrationBuilder.DropTable(
                name: "LocalWeekdays");

            migrationBuilder.DropTable(
                name: "Minutes");

            migrationBuilder.DropTable(
                name: "Months");

            migrationBuilder.DropTable(
                name: "Seconds");

            migrationBuilder.DropTable(
                name: "TotalClicks");

            migrationBuilder.DropTable(
                name: "Years");
        }
    }
}
