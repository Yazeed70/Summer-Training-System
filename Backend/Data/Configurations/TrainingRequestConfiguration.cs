using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using summer_training_app.Entities.Core;

namespace summer_training_app.Data.Configurations
{
    public class TrainingRequestConfiguration : IEntityTypeConfiguration<TrainingRequest>
    {
        public void Configure(EntityTypeBuilder<TrainingRequest> builder)
        {
            builder.HasKey(tr => tr.Id);
            builder.HasAlternateKey(tr => tr.PublicId);

            builder.HasOne(tr => tr.Student)
                .WithMany(sp => sp.TrainingRequests)
                .HasForeignKey(tr => tr.StudentId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(tr => tr.Company)
                .WithMany(c => c.TrainingRequests)
                .HasForeignKey(tr => tr.CompanyId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(tr => tr.ReviewedBy)
                .WithMany(cr => cr.ReviewedTrainingRequests)
                .HasForeignKey(tr => tr.ReviewedById)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Property(tr => tr.PublicId).HasDefaultValueSql("NEWID()");
            builder.Property(tr => tr.SuggestedCompanyName).HasColumnType("nvarchar(100)");
            builder.Property(tr => tr.StartDate).HasColumnType("date").IsRequired();
            builder.Property(tr => tr.EndDate).HasColumnType("date").IsRequired();
            builder.Property(tr => tr.AcceptanceLetterPath).HasColumnType("varchar(512)");
            //builder.Property(tr => tr.DurationInWeeks).HasColumnType("tinyint").IsRequired();
            builder.Property(tr => tr.AcademicYear).HasColumnType("varchar(10)");
            builder.Property(tr => tr.Semester).HasConversion<string>().HasMaxLength(20).IsUnicode(false).IsRequired();
            builder.Property(tr => tr.Status).HasConversion<string>().HasMaxLength(20).IsUnicode(false);
            builder.Property(tr => tr.CreatedAt).HasColumnType("datetime2").HasDefaultValueSql("GETUTCDATE()");
            builder.Property(tr => tr.Comment).HasColumnType("nvarchar(max)");
            builder.Property(tr => tr.ReviewedAt).HasColumnType("datetime2");
            builder.Property(tr => tr.IsDeleted).HasColumnType("bit").HasDefaultValue(false);

            builder.HasIndex(tr => tr.Status);
            builder.HasIndex(tr => tr.ReviewedById);
            builder.HasIndex(tr => tr.StudentId);
            builder.HasIndex(tr => tr.CompanyId);

            builder.HasIndex(tr => new { tr.StudentId, tr.AcademicYear, tr.Semester, tr.CompanyId }).IsUnique();

            //builder.ToTable(t => t.HasCheckConstraint("CHK_Duration_Logic", "DurationInWeeks > 0"));
            builder.ToTable(t => t.HasCheckConstraint("CHK_Dates_Logic", "StartDate > GETUTCDATE()"));

            builder.HasQueryFilter(e => !e.IsDeleted);
        }
    }
}
