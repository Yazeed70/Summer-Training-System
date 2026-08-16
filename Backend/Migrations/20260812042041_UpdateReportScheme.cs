using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace summer_training_app.Migrations
{
    /// <inheritdoc />
    public partial class UpdateReportScheme : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ReportTemplates_CollegeRepresentatives_CreatedBy",
                table: "ReportTemplates");

            migrationBuilder.DropIndex(
                name: "IX_ReportEvaluations_StudentReportId_CompanySupervisorId",
                table: "ReportEvaluations");

            migrationBuilder.AlterColumn<int>(
                name: "CollegeId",
                table: "ReportTemplates",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<int>(
                name: "CompanyId",
                table: "ReportTemplates",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "RequiresCollegeEvaluation",
                table: "ReportTemplates",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "RequiresCompanyEvaluation",
                table: "ReportTemplates",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AlterColumn<int>(
                name: "CompanySupervisorId",
                table: "ReportEvaluations",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<int>(
                name: "CollegeSupervisorId",
                table: "ReportEvaluations",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<byte>(
                name: "Phase",
                table: "ReportEvaluations",
                type: "tinyint",
                nullable: false,
                defaultValue: (byte)0);

            migrationBuilder.CreateIndex(
                name: "IX_ReportTemplates_CompanyId",
                table: "ReportTemplates",
                column: "CompanyId");

            migrationBuilder.AddCheckConstraint(
                name: "CK_ReportTemplate_Owner",
                table: "ReportTemplates",
                sql: "(CollegeId IS NOT NULL AND CompanyId IS NULL) OR (CollegeId IS NULL AND CompanyId IS NOT NULL)");

            migrationBuilder.CreateIndex(
                name: "IX_ReportEvaluations_CollegeSupervisorId",
                table: "ReportEvaluations",
                column: "CollegeSupervisorId");

            migrationBuilder.CreateIndex(
                name: "IX_ReportEvaluations_StudentReportId_Phase",
                table: "ReportEvaluations",
                columns: new[] { "StudentReportId", "Phase" },
                unique: true);

            migrationBuilder.AddCheckConstraint(
                name: "CK_ReportEvaluation_PhaseOwner",
                table: "ReportEvaluations",
                sql: "(Phase = 1 AND CompanySupervisorId IS NOT NULL AND CollegeSupervisorId IS NULL) OR (Phase = 2 AND CollegeSupervisorId IS NOT NULL AND CompanySupervisorId IS NULL)");

            migrationBuilder.AddForeignKey(
                name: "FK_ReportEvaluations_CollegeRepresentatives_CollegeSupervisorId",
                table: "ReportEvaluations",
                column: "CollegeSupervisorId",
                principalTable: "CollegeRepresentatives",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ReportTemplates_Companies_CompanyId",
                table: "ReportTemplates",
                column: "CompanyId",
                principalTable: "Companies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ReportTemplates_Users_CreatedBy",
                table: "ReportTemplates",
                column: "CreatedBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ReportEvaluations_CollegeRepresentatives_CollegeSupervisorId",
                table: "ReportEvaluations");

            migrationBuilder.DropForeignKey(
                name: "FK_ReportTemplates_Companies_CompanyId",
                table: "ReportTemplates");

            migrationBuilder.DropForeignKey(
                name: "FK_ReportTemplates_Users_CreatedBy",
                table: "ReportTemplates");

            migrationBuilder.DropIndex(
                name: "IX_ReportTemplates_CompanyId",
                table: "ReportTemplates");

            migrationBuilder.DropCheckConstraint(
                name: "CK_ReportTemplate_Owner",
                table: "ReportTemplates");

            migrationBuilder.DropIndex(
                name: "IX_ReportEvaluations_CollegeSupervisorId",
                table: "ReportEvaluations");

            migrationBuilder.DropIndex(
                name: "IX_ReportEvaluations_StudentReportId_Phase",
                table: "ReportEvaluations");

            migrationBuilder.DropCheckConstraint(
                name: "CK_ReportEvaluation_PhaseOwner",
                table: "ReportEvaluations");

            migrationBuilder.DropColumn(
                name: "CompanyId",
                table: "ReportTemplates");

            migrationBuilder.DropColumn(
                name: "RequiresCollegeEvaluation",
                table: "ReportTemplates");

            migrationBuilder.DropColumn(
                name: "RequiresCompanyEvaluation",
                table: "ReportTemplates");

            migrationBuilder.DropColumn(
                name: "CollegeSupervisorId",
                table: "ReportEvaluations");

            migrationBuilder.DropColumn(
                name: "Phase",
                table: "ReportEvaluations");

            migrationBuilder.AlterColumn<int>(
                name: "CollegeId",
                table: "ReportTemplates",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "CompanySupervisorId",
                table: "ReportEvaluations",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ReportEvaluations_StudentReportId_CompanySupervisorId",
                table: "ReportEvaluations",
                columns: new[] { "StudentReportId", "CompanySupervisorId" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_ReportTemplates_CollegeRepresentatives_CreatedBy",
                table: "ReportTemplates",
                column: "CreatedBy",
                principalTable: "CollegeRepresentatives",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
