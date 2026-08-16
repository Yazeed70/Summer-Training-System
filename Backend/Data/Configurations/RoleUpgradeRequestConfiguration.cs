using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using summer_training_app.Entities.Core;
using summer_training_app.Entities.Enums;

namespace summer_training_app.Data.Configurations
{
    public class RoleUpgradeRequestConfiguration : IEntityTypeConfiguration<RoleUpgradeRequest>
    {
        public void Configure(EntityTypeBuilder<RoleUpgradeRequest> builder)
        {
            builder.HasKey(rur => rur.Id);
            builder.HasAlternateKey(rur => rur.PublicId);

            builder.HasOne(rur => rur.ReviewedBy)
                   .WithMany(u => u.ReviewedRoleUpgradeRequests)
                   .HasForeignKey(rur => rur.ReviewedById)
                   .OnDelete(DeleteBehavior.Restrict)
                   .IsRequired(false);

            builder.HasOne(rur => rur.User)
                .WithMany(u => u.RoleUpgradeRequests)
                .HasForeignKey(rur => rur.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(rur => rur.RequestedRole)
                .WithMany(r => r.RoleUpgradeRequests)
                .HasForeignKey(rur => rur.RequestedRoleId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(rur => rur.College)
                .WithMany(c => c.RoleUpgradeRequests)
                .HasForeignKey(rur => rur.CollegeId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);

            builder.HasOne(rur => rur.Company)
                .WithMany(c => c.RoleUpgradeRequests)
                .HasForeignKey(rur => rur.CompanyId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);

            builder.Property(rur => rur.PublicId).HasDefaultValueSql("NEWID()");
            builder.Property(rur => rur.Status).HasConversion<string>().HasMaxLength(20).IsUnicode(false);
            builder.Property(rur => rur.CreatedAt).HasColumnType("datetime2").HasDefaultValueSql("GETUTCDATE()");
            builder.Property(rur => rur.ReviewedAt).HasColumnType("datetime2");
            builder.Property(rur => rur.Comment).HasColumnType("nvarchar(max)");
            builder.Property(rur => rur.OfficialEmail).HasColumnType("varchar(100)");
            builder.Property(rur => rur.ProofFilePath).HasColumnType("varchar(512)");

            builder.HasIndex(rur => rur.UserId);
            builder.HasIndex(rur => rur.ReviewedById);
            builder.HasIndex(rur => rur.RequestedRoleId);
            builder.HasIndex(rur => rur.CollegeId);
            builder.HasIndex(rur => rur.Status);

            builder.HasIndex(rur => new { rur.UserId, rur.RequestedRoleId })
                .IsUnique()
                .HasFilter($"[Status] = '{nameof(enRequestStatus.Pending)}'");
        }
    }
}
