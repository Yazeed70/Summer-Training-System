using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace summer_training_app.Migrations
{
    /// <inheritdoc />
    public partial class UpdateRoleUpgradeTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RoleUpgradeRequests_Users_ReviewedById",
                table: "RoleUpgradeRequests");

            migrationBuilder.DropIndex(
                name: "IX_RoleUpgradeRequests_UserId_RequestedRoleId_CollegeId",
                table: "RoleUpgradeRequests");

            migrationBuilder.AddColumn<int>(
                name: "CompanyId",
                table: "RoleUpgradeRequests",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_RoleUpgradeRequests_CompanyId",
                table: "RoleUpgradeRequests",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_RoleUpgradeRequests_UserId_RequestedRoleId",
                table: "RoleUpgradeRequests",
                columns: new[] { "UserId", "RequestedRoleId" },
                unique: true,
                filter: "IsDeleted = 0 AND Status = 1");

            migrationBuilder.AddForeignKey(
                name: "FK_RoleUpgradeRequests_Companies_CompanyId",
                table: "RoleUpgradeRequests",
                column: "CompanyId",
                principalTable: "Companies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_RoleUpgradeRequests_Users_ReviewedById",
                table: "RoleUpgradeRequests",
                column: "ReviewedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RoleUpgradeRequests_Companies_CompanyId",
                table: "RoleUpgradeRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_RoleUpgradeRequests_Users_ReviewedById",
                table: "RoleUpgradeRequests");

            migrationBuilder.DropIndex(
                name: "IX_RoleUpgradeRequests_CompanyId",
                table: "RoleUpgradeRequests");

            migrationBuilder.DropIndex(
                name: "IX_RoleUpgradeRequests_UserId_RequestedRoleId",
                table: "RoleUpgradeRequests");

            migrationBuilder.DropColumn(
                name: "CompanyId",
                table: "RoleUpgradeRequests");

            migrationBuilder.CreateIndex(
                name: "IX_RoleUpgradeRequests_UserId_RequestedRoleId_CollegeId",
                table: "RoleUpgradeRequests",
                columns: new[] { "UserId", "RequestedRoleId", "CollegeId" },
                unique: true,
                filter: "IsDeleted = 0");

            migrationBuilder.AddForeignKey(
                name: "FK_RoleUpgradeRequests_Users_ReviewedById",
                table: "RoleUpgradeRequests",
                column: "ReviewedById",
                principalTable: "Users",
                principalColumn: "Id");
        }
    }
}
