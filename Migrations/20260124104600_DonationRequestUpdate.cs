using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ButtonStatistics.Migrations
{
    /// <inheritdoc />
    public partial class DonationRequestUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DateTime",
                table: "DonationRequests",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "Milestone",
                table: "DonationRequests",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DateTime",
                table: "DonationRequests");

            migrationBuilder.DropColumn(
                name: "Milestone",
                table: "DonationRequests");
        }
    }
}
