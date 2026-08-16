using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using summer_training_app.Entities.Reports;

namespace summer_training_app.Data.Configurations
{
    public class ReportQuestionConfiguration : IEntityTypeConfiguration<ReportQuestion>
    {
        public void Configure(EntityTypeBuilder<ReportQuestion> builder)
        {
            builder.HasKey(rq => rq.Id);

            builder.HasOne(rq => rq.ReportTemplate)
                .WithMany(rt => rt.Questions)
                .HasForeignKey(rq => rq.TemplateId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Property(rq => rq.QuestionText).HasColumnType("nvarchar(max)").IsRequired();
            builder.Property(rq => rq.QuestionType).HasConversion<string>().HasMaxLength(25).IsUnicode(false).IsRequired();
            builder.Property(rq => rq.IsRequired).HasColumnType("bit").HasDefaultValue(true);
            builder.Property(rq => rq.OptionsPayload).HasColumnType("nvarchar(max)");
            builder.Property(rq => rq.OrderPosition).HasColumnType("tinyint");

            builder.HasIndex(rq => rq.TemplateId);

            builder.HasQueryFilter(rq => !rq.ReportTemplate.College.IsDeleted);
        }
    }
}
