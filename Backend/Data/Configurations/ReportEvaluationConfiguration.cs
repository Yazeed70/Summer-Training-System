using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using summer_training_app.Entities.Enums;
using summer_training_app.Entities.Reports;

namespace summer_training_app.Data.Configurations
{
    public class ReportEvaluationConfiguration : IEntityTypeConfiguration<ReportEvaluation>
    {
        public void Configure(EntityTypeBuilder<ReportEvaluation> builder)
        {
            builder.HasKey(re => re.Id);

            builder.HasOne(re => re.StudentReport)
                .WithMany(sr => sr.Evaluations)
                .HasForeignKey(re => re.StudentReportId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(re => re.CompanySupervisor)
                .WithMany(cs => cs.Evaluations)
                .HasForeignKey(re => re.CompanySupervisorId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);

            builder.HasOne(re => re.CollegeSupervisor)
                .WithMany(cs => cs.Evaluations)
                .HasForeignKey(re => re.CollegeSupervisorId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);

            builder.Property(re => re.EvaluationDate).HasColumnType("datetime2").HasDefaultValueSql("GETUTCDATE()");
            builder.Property(re => re.Comments).HasColumnType("nvarchar(max)");
            builder.Property(re => re.Score).HasConversion<string>().HasMaxLength(20).IsUnicode(false).IsRequired();
            builder.Property(re => re.Phase).HasConversion<string>().HasMaxLength(30).IsUnicode(false).IsRequired();

            builder.HasIndex(re => re.StudentReportId);
            builder.HasIndex(re => re.CompanySupervisorId);
            builder.HasIndex(re => re.CollegeSupervisorId);
            builder.HasIndex(re => new { re.StudentReportId, re.Phase }).IsUnique();

            builder.HasQueryFilter(re =>
                (re.CompanySupervisorId == null || !re.CompanySupervisor.Company.IsDeleted)
                &&
                (re.CollegeSupervisorId == null || !re.CollegeSupervisor.College.IsDeleted)
            );

            builder.ToTable(t => t.HasCheckConstraint("CK_ReportEvaluation_PhaseOwner",
                $"(Phase = '{nameof(enEvaluationPhase.CompanyEvaluation)}' AND CompanySupervisorId IS NOT NULL AND CollegeSupervisorId IS NULL) OR " +
                $"(Phase = '{nameof(enEvaluationPhase.CollegeEvaluation)}' AND CollegeSupervisorId IS NOT NULL AND CompanySupervisorId IS NULL)"));
        }
    }
}
