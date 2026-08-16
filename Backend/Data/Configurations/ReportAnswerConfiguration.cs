using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using summer_training_app.Entities.Reports;

namespace summer_training_app.Data.Configurations
{
    public class ReportAnswerConfiguration : IEntityTypeConfiguration<ReportAnswer>
    {
        public void Configure(EntityTypeBuilder<ReportAnswer> builder)
        {
            builder.HasKey(ra => ra.Id);

            builder.HasOne(ra => ra.StudentReport)
                .WithMany(sr => sr.Answers)
                .HasForeignKey(ra => ra.StudentReportId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(ra => ra.ReportQuestion)
                .WithMany(rq => rq.Answers)
                .HasForeignKey(ra => ra.QuestionId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Property(ra => ra.AnswerValue).HasColumnType("nvarchar(max)").IsRequired();

            builder.HasIndex(ra => ra.StudentReportId);
            builder.HasIndex(ra => ra.QuestionId);

            builder.HasIndex(ra => new { ra.StudentReportId, ra.QuestionId }).IsUnique();

            builder.HasQueryFilter(ra => !ra.ReportQuestion.ReportTemplate.College.IsDeleted);
        }
    }
}
