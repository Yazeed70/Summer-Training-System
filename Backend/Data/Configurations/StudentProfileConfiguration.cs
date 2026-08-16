using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using summer_training_app.Entities.Core;

namespace summer_training_app.Data.Configurations
{
    public class StudentProfileConfiguration : IEntityTypeConfiguration<StudentProfile>
    {
        public void Configure(EntityTypeBuilder<StudentProfile> builder)
        {
            builder.HasKey(sp => sp.UserId);

            builder.HasOne(sp => sp.User)
                .WithOne(u => u.StudentProfile)
                .HasForeignKey<StudentProfile>(sp => sp.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(sp => sp.College)
                .WithMany(c => c.StudentProfiles)
                .HasForeignKey(sp => sp.CollegeId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Property(sp => sp.UniversityIdNumber).HasColumnType("varchar(20)");
            builder.Property(sp => sp.GPA).HasColumnType("decimal(3, 2)");
            builder.Property(sp => sp.Major).HasColumnType("nvarchar(50)");

            builder.HasIndex(sp => sp.UniversityIdNumber).IsUnique();
            builder.HasIndex(sp => sp.CollegeId);

            builder.ToTable(t => t.HasCheckConstraint("CHK_GPA_Range", "GPA >= 0 AND GPA <= 5"));

            builder.HasQueryFilter(sp => !sp.College.IsDeleted);
        }
    }
}
