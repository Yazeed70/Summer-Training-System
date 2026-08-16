using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace summer_training_app.Migrations
{
    /// <inheritdoc />
    public partial class updateData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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

            migrationBuilder.UpdateData(
                table: "Colleges",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 5, 15, 10, 22, 299, DateTimeKind.Local).AddTicks(6031));

            migrationBuilder.UpdateData(
                table: "Companies",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 5, 15, 10, 22, 299, DateTimeKind.Local).AddTicks(6115));

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "CreatedAt", "Email", "IsActive", "LastUpdatedAt", "Name", "PasswordHash", "PhoneNumber", "PublicId", "RoleId", "Username" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 8, 5, 15, 10, 22, 299, DateTimeKind.Local).AddTicks(6263), null, true, new DateTime(2026, 8, 5, 15, 10, 22, 299, DateTimeKind.Local).AddTicks(6265), "مدير", "$2a$11$wsY6aRAHZfIenc7om01jZuuRlHZ.fNguE9lCbPrkGUs2C0uXqM7hu", null, new Guid("353f8f8c-87f7-4baa-8f4e-42af7e9a5164"), 4, "admin" },
                    { 2, new DateTime(2026, 8, 5, 15, 10, 22, 299, DateTimeKind.Local).AddTicks(6300), null, true, new DateTime(2026, 8, 5, 15, 10, 22, 299, DateTimeKind.Local).AddTicks(6303), "م. فهد (مشرف شركة)", "$2a$11$Hh2FjbRzwcQc7vbo57ewae7nG9ltg89LCtxJUbpMU6P/dTgqOLxUe", null, new Guid("898cef11-cad7-4948-930b-ac938d8e9373"), 2, "com" },
                    { 3, new DateTime(2026, 8, 5, 15, 10, 22, 299, DateTimeKind.Local).AddTicks(6316), null, true, new DateTime(2026, 8, 5, 15, 10, 22, 299, DateTimeKind.Local).AddTicks(6318), "د. خالد (مشرف كلية)", "$2a$11$OvswobrsWbDtYwwHwLzDOuwtuTUmdNxQXZdh0ANvO1yj/okeIA8/i", null, new Guid("c791234e-ec78-42cb-9a77-f87e817a0f2c"), 3, "col" },
                    { 4, new DateTime(2026, 8, 5, 15, 10, 22, 299, DateTimeKind.Local).AddTicks(6330), null, true, new DateTime(2026, 8, 5, 15, 10, 22, 299, DateTimeKind.Local).AddTicks(6332), "أحمد (طالب)", "$2a$11$A3yR1hLXMFnkrR3RFK/ZluLdRE0j22y140s6sgkcLuoAUPWb7PrEO", null, new Guid("6323615a-e662-480a-9bf5-dbfb158e3211"), 1, "stu" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
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

            migrationBuilder.UpdateData(
                table: "Colleges",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 2, 21, 31, 56, 537, DateTimeKind.Local).AddTicks(8689));

            migrationBuilder.UpdateData(
                table: "Companies",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 8, 2, 21, 31, 56, 537, DateTimeKind.Local).AddTicks(8747));

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "CreatedAt", "Email", "IsActive", "LastUpdatedAt", "Name", "PasswordHash", "PhoneNumber", "PublicId", "RoleId", "Username" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 8, 2, 21, 31, 56, 537, DateTimeKind.Local).AddTicks(8842), null, true, new DateTime(2026, 8, 2, 21, 31, 56, 537, DateTimeKind.Local).AddTicks(8843), "مدير", "$2a$11$wsY6aRAHZfIenc7om01jZuuRlHZ.fNguE9lCbPrkGUs2C0uXqM7hu", null, new Guid("c35dfae5-083f-41f2-9067-fae63dde5bfc"), 4, "admin" },
                    { 2, new DateTime(2026, 8, 2, 21, 31, 56, 537, DateTimeKind.Local).AddTicks(8851), null, true, new DateTime(2026, 8, 2, 21, 31, 56, 537, DateTimeKind.Local).AddTicks(8852), "م. فهد (مشرف شركة)", "$2a$11$Hh2FjbRzwcQc7vbo57ewae7nG9ltg89LCtxJUbpMU6P/dTgqOLxUe", null, new Guid("875fcbd4-7163-4348-9c75-2d15c7a86607"), 2, "com" },
                    { 3, new DateTime(2026, 8, 2, 21, 31, 56, 537, DateTimeKind.Local).AddTicks(8859), null, true, new DateTime(2026, 8, 2, 21, 31, 56, 537, DateTimeKind.Local).AddTicks(8861), "د. خالد (مشرف كلية)", "$2a$11$OvswobrsWbDtYwwHwLzDOuwtuTUmdNxQXZdh0ANvO1yj/okeIA8/i", null, new Guid("f8915aca-7581-4cf4-a886-4b32d7ffc0bc"), 3, "col" },
                    { 4, new DateTime(2026, 8, 2, 21, 31, 56, 537, DateTimeKind.Local).AddTicks(8884), null, true, new DateTime(2026, 8, 2, 21, 31, 56, 537, DateTimeKind.Local).AddTicks(8885), "أحمد (طالب)", "$2a$11$A3yR1hLXMFnkrR3RFK/ZluLdRE0j22y140s6sgkcLuoAUPWb7PrEO", null, new Guid("aec7011d-dd67-4bf8-93eb-858bb5082279"), 1, "stu" }
                });
        }
    }
}
