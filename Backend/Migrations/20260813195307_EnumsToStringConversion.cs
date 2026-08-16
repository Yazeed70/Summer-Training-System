using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace summer_training_app.Migrations
{
    /// <inheritdoc />
    public partial class EnumsToStringConversion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_RoleUpgradeRequests_UserId_RequestedRoleId",
                table: "RoleUpgradeRequests");

            migrationBuilder.DropCheckConstraint(
                name: "CK_ReportEvaluation_PhaseOwner",
                table: "ReportEvaluations");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "TrainingRequests",
                type: "varchar(20)",
                unicode: false,
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(byte),
                oldType: "tinyint");

            migrationBuilder.AlterColumn<string>(
                name: "Semester",
                table: "TrainingRequests",
                type: "varchar(20)",
                unicode: false,
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(byte),
                oldType: "tinyint");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "TrainingRecords",
                type: "varchar(20)",
                unicode: false,
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(byte),
                oldType: "tinyint");

            migrationBuilder.AlterColumn<string>(
                name: "Semester",
                table: "TrainingRecords",
                type: "varchar(20)",
                unicode: false,
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(byte),
                oldType: "tinyint");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "StudentReports",
                type: "varchar(30)",
                unicode: false,
                maxLength: 30,
                nullable: false,
                oldClrType: typeof(byte),
                oldType: "tinyint");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "RoleUpgradeRequests",
                type: "varchar(20)",
                unicode: false,
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(byte),
                oldType: "tinyint");

            migrationBuilder.AlterColumn<string>(
                name: "QuestionType",
                table: "ReportQuestions",
                type: "varchar(25)",
                unicode: false,
                maxLength: 25,
                nullable: false,
                oldClrType: typeof(byte),
                oldType: "tinyint");

            migrationBuilder.AlterColumn<string>(
                name: "Score",
                table: "ReportEvaluations",
                type: "varchar(20)",
                unicode: false,
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(byte),
                oldType: "tinyint");

            migrationBuilder.AlterColumn<string>(
                name: "Phase",
                table: "ReportEvaluations",
                type: "varchar(30)",
                unicode: false,
                maxLength: 30,
                nullable: false,
                oldClrType: typeof(byte),
                oldType: "tinyint");

            migrationBuilder.CreateIndex(
                name: "IX_RoleUpgradeRequests_UserId_RequestedRoleId",
                table: "RoleUpgradeRequests",
                columns: new[] { "UserId", "RequestedRoleId" },
                unique: true,
                filter: "[Status] = 'Pending'");

            migrationBuilder.AddCheckConstraint(
                name: "CK_ReportEvaluation_PhaseOwner",
                table: "ReportEvaluations",
                sql: "(Phase = 'CompanyEvaluation' AND CompanySupervisorId IS NOT NULL AND CollegeSupervisorId IS NULL) OR (Phase = 'CollegeEvaluation' AND CollegeSupervisorId IS NOT NULL AND CompanySupervisorId IS NULL)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_RoleUpgradeRequests_UserId_RequestedRoleId",
                table: "RoleUpgradeRequests");

            migrationBuilder.DropCheckConstraint(
                name: "CK_ReportEvaluation_PhaseOwner",
                table: "ReportEvaluations");

            migrationBuilder.AlterColumn<byte>(
                name: "Status",
                table: "TrainingRequests",
                type: "tinyint",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(20)",
                oldUnicode: false,
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<byte>(
                name: "Semester",
                table: "TrainingRequests",
                type: "tinyint",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(20)",
                oldUnicode: false,
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<byte>(
                name: "Status",
                table: "TrainingRecords",
                type: "tinyint",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(20)",
                oldUnicode: false,
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<byte>(
                name: "Semester",
                table: "TrainingRecords",
                type: "tinyint",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(20)",
                oldUnicode: false,
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<byte>(
                name: "Status",
                table: "StudentReports",
                type: "tinyint",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(30)",
                oldUnicode: false,
                oldMaxLength: 30);

            migrationBuilder.AlterColumn<byte>(
                name: "Status",
                table: "RoleUpgradeRequests",
                type: "tinyint",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(20)",
                oldUnicode: false,
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<byte>(
                name: "QuestionType",
                table: "ReportQuestions",
                type: "tinyint",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(25)",
                oldUnicode: false,
                oldMaxLength: 25);

            migrationBuilder.AlterColumn<byte>(
                name: "Score",
                table: "ReportEvaluations",
                type: "tinyint",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(20)",
                oldUnicode: false,
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<byte>(
                name: "Phase",
                table: "ReportEvaluations",
                type: "tinyint",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(30)",
                oldUnicode: false,
                oldMaxLength: 30);

            migrationBuilder.CreateIndex(
                name: "IX_RoleUpgradeRequests_UserId_RequestedRoleId",
                table: "RoleUpgradeRequests",
                columns: new[] { "UserId", "RequestedRoleId" },
                unique: true,
                filter: "Status = 1");

            migrationBuilder.AddCheckConstraint(
                name: "CK_ReportEvaluation_PhaseOwner",
                table: "ReportEvaluations",
                sql: "(Phase = 1 AND CompanySupervisorId IS NOT NULL AND CollegeSupervisorId IS NULL) OR (Phase = 2 AND CollegeSupervisorId IS NOT NULL AND CompanySupervisorId IS NULL)");
        }
    }
}
