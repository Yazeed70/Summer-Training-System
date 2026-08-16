using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace summer_training_app.Migrations
{
    /// <inheritdoc />
    public partial class UpdateReportTemplateTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "PublicId",
                table: "ReportTemplates",
                type: "uniqueidentifier",
                nullable: false,
                defaultValueSql: "NEWID()");

            migrationBuilder.AddUniqueConstraint(
                name: "AK_ReportTemplates_PublicId",
                table: "ReportTemplates",
                column: "PublicId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropUniqueConstraint(
                name: "AK_ReportTemplates_PublicId",
                table: "ReportTemplates");

            migrationBuilder.DropColumn(
                name: "PublicId",
                table: "ReportTemplates");
        }
    }
}
