using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using summer_training_app.Entities.Reports;

namespace summer_training_app.Data.Configurations
{
    public class StudentReportConfiguration : IEntityTypeConfiguration<StudentReport>
    {
        public void Configure(EntityTypeBuilder<StudentReport> builder)
        {
            builder.HasKey(sr => sr.Id);
            builder.HasAlternateKey(sr => sr.PublicId);

            builder.HasOne(sr => sr.TrainingRecord)
                .WithMany(tr => tr.StudentReports)
                .HasForeignKey(sr => sr.TrainingRecordId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(sr => sr.StudentProfile)
                .WithMany(sp => sp.StudentReports)
                .HasForeignKey(sr => sr.StudentId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(sr => sr.ReportTemplate)
                .WithMany(rt => rt.StudentReports)
                .HasForeignKey(sr => sr.TemplateId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Property(sr => sr.PublicId).HasDefaultValueSql("NEWID()");
            builder.Property(sr => sr.Status).HasConversion<string>().HasMaxLength(30).IsUnicode(false);
            builder.Property(sr => sr.SubmissionDate).HasColumnType("datetime2");

            builder.HasIndex(sr => sr.TrainingRecordId);
            builder.HasIndex(sr => sr.StudentId);
            builder.HasIndex(sr => sr.TemplateId);

            builder.HasQueryFilter(sr =>
                (sr.ReportTemplate.CollegeId == null || !sr.ReportTemplate.College.IsDeleted)
                &&
                (sr.ReportTemplate.CompanyId == null || !sr.ReportTemplate.Company.IsDeleted)
            );
        }
    }
}
