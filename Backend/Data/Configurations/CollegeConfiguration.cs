using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using summer_training_app.Entities.Core;

namespace summer_training_app.Data.Configurations
{
    public class CollegeConfiguration : IEntityTypeConfiguration<College>
    {
        public void Configure(EntityTypeBuilder<College> builder)
        {
            builder.HasKey(c => c.Id);

            builder.Property(c => c.CollegeName).HasColumnType("nvarchar(100)").IsRequired();
            builder.Property(c => c.CollegeAddress).HasColumnType("nvarchar(200)").IsRequired();
            builder.Property(c => c.ContactEmail).HasColumnType("varchar(100)");
            builder.Property(c => c.IsDeleted).HasColumnType("bit").HasDefaultValue(false);
            builder.Property(c => c.CreatedAt).HasColumnType("datetime2").HasDefaultValueSql("GETUTCDATE()");

            builder.HasIndex(c => c.CollegeName).IsUnique();

            builder.HasQueryFilter(e => !e.IsDeleted);
        }
    }
}
