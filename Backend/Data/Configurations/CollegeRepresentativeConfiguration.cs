using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using summer_training_app.Entities.Core;

namespace summer_training_app.Data.Configurations
{
    public class CollegeRepresentativeConfiguration : IEntityTypeConfiguration<CollegeRepresentative>
    {
        public void Configure(EntityTypeBuilder<CollegeRepresentative> builder)
        {
            builder.HasKey(cr => cr.UserId);

            builder.HasOne(cr => cr.User)
                .WithOne(u => u.CollegeRepresentative)
                .HasForeignKey<CollegeRepresentative>(cr => cr.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(cr => cr.College)
                .WithMany(c => c.CollegeRepresentatives)
                .HasForeignKey(cr => cr.CollegeId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Property(cr => cr.Department).HasColumnType("nvarchar(50)");
            builder.Property(cr => cr.JobTitle).HasColumnType("nvarchar(50)");

            builder.HasIndex(cr => new { cr.UserId, cr.CollegeId }).IsUnique();

            builder.HasQueryFilter(cr => !cr.College.IsDeleted);
        }
    }
}
