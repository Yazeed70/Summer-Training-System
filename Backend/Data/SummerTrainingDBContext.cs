using Microsoft.EntityFrameworkCore;
using summer_training_app.Entities.Core;
using summer_training_app.Entities.Reports;

namespace summer_training_app.Data
{
    public class SummerTrainingDBContext : DbContext
    {
        public SummerTrainingDBContext(DbContextOptions<SummerTrainingDBContext> options)
            : base(options) { }

        public virtual DbSet<User> Users { get; set; }
        public virtual DbSet<Role> Roles { get; set; }
        public virtual DbSet<College> Colleges { get; set; }
        public virtual DbSet<Company> Companies { get; set; }
        public virtual DbSet<StudentReport> StudentReports { get; set; }
        public virtual DbSet<ReportEvaluation> ReportEvaluations { get; set; }
        public virtual DbSet<ReportQuestion> ReportQuestions { get; set; }
        public virtual DbSet<ReportAnswer> ReportAnswers { get; set; }
        public virtual DbSet<ReportTemplate> ReportTemplates { get; set; }
        public virtual DbSet<TrainingRequest> TrainingRequests { get; set; }
        public virtual DbSet<CollegeDocument> CollegeDocuments { get; set; }
        public virtual DbSet<RoleUpgradeRequest> RoleUpgradeRequests { get; set; }
        public virtual DbSet<TrainingRecord> TrainingRecords { get; set; }
        public virtual DbSet<StudentProfile> StudentProfiles { get; set; }
        public virtual DbSet<CompanyRepresentative> CompanyRepresentatives { get; set; }
        public virtual DbSet<CollegeRepresentative> CollegeRepresentatives { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.ApplyConfigurationsFromAssembly(typeof(SummerTrainingDBContext).Assembly);
        }

        protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
        {
            base.ConfigureConventions(configurationBuilder);
            configurationBuilder.Properties<Enum>().HaveConversion<string>();
        }
    }
}
