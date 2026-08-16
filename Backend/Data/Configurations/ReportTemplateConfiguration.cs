using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using summer_training_app.Entities.Reports;

namespace summer_training_app.Data.Configurations
{
    public class ReportTemplateConfiguration : IEntityTypeConfiguration<ReportTemplate>
    {
        public void Configure(EntityTypeBuilder<ReportTemplate> builder)
        {
            builder.HasKey(re => re.Id);
            builder.HasAlternateKey(re => re.PublicId);

            builder.HasOne(rt => rt.CreatedByUser)
                .WithMany(cr => cr.CreatedReportTemplates)
                .HasForeignKey(rt => rt.CreatedBy)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(rt => rt.College)
                .WithMany(c => c.ReportTemplates)
                .HasForeignKey(rt => rt.CollegeId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);
            
            builder.HasOne(rt => rt.Company)
                .WithMany(c => c.ReportTemplates)
                .HasForeignKey(rt => rt.CompanyId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);


            builder.Property(rt => rt.PublicId).HasDefaultValueSql("NEWID()");
            builder.Property(rt => rt.Title).HasColumnType("nvarchar(150)").IsRequired();
            builder.Property(rt => rt.Description).HasColumnType("nvarchar(max)");
            builder.Property(rt => rt.CreatedAt).HasColumnType("datetime2").HasDefaultValueSql("GETUTCDATE()");
            builder.Property(rt => rt.UpdatedAt).HasColumnType("datetime2").HasDefaultValueSql("GETUTCDATE()");
            builder.Property(rt => rt.DueDate).HasColumnType("datetime2").HasDefaultValueSql("DATEADD(day, 7, GETUTCDATE())");
            builder.Property(rt => rt.IsAvailable).HasColumnType("bit").HasDefaultValue(false);
            builder.Property(rt => rt.RequiresCompanyEvaluation).HasColumnType("bit").HasDefaultValue(true);
            builder.Property(rt => rt.RequiresCollegeEvaluation).HasColumnType("bit").HasDefaultValue(true);

            builder.HasIndex(rt => rt.CreatedBy);
            builder.HasIndex(rt => rt.CollegeId);
            builder.HasIndex(rt => rt.CompanyId);

            builder.HasQueryFilter(rt =>
                (rt.CollegeId == null || !rt.College.IsDeleted) 
                &&
                (rt.CompanyId == null || !rt.Company.IsDeleted)
            );

            builder.ToTable(t => t.HasCheckConstraint("CK_ReportTemplate_Owner",
                "(CollegeId IS NOT NULL AND CompanyId IS NULL) OR (CollegeId IS NULL AND CompanyId IS NOT NULL)"));
        }
    }
}
