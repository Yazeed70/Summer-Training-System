using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace summer_training_app.Migrations
{
    /// <inheritdoc />
    public partial class OptimizeDatabaseContext : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Colleges",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Companies",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.AlterColumn<bool>(
                name: "IsDeleted",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AlterColumn<string>(
                name: "RoleName",
                table: "Roles",
                type: "varchar(50)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<bool>(
                name: "IsDeleted",
                table: "Users",
                type: "bit",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldDefaultValue: false);

            migrationBuilder.AlterColumn<string>(
                name: "RoleName",
                table: "Roles",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(50)");

            migrationBuilder.InsertData(
                table: "Colleges",
                columns: new[] { "Id", "CollegeAddress", "CollegeName", "ContactEmail", "CreatedAt" },
                values: new object[] { 1, "Madinah", "كلية علوم الحاسب", null, new DateTime(2026, 8, 6, 22, 26, 46, 656, DateTimeKind.Utc).AddTicks(8454) });

            migrationBuilder.InsertData(
                table: "Companies",
                columns: new[] { "Id", "ApprovedAt", "ApprovedByUserId", "CompanyAddress", "CompanyName", "ContactEmail", "CreatedAt", "CreatedByUserId" },
                values: new object[] { 1, null, null, "Riyadh", "شركة السقيفة لتطوير الأعمال", null, new DateTime(2026, 8, 6, 22, 26, 46, 656, DateTimeKind.Utc).AddTicks(8475), null });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "CreatedAt", "Email", "IsActive", "IsDeleted", "LastUpdatedAt", "Name", "PasswordHash", "PhoneNumber", "PublicId", "RoleId", "Username" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 8, 6, 22, 26, 46, 656, DateTimeKind.Utc).AddTicks(8506), null, true, false, new DateTime(2026, 8, 6, 22, 26, 46, 656, DateTimeKind.Utc).AddTicks(8507), "مدير", "$2a$11$wsY6aRAHZfIenc7om01jZuuRlHZ.fNguE9lCbPrkGUs2C0uXqM7hu", null, new Guid("238c594a-c1ae-4693-b5df-ae5f526ca369"), 4, "admin" },
                    { 2, new DateTime(2026, 8, 6, 22, 26, 46, 656, DateTimeKind.Utc).AddTicks(8511), null, true, false, new DateTime(2026, 8, 6, 22, 26, 46, 656, DateTimeKind.Utc).AddTicks(8511), "م. فهد (مشرف شركة)", "$2a$11$Hh2FjbRzwcQc7vbo57ewae7nG9ltg89LCtxJUbpMU6P/dTgqOLxUe", null, new Guid("e11b6210-7dc6-4569-b8e4-36506d5fcb66"), 2, "com" },
                    { 3, new DateTime(2026, 8, 6, 22, 26, 46, 656, DateTimeKind.Utc).AddTicks(8514), null, true, false, new DateTime(2026, 8, 6, 22, 26, 46, 656, DateTimeKind.Utc).AddTicks(8515), "د. خالد (مشرف كلية)", "$2a$11$OvswobrsWbDtYwwHwLzDOuwtuTUmdNxQXZdh0ANvO1yj/okeIA8/i", null, new Guid("bbcfddc1-4549-4d57-b9cb-8e5f9716fc1d"), 3, "col" },
                    { 4, new DateTime(2026, 8, 6, 22, 26, 46, 656, DateTimeKind.Utc).AddTicks(8518), null, true, false, new DateTime(2026, 8, 6, 22, 26, 46, 656, DateTimeKind.Utc).AddTicks(8518), "أحمد (طالب)", "$2a$11$A3yR1hLXMFnkrR3RFK/ZluLdRE0j22y140s6sgkcLuoAUPWb7PrEO", null, new Guid("abf6c389-64f1-4b9a-9e06-40819f9b1f1a"), 1, "stu" }
                });
        }
    }
}
