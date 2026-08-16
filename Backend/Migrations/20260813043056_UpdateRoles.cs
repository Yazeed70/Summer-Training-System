using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace summer_training_app.Migrations
{
    /// <inheritdoc />
    public partial class UpdateRoles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_RoleUpgradeRequests_IsDeleted",
                table: "RoleUpgradeRequests");

            migrationBuilder.DropIndex(
                name: "IX_RoleUpgradeRequests_UserId_RequestedRoleId",
                table: "RoleUpgradeRequests");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "RoleUpgradeRequests");

            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "Id", "RoleName" },
                values: new object[] { 5, "BasicUser" });

            migrationBuilder.CreateIndex(
                name: "IX_RoleUpgradeRequests_UserId_RequestedRoleId",
                table: "RoleUpgradeRequests",
                columns: new[] { "UserId", "RequestedRoleId" },
                unique: true,
                filter: "Status = 1");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_RoleUpgradeRequests_UserId_RequestedRoleId",
                table: "RoleUpgradeRequests");

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "RoleUpgradeRequests",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_RoleUpgradeRequests_IsDeleted",
                table: "RoleUpgradeRequests",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_RoleUpgradeRequests_UserId_RequestedRoleId",
                table: "RoleUpgradeRequests",
                columns: new[] { "UserId", "RequestedRoleId" },
                unique: true,
                filter: "IsDeleted = 0 AND Status = 1");
        }
    }
}
