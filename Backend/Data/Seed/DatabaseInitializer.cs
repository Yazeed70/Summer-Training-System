using Microsoft.EntityFrameworkCore;
using summer_training_app.Entities.Core;
using summer_training_app.Entities.Enums;

namespace summer_training_app.Data.Seed
{
    public class DatabaseInitializer
    {
        public static async Task InitializeAsync(IServiceProvider services)
        {
            using var scope = services.CreateScope();

            var context = scope.ServiceProvider
                .GetRequiredService<SummerTrainingDBContext>();

            // apply Migrations
            await context.Database.MigrateAsync();

            // Create the admin user if it doesn't exist
            if (!await context.Users.AnyAsync())
            {
                
                context.Colleges.Add(
                new College
                {
                    CollegeName = "كلية علوم الحاسب",
                    CollegeAddress = "Madinah",
                    CreatedAt = DateTime.UtcNow
                }
            );

                context.Companies.Add(
                    new Company
                    {
                        CompanyName = "شركة السقيفة لتطوير الأعمال",
                        CompanyAddress = "Riyadh",
                        CreatedAt = DateTime.UtcNow,
                    }
                );

                // 3. Seed Data for (Super Admin)
                context.Users.Add(
                    new User
                    {
                        Name = "مدير",
                        Username = "admin",
                        PasswordHash = BCrypt.Net.BCrypt.EnhancedHashPassword("admin123",12),
                        RoleId = (byte)enRoles.SuperAdmin,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow,
                        LastUpdatedAt = DateTime.UtcNow
                    }
                    );
                context.Users.Add(
                    new User
                    {
                        Name = "م. فهد (مشرف شركة)",
                        Username = "com",
                        PasswordHash = BCrypt.Net.BCrypt.EnhancedHashPassword("com123",12),
                        RoleId = (byte)enRoles.CompanyRep,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow,
                        LastUpdatedAt = DateTime.UtcNow
                    }
                    );
                context.Users.Add(
                    new User
                    {
                        Name = "د. خالد (مشرف كلية)",
                        Username = "col",
                        PasswordHash = BCrypt.Net.BCrypt.EnhancedHashPassword("col123",12), 
                        RoleId = (byte)enRoles.CollegeRep,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow,
                        LastUpdatedAt = DateTime.UtcNow
                    }
                    );
                context.Users.Add(
                    new User
                    {
                        Name = "أحمد (طالب)",
                        Username = "stu",
                        PasswordHash = BCrypt.Net.BCrypt.EnhancedHashPassword("stu123",12),
                        RoleId = (byte)enRoles.BasicUser,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow,
                        LastUpdatedAt = DateTime.UtcNow
                    }
                );
                context.Users.Add(
                    new User
                    {
                        Name = "Yazeed Ahmed",
                        Username = "yazeed",
                        PasswordHash = BCrypt.Net.BCrypt.EnhancedHashPassword("yaz123",12),
                        RoleId = (byte)enRoles.BasicUser,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow,
                        LastUpdatedAt = DateTime.UtcNow
                    }
                );

                await context.SaveChangesAsync();

                var defaultCollege = await context.Colleges.FirstOrDefaultAsync();
                var defaultCompany = await context.Companies.FirstOrDefaultAsync();

                var comUser = await context.Users.FirstOrDefaultAsync(u => u.Username == "com");
                var colUser = await context.Users.FirstOrDefaultAsync(u => u.Username == "col");
                var stuUser = await context.Users.FirstOrDefaultAsync(u => u.Username == "stu");

                if (comUser != null && defaultCompany != null)
                {
                    context.CompanyRepresentatives.Add(new CompanyRepresentative
                    {
                        UserId = comUser.Id,
                        CompanyId = defaultCompany.Id,
                        JobTitle = "Supervisor"
                    });
                }

                if (colUser != null && defaultCollege != null)
                {
                    context.CollegeRepresentatives.Add(new CollegeRepresentative
                    {
                        UserId = colUser.Id,
                        CollegeId = defaultCollege.Id,
                        JobTitle = "Academic Coordinator"
                    });
                }

                if (stuUser != null && defaultCollege != null)
                {
                    context.StudentProfiles.Add(new StudentProfile
                    {
                        UserId = stuUser.Id,
                        CollegeId = defaultCollege.Id,
                        Major = "Computer Science"
                    });

                    stuUser.RoleId = (int)enRoles.Student;
                    context.Users.Update(stuUser);
                }

                await context.SaveChangesAsync();
            }
        }
    }
}