using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using summer_training_app.Entities.Core;

namespace summer_training_app.Data.Configurations
{
    public class TrainingRecordConfiguration : IEntityTypeConfiguration<TrainingRecord>
    {
        public void Configure(EntityTypeBuilder<TrainingRecord> builder)
        {
            builder.HasKey(tr => tr.Id);
            builder.HasAlternateKey(tr => tr.PublicId);

            builder.HasOne(tr => tr.Student)
                .WithMany(sp => sp.TrainingRecords)
                .HasForeignKey(tr => tr.StudentId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(tr => tr.Company)
                .WithMany(c => c.TrainingRecords)
                .HasForeignKey(tr => tr.CompanyId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Property(tr => tr.PublicId).HasDefaultValueSql("NEWID()");
            builder.Property(tr => tr.StartDate).HasColumnType("date").IsRequired();
            builder.Property(tr => tr.EndDate).HasColumnType("date").IsRequired();
            builder.Property(tr => tr.AcademicYear).HasColumnType("varchar(10)").IsRequired();
            builder.Property(tr => tr.Semester).HasConversion<string>().HasMaxLength(20).IsUnicode(false).IsRequired();
            builder.Property(tr => tr.Status).HasConversion<string>().HasMaxLength(20).IsUnicode(false);
            builder.Property(tr => tr.CreatedAt).HasColumnType("datetime2").HasDefaultValueSql("GETUTCDATE()");

            builder.HasIndex(tr => tr.StudentId);
            builder.HasIndex(tr => tr.CompanyId);
            builder.HasIndex(tr => tr.Status);

            builder.ToTable(t => t.HasCheckConstraint("CHK_Dates_Logic", "EndDate > StartDate"));

            builder.HasQueryFilter(tr => !tr.Company.IsDeleted);
        }
    }
}
