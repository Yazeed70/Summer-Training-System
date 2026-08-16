using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using summer_training_app.Entities.Core;

namespace summer_training_app.Data.Configurations
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.HasKey(u => u.Id);
            builder.HasAlternateKey(u => u.PublicId);

            builder.HasOne(u => u.Role)
                .WithMany(r => r.Users)
                .HasForeignKey(u => u.RoleId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Property(u => u.PublicId).HasDefaultValueSql("NEWID()");
            builder.Property(u => u.IsActive).HasDefaultValue(true);
            builder.Property(u => u.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            builder.Property(u => u.LastUpdatedAt).HasDefaultValueSql("GETUTCDATE()");

            builder.Property(u => u.Username).HasColumnType("varchar(50)").IsRequired();
            builder.Property(u => u.Email).HasColumnType("varchar(100)");
            builder.Property(u => u.PhoneNumber).HasColumnType("varchar(20)");
            builder.Property(u => u.IsDeleted).HasColumnType("bit").HasDefaultValue(false);

            builder.HasIndex(u => u.Username).IsUnique();
            builder.HasIndex(u => u.Email).IsUnique();

            builder.HasQueryFilter(e => !e.IsDeleted);
        }
    }
}
