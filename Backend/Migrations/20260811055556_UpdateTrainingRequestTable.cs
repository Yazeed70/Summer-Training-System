using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace summer_training_app.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTrainingRequestTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CHK_Duration_Logic",
                table: "TrainingRequests");

            migrationBuilder.DropColumn(
                name: "DurationInWeeks",
                table: "TrainingRequests");

            migrationBuilder.AddColumn<DateOnly>(
                name: "EndDate",
                table: "TrainingRequests",
                type: "date",
                nullable: false,
                defaultValue: new DateOnly(1, 1, 1));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EndDate",
                table: "TrainingRequests");

            migrationBuilder.AddColumn<byte>(
                name: "DurationInWeeks",
                table: "TrainingRequests",
                type: "tinyint",
                nullable: false,
                defaultValue: (byte)0);

            migrationBuilder.AddCheckConstraint(
                name: "CHK_Duration_Logic",
                table: "TrainingRequests",
                sql: "DurationInWeeks > 0");
        }
    }
}
