using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace summer_training_app.Migrations
{
    /// <inheritdoc />
    public partial class OptimizeDatabaseSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Companies_Users_UserId",
                table: "Companies");

            migrationBuilder.DropForeignKey(
                name: "FK_ReportTemplates_Colleges_CollegeId",
                table: "ReportTemplates");

            migrationBuilder.DropForeignKey(
                name: "FK_RoleUpgradeRequests_Colleges_CollegeId",
                table: "RoleUpgradeRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_RoleUpgradeRequests_Roles_RequestedRoleId",
                table: "RoleUpgradeRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_StudentProfiles_Companies_CompanyId",
                table: "StudentProfiles");

            migrationBuilder.DropIndex(
                name: "IX_StudentProfiles_CompanyId",
                table: "StudentProfiles");

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

            migrationBuilder.DropColumn(
                name: "AcadimicYear",
                table: "TrainingRequests");

            migrationBuilder.DropColumn(
                name: "CompanyId",
                table: "StudentProfiles");

            migrationBuilder.DropColumn(
                name: "Order",
                table: "ReportQuestions");

            migrationBuilder.DropColumn(
                name: "ApprovedBy",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "Companies");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "Companies",
                newName: "CreatedByUserId");

            migrationBuilder.RenameIndex(
                name: "IX_Companies_UserId",
                table: "Companies",
                newName: "IX_Companies_CreatedByUserId");

            migrationBuilder.AlterColumn<string>(
                name: "Username",
                table: "Users",
                type: "varchar(50)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<Guid>(
                name: "PublicId",
                table: "Users",
                type: "uniqueidentifier",
                nullable: false,
                defaultValueSql: "NEWID()",
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.AlterColumn<string>(
                name: "PhoneNumber",
                table: "Users",
                type: "varchar(20)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "PasswordHash",
                table: "Users",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Users",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<DateTime>(
                name: "LastUpdatedAt",
                table: "Users",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "GETUTCDATE()",
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<bool>(
                name: "IsActive",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: true,
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Users",
                type: "varchar(100)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Users",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "GETUTCDATE()",
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AlterColumn<string>(
                name: "SuggestedCompanyName",
                table: "TrainingRequests",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(150)",
                oldMaxLength: 150,
                oldNullable: true);

            migrationBuilder.AlterColumn<byte>(
                name: "Status",
                table: "TrainingRequests",
                type: "tinyint",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<DateTime>(
                name: "StartDate",
                table: "TrainingRequests",
                type: "date",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<byte>(
                name: "Semester",
                table: "TrainingRequests",
                type: "tinyint",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<byte>(
                name: "DurationInWeeks",
                table: "TrainingRequests",
                type: "tinyint",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "TrainingRequests",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "GETUTCDATE()",
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<string>(
                name: "AcceptanceLetterPath",
                table: "TrainingRequests",
                type: "varchar(512)",
                maxLength: 512,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(512)",
                oldMaxLength: 512,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AcademicYear",
                table: "TrainingRequests",
                type: "varchar(10)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "TrainingRequests",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<Guid>(
                name: "PublicId",
                table: "TrainingRequests",
                type: "uniqueidentifier",
                nullable: false,
                defaultValueSql: "NEWID()");

            migrationBuilder.AddColumn<int>(
                name: "ReviewedById",
                table: "TrainingRequests",
                type: "int",
                nullable: true);

            migrationBuilder.AlterColumn<byte>(
                name: "Status",
                table: "TrainingRecords",
                type: "tinyint",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<DateTime>(
                name: "StartDate",
                table: "TrainingRecords",
                type: "date",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<byte>(
                name: "Semester",
                table: "TrainingRecords",
                type: "tinyint",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<DateTime>(
                name: "EndDate",
                table: "TrainingRecords",
                type: "date",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "TrainingRecords",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "GETUTCDATE()",
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<string>(
                name: "AcademicYear",
                table: "TrainingRecords",
                type: "varchar(10)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<Guid>(
                name: "PublicId",
                table: "TrainingRecords",
                type: "uniqueidentifier",
                nullable: false,
                defaultValueSql: "NEWID()");

            migrationBuilder.AlterColumn<byte>(
                name: "Status",
                table: "StudentReports",
                type: "tinyint",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<Guid>(
                name: "PublicId",
                table: "StudentReports",
                type: "uniqueidentifier",
                nullable: false,
                defaultValueSql: "NEWID()");

            migrationBuilder.AlterColumn<string>(
                name: "UniversityIdNumber",
                table: "StudentProfiles",
                type: "varchar(20)",
                maxLength: 20,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "GPA",
                table: "StudentProfiles",
                type: "decimal(3,2)",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)",
                oldNullable: true);

            migrationBuilder.AlterColumn<byte>(
                name: "Status",
                table: "RoleUpgradeRequests",
                type: "tinyint",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<string>(
                name: "ProofFilePath",
                table: "RoleUpgradeRequests",
                type: "varchar(512)",
                maxLength: 512,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(512)",
                oldMaxLength: 512);

            migrationBuilder.AlterColumn<string>(
                name: "OfficialEmail",
                table: "RoleUpgradeRequests",
                type: "varchar(100)",
                maxLength: 255,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "RoleUpgradeRequests",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "GETUTCDATE()",
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AddColumn<string>(
                name: "Comment",
                table: "RoleUpgradeRequests",
                type: "nvarchar(max)",
                maxLength: 512,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "RoleUpgradeRequests",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<Guid>(
                name: "PublicId",
                table: "RoleUpgradeRequests",
                type: "uniqueidentifier",
                nullable: false,
                defaultValueSql: "NEWID()");

            migrationBuilder.AddColumn<int>(
                name: "ReviewedById",
                table: "RoleUpgradeRequests",
                type: "int",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "RoleName",
                table: "Roles",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "ReportTemplates",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "GETUTCDATE()",
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<string>(
                name: "Title",
                table: "ReportTemplates",
                type: "nvarchar(150)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<bool>(
                name: "IsAvailable",
                table: "ReportTemplates",
                type: "bit",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AlterColumn<DateTime>(
                name: "DueDate",
                table: "ReportTemplates",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "DATEADD(day, 7, GETUTCDATE())",
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "ReportTemplates",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "GETUTCDATE()",
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<byte>(
                name: "QuestionType",
                table: "ReportQuestions",
                type: "tinyint",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<string>(
                name: "QuestionText",
                table: "ReportQuestions",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255);

            migrationBuilder.AddColumn<bool>(
                name: "IsRequired",
                table: "ReportQuestions",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<byte>(
                name: "OrderPosition",
                table: "ReportQuestions",
                type: "tinyint",
                nullable: false,
                defaultValue: (byte)0);

            migrationBuilder.AlterColumn<byte>(
                name: "Score",
                table: "ReportEvaluations",
                type: "tinyint",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<DateTime>(
                name: "EvaluationDate",
                table: "ReportEvaluations",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "GETUTCDATE()",
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<string>(
                name: "JobTitle",
                table: "CompanyRepresentatives",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "IsDeleted",
                table: "Companies",
                type: "bit",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AlterColumn<bool>(
                name: "IsApproved",
                table: "Companies",
                type: "bit",
                nullable: false,
                defaultValue: false,
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Companies",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "GETUTCDATE()",
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<string>(
                name: "ContactEmail",
                table: "Companies",
                type: "varchar(100)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CompanyName",
                table: "Companies",
                type: "nvarchar(100)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(150)",
                oldMaxLength: 150);

            migrationBuilder.AddColumn<string>(
                name: "CompanyAddress",
                table: "Companies",
                type: "nvarchar(200)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Colleges",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "GETUTCDATE()",
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<string>(
                name: "ContactEmail",
                table: "Colleges",
                type: "varchar(100)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CollegeAddress",
                table: "Colleges",
                type: "nvarchar(200)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Colleges",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AlterColumn<DateTime>(
                name: "UploadedAt",
                table: "CollegeDocuments",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "GETUTCDATE()",
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<string>(
                name: "Title",
                table: "CollegeDocuments",
                type: "nvarchar(150)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "FilePath",
                table: "CollegeDocuments",
                type: "varchar(512)",
                maxLength: 512,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(512)",
                oldMaxLength: 512);

            migrationBuilder.AddUniqueConstraint(
                name: "AK_TrainingRequests_PublicId",
                table: "TrainingRequests",
                column: "PublicId");

            migrationBuilder.AddUniqueConstraint(
                name: "AK_TrainingRecords_PublicId",
                table: "TrainingRecords",
                column: "PublicId");

            migrationBuilder.AddUniqueConstraint(
                name: "AK_StudentReports_PublicId",
                table: "StudentReports",
                column: "PublicId");

            migrationBuilder.AddUniqueConstraint(
                name: "AK_RoleUpgradeRequests_PublicId",
                table: "RoleUpgradeRequests",
                column: "PublicId");

            migrationBuilder.UpdateData(
                table: "Colleges",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CollegeAddress", "CreatedAt" },
                values: new object[] { "Madinah", new DateTime(2026, 8, 6, 22, 26, 46, 656, DateTimeKind.Utc).AddTicks(8454) });

            migrationBuilder.UpdateData(
                table: "Companies",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CompanyAddress", "CreatedAt" },
                values: new object[] { "Riyadh", new DateTime(2026, 8, 6, 22, 26, 46, 656, DateTimeKind.Utc).AddTicks(8475) });

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

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true,
                filter: "[Email] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Username",
                table: "Users",
                column: "Username",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TrainingRequests_ReviewedById",
                table: "TrainingRequests",
                column: "ReviewedById");

            migrationBuilder.CreateIndex(
                name: "IX_TrainingRequests_Status",
                table: "TrainingRequests",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_TrainingRequests_StudentId_AcademicYear_Semester_CompanyId",
                table: "TrainingRequests",
                columns: new[] { "StudentId", "AcademicYear", "Semester", "CompanyId" },
                unique: true,
                filter: "[CompanyId] IS NOT NULL");

            migrationBuilder.AddCheckConstraint(
                name: "CHK_Dates_Logic1",
                table: "TrainingRequests",
                sql: "StartDate > GETUTCDATE()");

            migrationBuilder.AddCheckConstraint(
                name: "CHK_Duration_Logic",
                table: "TrainingRequests",
                sql: "DurationInWeeks > 0");

            migrationBuilder.CreateIndex(
                name: "IX_TrainingRecords_Status",
                table: "TrainingRecords",
                column: "Status");

            migrationBuilder.AddCheckConstraint(
                name: "CHK_Dates_Logic",
                table: "TrainingRecords",
                sql: "EndDate > StartDate");

            migrationBuilder.CreateIndex(
                name: "IX_StudentProfiles_UniversityIdNumber",
                table: "StudentProfiles",
                column: "UniversityIdNumber",
                unique: true,
                filter: "[UniversityIdNumber] IS NOT NULL");

            migrationBuilder.AddCheckConstraint(
                name: "CHK_GPA_Range",
                table: "StudentProfiles",
                sql: "GPA >= 0 AND GPA <= 5");

            migrationBuilder.CreateIndex(
                name: "IX_RoleUpgradeRequests_IsDeleted",
                table: "RoleUpgradeRequests",
                column: "IsDeleted");

            migrationBuilder.CreateIndex(
                name: "IX_RoleUpgradeRequests_ReviewedById",
                table: "RoleUpgradeRequests",
                column: "ReviewedById");

            migrationBuilder.CreateIndex(
                name: "IX_RoleUpgradeRequests_Status",
                table: "RoleUpgradeRequests",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_RoleUpgradeRequests_UserId_RequestedRoleId_CollegeId",
                table: "RoleUpgradeRequests",
                columns: new[] { "UserId", "RequestedRoleId", "CollegeId" },
                unique: true,
                filter: "IsDeleted = 0");

            migrationBuilder.CreateIndex(
                name: "IX_ReportEvaluations_StudentReportId_CompanySupervisorId",
                table: "ReportEvaluations",
                columns: new[] { "StudentReportId", "CompanySupervisorId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ReportAnswers_StudentReportId_QuestionId",
                table: "ReportAnswers",
                columns: new[] { "StudentReportId", "QuestionId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CompanyRepresentatives_UserId_CompanyId",
                table: "CompanyRepresentatives",
                columns: new[] { "UserId", "CompanyId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Companies_CompanyName",
                table: "Companies",
                column: "CompanyName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Colleges_CollegeName",
                table: "Colleges",
                column: "CollegeName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CollegeRepresentatives_UserId_CollegeId",
                table: "CollegeRepresentatives",
                columns: new[] { "UserId", "CollegeId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CollegeDocuments_CollegeId_Title",
                table: "CollegeDocuments",
                columns: new[] { "CollegeId", "Title" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Companies_Users_CreatedByUserId",
                table: "Companies",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ReportTemplates_Colleges_CollegeId",
                table: "ReportTemplates",
                column: "CollegeId",
                principalTable: "Colleges",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_RoleUpgradeRequests_Colleges_CollegeId",
                table: "RoleUpgradeRequests",
                column: "CollegeId",
                principalTable: "Colleges",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_RoleUpgradeRequests_Roles_RequestedRoleId",
                table: "RoleUpgradeRequests",
                column: "RequestedRoleId",
                principalTable: "Roles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_RoleUpgradeRequests_Users_ReviewedById",
                table: "RoleUpgradeRequests",
                column: "ReviewedById",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_TrainingRequests_CollegeRepresentatives_ReviewedById",
                table: "TrainingRequests",
                column: "ReviewedById",
                principalTable: "CollegeRepresentatives",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Companies_Users_CreatedByUserId",
                table: "Companies");

            migrationBuilder.DropForeignKey(
                name: "FK_ReportTemplates_Colleges_CollegeId",
                table: "ReportTemplates");

            migrationBuilder.DropForeignKey(
                name: "FK_RoleUpgradeRequests_Colleges_CollegeId",
                table: "RoleUpgradeRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_RoleUpgradeRequests_Roles_RequestedRoleId",
                table: "RoleUpgradeRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_RoleUpgradeRequests_Users_ReviewedById",
                table: "RoleUpgradeRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_TrainingRequests_CollegeRepresentatives_ReviewedById",
                table: "TrainingRequests");

            migrationBuilder.DropIndex(
                name: "IX_Users_Email",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_Username",
                table: "Users");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_TrainingRequests_PublicId",
                table: "TrainingRequests");

            migrationBuilder.DropIndex(
                name: "IX_TrainingRequests_ReviewedById",
                table: "TrainingRequests");

            migrationBuilder.DropIndex(
                name: "IX_TrainingRequests_Status",
                table: "TrainingRequests");

            migrationBuilder.DropIndex(
                name: "IX_TrainingRequests_StudentId_AcademicYear_Semester_CompanyId",
                table: "TrainingRequests");

            migrationBuilder.DropCheckConstraint(
                name: "CHK_Dates_Logic1",
                table: "TrainingRequests");

            migrationBuilder.DropCheckConstraint(
                name: "CHK_Duration_Logic",
                table: "TrainingRequests");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_TrainingRecords_PublicId",
                table: "TrainingRecords");

            migrationBuilder.DropIndex(
                name: "IX_TrainingRecords_Status",
                table: "TrainingRecords");

            migrationBuilder.DropCheckConstraint(
                name: "CHK_Dates_Logic",
                table: "TrainingRecords");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_StudentReports_PublicId",
                table: "StudentReports");

            migrationBuilder.DropIndex(
                name: "IX_StudentProfiles_UniversityIdNumber",
                table: "StudentProfiles");

            migrationBuilder.DropCheckConstraint(
                name: "CHK_GPA_Range",
                table: "StudentProfiles");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_RoleUpgradeRequests_PublicId",
                table: "RoleUpgradeRequests");

            migrationBuilder.DropIndex(
                name: "IX_RoleUpgradeRequests_IsDeleted",
                table: "RoleUpgradeRequests");

            migrationBuilder.DropIndex(
                name: "IX_RoleUpgradeRequests_ReviewedById",
                table: "RoleUpgradeRequests");

            migrationBuilder.DropIndex(
                name: "IX_RoleUpgradeRequests_Status",
                table: "RoleUpgradeRequests");

            migrationBuilder.DropIndex(
                name: "IX_RoleUpgradeRequests_UserId_RequestedRoleId_CollegeId",
                table: "RoleUpgradeRequests");

            migrationBuilder.DropIndex(
                name: "IX_ReportEvaluations_StudentReportId_CompanySupervisorId",
                table: "ReportEvaluations");

            migrationBuilder.DropIndex(
                name: "IX_ReportAnswers_StudentReportId_QuestionId",
                table: "ReportAnswers");

            migrationBuilder.DropIndex(
                name: "IX_CompanyRepresentatives_UserId_CompanyId",
                table: "CompanyRepresentatives");

            migrationBuilder.DropIndex(
                name: "IX_Companies_CompanyName",
                table: "Companies");

            migrationBuilder.DropIndex(
                name: "IX_Colleges_CollegeName",
                table: "Colleges");

            migrationBuilder.DropIndex(
                name: "IX_CollegeRepresentatives_UserId_CollegeId",
                table: "CollegeRepresentatives");

            migrationBuilder.DropIndex(
                name: "IX_CollegeDocuments_CollegeId_Title",
                table: "CollegeDocuments");

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

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "AcademicYear",
                table: "TrainingRequests");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "TrainingRequests");

            migrationBuilder.DropColumn(
                name: "PublicId",
                table: "TrainingRequests");

            migrationBuilder.DropColumn(
                name: "ReviewedById",
                table: "TrainingRequests");

            migrationBuilder.DropColumn(
                name: "PublicId",
                table: "TrainingRecords");

            migrationBuilder.DropColumn(
                name: "PublicId",
                table: "StudentReports");

            migrationBuilder.DropColumn(
                name: "Comment",
                table: "RoleUpgradeRequests");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "RoleUpgradeRequests");

            migrationBuilder.DropColumn(
                name: "PublicId",
                table: "RoleUpgradeRequests");

            migrationBuilder.DropColumn(
                name: "ReviewedById",
                table: "RoleUpgradeRequests");

            migrationBuilder.DropColumn(
                name: "IsRequired",
                table: "ReportQuestions");

            migrationBuilder.DropColumn(
                name: "OrderPosition",
                table: "ReportQuestions");

            migrationBuilder.DropColumn(
                name: "CompanyAddress",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "CollegeAddress",
                table: "Colleges");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Colleges");

            migrationBuilder.RenameColumn(
                name: "CreatedByUserId",
                table: "Companies",
                newName: "UserId");

            migrationBuilder.RenameIndex(
                name: "IX_Companies_CreatedByUserId",
                table: "Companies",
                newName: "IX_Companies_UserId");

            migrationBuilder.AlterColumn<string>(
                name: "Username",
                table: "Users",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(50)");

            migrationBuilder.AlterColumn<Guid>(
                name: "PublicId",
                table: "Users",
                type: "uniqueidentifier",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldDefaultValueSql: "NEWID()");

            migrationBuilder.AlterColumn<string>(
                name: "PhoneNumber",
                table: "Users",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "varchar(20)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "PasswordHash",
                table: "Users",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Users",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<DateTime>(
                name: "LastUpdatedAt",
                table: "Users",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValueSql: "GETUTCDATE()");

            migrationBuilder.AlterColumn<bool>(
                name: "IsActive",
                table: "Users",
                type: "bit",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldDefaultValue: true);

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Users",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "varchar(100)",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Users",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValueSql: "GETUTCDATE()");

            migrationBuilder.AlterColumn<string>(
                name: "SuggestedCompanyName",
                table: "TrainingRequests",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "Status",
                table: "TrainingRequests",
                type: "int",
                nullable: false,
                oldClrType: typeof(byte),
                oldType: "tinyint");

            migrationBuilder.AlterColumn<DateTime>(
                name: "StartDate",
                table: "TrainingRequests",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "date");

            migrationBuilder.AlterColumn<string>(
                name: "Semester",
                table: "TrainingRequests",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(byte),
                oldType: "tinyint");

            migrationBuilder.AlterColumn<int>(
                name: "DurationInWeeks",
                table: "TrainingRequests",
                type: "int",
                nullable: false,
                oldClrType: typeof(byte),
                oldType: "tinyint");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "TrainingRequests",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValueSql: "GETUTCDATE()");

            migrationBuilder.AlterColumn<string>(
                name: "AcceptanceLetterPath",
                table: "TrainingRequests",
                type: "nvarchar(512)",
                maxLength: 512,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "varchar(512)",
                oldMaxLength: 512,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AcadimicYear",
                table: "TrainingRequests",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<int>(
                name: "Status",
                table: "TrainingRecords",
                type: "int",
                nullable: false,
                oldClrType: typeof(byte),
                oldType: "tinyint");

            migrationBuilder.AlterColumn<DateTime>(
                name: "StartDate",
                table: "TrainingRecords",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "date");

            migrationBuilder.AlterColumn<string>(
                name: "Semester",
                table: "TrainingRecords",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(byte),
                oldType: "tinyint");

            migrationBuilder.AlterColumn<DateTime>(
                name: "EndDate",
                table: "TrainingRecords",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "date");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "TrainingRecords",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValueSql: "GETUTCDATE()");

            migrationBuilder.AlterColumn<string>(
                name: "AcademicYear",
                table: "TrainingRecords",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(10)");

            migrationBuilder.AlterColumn<int>(
                name: "Status",
                table: "StudentReports",
                type: "int",
                nullable: false,
                oldClrType: typeof(byte),
                oldType: "tinyint");

            migrationBuilder.AlterColumn<string>(
                name: "UniversityIdNumber",
                table: "StudentProfiles",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "varchar(20)",
                oldMaxLength: 20,
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "GPA",
                table: "StudentProfiles",
                type: "decimal(18,2)",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(3,2)",
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CompanyId",
                table: "StudentProfiles",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<int>(
                name: "Status",
                table: "RoleUpgradeRequests",
                type: "int",
                nullable: false,
                oldClrType: typeof(byte),
                oldType: "tinyint");

            migrationBuilder.AlterColumn<string>(
                name: "ProofFilePath",
                table: "RoleUpgradeRequests",
                type: "nvarchar(512)",
                maxLength: 512,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(512)",
                oldMaxLength: 512);

            migrationBuilder.AlterColumn<string>(
                name: "OfficialEmail",
                table: "RoleUpgradeRequests",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(100)",
                oldMaxLength: 255);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "RoleUpgradeRequests",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValueSql: "GETUTCDATE()");

            migrationBuilder.AlterColumn<string>(
                name: "RoleName",
                table: "Roles",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "ReportTemplates",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValueSql: "GETUTCDATE()");

            migrationBuilder.AlterColumn<string>(
                name: "Title",
                table: "ReportTemplates",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(150)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<bool>(
                name: "IsAvailable",
                table: "ReportTemplates",
                type: "bit",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldDefaultValue: false);

            migrationBuilder.AlterColumn<DateTime>(
                name: "DueDate",
                table: "ReportTemplates",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValueSql: "DATEADD(day, 7, GETUTCDATE())");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "ReportTemplates",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValueSql: "GETUTCDATE()");

            migrationBuilder.AlterColumn<int>(
                name: "QuestionType",
                table: "ReportQuestions",
                type: "int",
                nullable: false,
                oldClrType: typeof(byte),
                oldType: "tinyint");

            migrationBuilder.AlterColumn<string>(
                name: "QuestionText",
                table: "ReportQuestions",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<int>(
                name: "Order",
                table: "ReportQuestions",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<int>(
                name: "Score",
                table: "ReportEvaluations",
                type: "int",
                nullable: false,
                oldClrType: typeof(byte),
                oldType: "tinyint");

            migrationBuilder.AlterColumn<DateTime>(
                name: "EvaluationDate",
                table: "ReportEvaluations",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValueSql: "GETUTCDATE()");

            migrationBuilder.AlterColumn<string>(
                name: "JobTitle",
                table: "CompanyRepresentatives",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "IsDeleted",
                table: "Companies",
                type: "bit",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldDefaultValue: false);

            migrationBuilder.AlterColumn<bool>(
                name: "IsApproved",
                table: "Companies",
                type: "bit",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldDefaultValue: false);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Companies",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValueSql: "GETUTCDATE()");

            migrationBuilder.AlterColumn<string>(
                name: "ContactEmail",
                table: "Companies",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "varchar(100)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "CompanyName",
                table: "Companies",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)");

            migrationBuilder.AddColumn<int>(
                name: "ApprovedBy",
                table: "Companies",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CreatedBy",
                table: "Companies",
                type: "int",
                nullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Colleges",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValueSql: "GETUTCDATE()");

            migrationBuilder.AlterColumn<string>(
                name: "ContactEmail",
                table: "Colleges",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "varchar(100)",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "UploadedAt",
                table: "CollegeDocuments",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValueSql: "GETUTCDATE()");

            migrationBuilder.AlterColumn<string>(
                name: "Title",
                table: "CollegeDocuments",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(150)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "FilePath",
                table: "CollegeDocuments",
                type: "nvarchar(512)",
                maxLength: 512,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(512)",
                oldMaxLength: 512);

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
                columns: new[] { "ApprovedBy", "CreatedAt", "CreatedBy" },
                values: new object[] { null, new DateTime(2026, 8, 5, 15, 10, 22, 299, DateTimeKind.Local).AddTicks(6115), null });

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

            migrationBuilder.CreateIndex(
                name: "IX_StudentProfiles_CompanyId",
                table: "StudentProfiles",
                column: "CompanyId");

            migrationBuilder.AddForeignKey(
                name: "FK_Companies_Users_UserId",
                table: "Companies",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ReportTemplates_Colleges_CollegeId",
                table: "ReportTemplates",
                column: "CollegeId",
                principalTable: "Colleges",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_RoleUpgradeRequests_Colleges_CollegeId",
                table: "RoleUpgradeRequests",
                column: "CollegeId",
                principalTable: "Colleges",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_RoleUpgradeRequests_Roles_RequestedRoleId",
                table: "RoleUpgradeRequests",
                column: "RequestedRoleId",
                principalTable: "Roles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_StudentProfiles_Companies_CompanyId",
                table: "StudentProfiles",
                column: "CompanyId",
                principalTable: "Companies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
