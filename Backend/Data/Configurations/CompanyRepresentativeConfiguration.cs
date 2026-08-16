using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using summer_training_app.Entities.Core;

namespace summer_training_app.Data.Configurations
{
    public class CompanyRepresentativeConfiguration : IEntityTypeConfiguration<CompanyRepresentative>
    {
        public void Configure(EntityTypeBuilder<CompanyRepresentative> builder)
        {
            builder.HasKey(cr => cr.UserId);

            builder.HasOne(cr => cr.User)
                .WithOne(u => u.CompanyRepresentative)
                .HasForeignKey<CompanyRepresentative>(cr => cr.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(cr => cr.Company)
                .WithMany(c => c.CompanyRepresentatives)
                .HasForeignKey(cr => cr.CompanyId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Property(cr => cr.JobTitle).HasColumnType("nvarchar(50)");

            builder.HasIndex(cr => cr.CompanyId);
            builder.HasIndex(cr => new { cr.UserId, cr.CompanyId }).IsUnique();

            builder.HasQueryFilter(cr => !cr.Company.IsDeleted);
        }
    }
}
