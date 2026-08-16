using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace summer_training_app.Migrations
{
    /// <inheritdoc />
    public partial class InitailSetup : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Colleges",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CollegeName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ContactEmail = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Colleges", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoleName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CollegeDocuments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    FilePath = table.Column<string>(type: "nvarchar(512)", maxLength: 512, nullable: false),
                    CollegeId = table.Column<int>(type: "int", nullable: false),
                    UploadedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CollegeDocuments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CollegeDocuments_Colleges_CollegeId",
                        column: x => x.CollegeId,
                        principalTable: "Colleges",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PublicId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Username = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    RoleId = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastUpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    PhoneNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                    table.UniqueConstraint("AK_Users_PublicId", x => x.PublicId);
                    table.ForeignKey(
                        name: "FK_Users_Roles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CollegeRepresentatives",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "int", nullable: false),
                    CollegeId = table.Column<int>(type: "int", nullable: false),
                    JobTitle = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Department = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CollegeRepresentatives", x => x.UserId);
                    table.ForeignKey(
                        name: "FK_CollegeRepresentatives_Colleges_CollegeId",
                        column: x => x.CollegeId,
                        principalTable: "Colleges",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CollegeRepresentatives_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Companies",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    ContactEmail = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    IsApproved = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    UserId = table.Column<int>(type: "int", nullable: true),
                    ApprovedBy = table.Column<int>(type: "int", nullable: true),
                    ApprovedByUserId = table.Column<int>(type: "int", nullable: true),
                    ApprovedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Companies", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Companies_Users_ApprovedByUserId",
                        column: x => x.ApprovedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Companies_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "RoleUpgradeRequests",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    RequestedRoleId = table.Column<int>(type: "int", nullable: false),
                    CollegeId = table.Column<int>(type: "int", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    OfficialEmail = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    ProofFilePath = table.Column<string>(type: "nvarchar(512)", maxLength: 512, nullable: false),
                    ReviewedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RoleUpgradeRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RoleUpgradeRequests_Colleges_CollegeId",
                        column: x => x.CollegeId,
                        principalTable: "Colleges",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_RoleUpgradeRequests_Roles_RequestedRoleId",
                        column: x => x.RequestedRoleId,
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RoleUpgradeRequests_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ReportTemplates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CollegeId = table.Column<int>(type: "int", nullable: false),
                    IsAvailable = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: false),
                    DueDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReportTemplates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ReportTemplates_CollegeRepresentatives_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "CollegeRepresentatives",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ReportTemplates_Colleges_CollegeId",
                        column: x => x.CollegeId,
                        principalTable: "Colleges",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CompanyRepresentatives",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "int", nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    JobTitle = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompanyRepresentatives", x => x.UserId);
                    table.ForeignKey(
                        name: "FK_CompanyRepresentatives_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CompanyRepresentatives_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "StudentProfiles",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "int", nullable: false),
                    CollegeId = table.Column<int>(type: "int", nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    UniversityIdNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Major = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    GPA = table.Column<decimal>(type: "decimal(18,2)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StudentProfiles", x => x.UserId);
                    table.ForeignKey(
                        name: "FK_StudentProfiles_Colleges_CollegeId",
                        column: x => x.CollegeId,
                        principalTable: "Colleges",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StudentProfiles_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_StudentProfiles_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ReportQuestions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TemplateId = table.Column<int>(type: "int", nullable: false),
                    QuestionText = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    QuestionType = table.Column<int>(type: "int", nullable: false),
                    OptionsPayload = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Order = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReportQuestions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ReportQuestions_ReportTemplates_TemplateId",
                        column: x => x.TemplateId,
                        principalTable: "ReportTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TrainingRecords",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StudentId = table.Column<int>(type: "int", nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AcademicYear = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Semester = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TrainingRecords", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TrainingRecords_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TrainingRecords_StudentProfiles_StudentId",
                        column: x => x.StudentId,
                        principalTable: "StudentProfiles",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "TrainingRequests",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StudentId = table.Column<int>(type: "int", nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: true),
                    SuggestedCompanyName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    AcceptanceLetterPath = table.Column<string>(type: "nvarchar(512)", maxLength: 512, nullable: true),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DurationInWeeks = table.Column<int>(type: "int", nullable: false),
                    AcadimicYear = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Semester = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Comment = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ReviewedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TrainingRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TrainingRequests_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalTable: "Companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TrainingRequests_StudentProfiles_StudentId",
                        column: x => x.StudentId,
                        principalTable: "StudentProfiles",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "StudentReports",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StudentId = table.Column<int>(type: "int", nullable: false),
                    TrainingRecordId = table.Column<int>(type: "int", nullable: false),
                    TemplateId = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    SubmissionDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StudentReports", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StudentReports_ReportTemplates_TemplateId",
                        column: x => x.TemplateId,
                        principalTable: "ReportTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StudentReports_StudentProfiles_StudentId",
                        column: x => x.StudentId,
                        principalTable: "StudentProfiles",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StudentReports_TrainingRecords_TrainingRecordId",
                        column: x => x.TrainingRecordId,
                        principalTable: "TrainingRecords",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ReportAnswers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StudentReportId = table.Column<int>(type: "int", nullable: false),
                    QuestionId = table.Column<int>(type: "int", nullable: false),
                    AnswerValue = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReportAnswers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ReportAnswers_ReportQuestions_QuestionId",
                        column: x => x.QuestionId,
                        principalTable: "ReportQuestions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ReportAnswers_StudentReports_StudentReportId",
                        column: x => x.StudentReportId,
                        principalTable: "StudentReports",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ReportEvaluations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StudentReportId = table.Column<int>(type: "int", nullable: false),
                    CompanySupervisorId = table.Column<int>(type: "int", nullable: false),
                    Comments = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Score = table.Column<int>(type: "int", nullable: false),
                    EvaluationDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReportEvaluations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ReportEvaluations_CompanyRepresentatives_CompanySupervisorId",
                        column: x => x.CompanySupervisorId,
                        principalTable: "CompanyRepresentatives",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ReportEvaluations_StudentReports_StudentReportId",
                        column: x => x.StudentReportId,
                        principalTable: "StudentReports",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Colleges",
                columns: new[] { "Id", "CollegeName", "ContactEmail", "CreatedAt" },
                values: new object[] { 1, "كلية علوم الحاسب", null, new DateTime(2026, 8, 2, 21, 31, 56, 537, DateTimeKind.Local).AddTicks(8689) });

            migrationBuilder.InsertData(
                table: "Companies",
                columns: new[] { "Id", "ApprovedAt", "ApprovedBy", "ApprovedByUserId", "CompanyName", "ContactEmail", "CreatedAt", "CreatedBy", "IsApproved", "IsDeleted", "UserId" },
                values: new object[] { 1, null, null, null, "شركة السقيفة لتطوير الأعمال", null, new DateTime(2026, 8, 2, 21, 31, 56, 537, DateTimeKind.Local).AddTicks(8747), null, false, false, null });

            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "Id", "RoleName" },
                values: new object[,]
                {
                    { 1, "Student" },
                    { 2, "CompanyRep" },
                    { 3, "CollegeRep" },
                    { 4, "SuperAdmin" }
                });

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

            migrationBuilder.CreateIndex(
                name: "IX_CollegeDocuments_CollegeId",
                table: "CollegeDocuments",
                column: "CollegeId");

            migrationBuilder.CreateIndex(
                name: "IX_CollegeRepresentatives_CollegeId",
                table: "CollegeRepresentatives",
                column: "CollegeId");

            migrationBuilder.CreateIndex(
                name: "IX_Companies_ApprovedByUserId",
                table: "Companies",
                column: "ApprovedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Companies_UserId",
                table: "Companies",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyRepresentatives_CompanyId",
                table: "CompanyRepresentatives",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_ReportAnswers_QuestionId",
                table: "ReportAnswers",
                column: "QuestionId");

            migrationBuilder.CreateIndex(
                name: "IX_ReportAnswers_StudentReportId",
                table: "ReportAnswers",
                column: "StudentReportId");

            migrationBuilder.CreateIndex(
                name: "IX_ReportEvaluations_CompanySupervisorId",
                table: "ReportEvaluations",
                column: "CompanySupervisorId");

            migrationBuilder.CreateIndex(
                name: "IX_ReportEvaluations_StudentReportId",
                table: "ReportEvaluations",
                column: "StudentReportId");

            migrationBuilder.CreateIndex(
                name: "IX_ReportQuestions_TemplateId",
                table: "ReportQuestions",
                column: "TemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_ReportTemplates_CollegeId",
                table: "ReportTemplates",
                column: "CollegeId");

            migrationBuilder.CreateIndex(
                name: "IX_ReportTemplates_CreatedBy",
                table: "ReportTemplates",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_RoleUpgradeRequests_CollegeId",
                table: "RoleUpgradeRequests",
                column: "CollegeId");

            migrationBuilder.CreateIndex(
                name: "IX_RoleUpgradeRequests_RequestedRoleId",
                table: "RoleUpgradeRequests",
                column: "RequestedRoleId");

            migrationBuilder.CreateIndex(
                name: "IX_RoleUpgradeRequests_UserId",
                table: "RoleUpgradeRequests",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentProfiles_CollegeId",
                table: "StudentProfiles",
                column: "CollegeId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentProfiles_CompanyId",
                table: "StudentProfiles",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentReports_StudentId",
                table: "StudentReports",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentReports_TemplateId",
                table: "StudentReports",
                column: "TemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_StudentReports_TrainingRecordId",
                table: "StudentReports",
                column: "TrainingRecordId");

            migrationBuilder.CreateIndex(
                name: "IX_TrainingRecords_CompanyId",
                table: "TrainingRecords",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_TrainingRecords_StudentId",
                table: "TrainingRecords",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_TrainingRequests_CompanyId",
                table: "TrainingRequests",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_TrainingRequests_StudentId",
                table: "TrainingRequests",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_RoleId",
                table: "Users",
                column: "RoleId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CollegeDocuments");

            migrationBuilder.DropTable(
                name: "ReportAnswers");

            migrationBuilder.DropTable(
                name: "ReportEvaluations");

            migrationBuilder.DropTable(
                name: "RoleUpgradeRequests");

            migrationBuilder.DropTable(
                name: "TrainingRequests");

            migrationBuilder.DropTable(
                name: "ReportQuestions");

            migrationBuilder.DropTable(
                name: "CompanyRepresentatives");

            migrationBuilder.DropTable(
                name: "StudentReports");

            migrationBuilder.DropTable(
                name: "ReportTemplates");

            migrationBuilder.DropTable(
                name: "TrainingRecords");

            migrationBuilder.DropTable(
                name: "CollegeRepresentatives");

            migrationBuilder.DropTable(
                name: "StudentProfiles");

            migrationBuilder.DropTable(
                name: "Colleges");

            migrationBuilder.DropTable(
                name: "Companies");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Roles");
        }
    }
}
