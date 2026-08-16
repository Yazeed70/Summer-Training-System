using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using summer_training_app.Entities.Core;

namespace summer_training_app.Data.Configurations
{
    public class CompanyConfiguration : IEntityTypeConfiguration<Company>
    {
        public void Configure(EntityTypeBuilder<Company> builder)
        {
            builder.HasKey(c => c.Id);

            builder.Property(c => c.CompanyName).HasColumnType("nvarchar(100)").IsRequired();
            builder.Property(c => c.CompanyAddress).HasColumnType("nvarchar(200)").IsRequired();
            builder.Property(c => c.ContactEmail).HasColumnType("varchar(100)");
            builder.Property(c => c.IsApproved).HasColumnType("bit").HasDefaultValue(false);
            builder.Property(c => c.IsDeleted).HasColumnType("bit").HasDefaultValue(false);
            builder.Property(c => c.CreatedAt).HasColumnType("datetime2").HasDefaultValueSql("GETUTCDATE()");
            builder.Property(c => c.ApprovedAt).HasColumnType("datetime2");

            builder.HasIndex(c => c.CompanyName).IsUnique();
            builder.HasIndex(c => c.CreatedByUserId);
            builder.HasIndex(c => c.ApprovedByUserId);

            builder.HasQueryFilter(e => !e.IsDeleted);
        }
    }
}
