using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using summer_training_app.Entities.Core;

namespace summer_training_app.Data.Configurations
{
    public class RoleConfiguration : IEntityTypeConfiguration<Role>
    {
        public void Configure(EntityTypeBuilder<Role> builder)
        {
            builder.HasKey(r => r.Id);

            builder.Property(r => r.RoleName)
                .IsRequired()
                .HasColumnType("varchar(50)");

            builder.HasData(
                new Role { Id = 1, RoleName = "Student" },
                new Role { Id = 2, RoleName = "CompanyRep" },
                new Role { Id = 3, RoleName = "CollegeRep" },
                new Role { Id = 4, RoleName = "SuperAdmin" },
                new Role { Id = 5, RoleName = "BasicUser" }
            );
        }
    }
}
