using System.ComponentModel.DataAnnotations;
using summer_training_app.Entities.Reports;

namespace summer_training_app.Entities.Core
{
    public class College
    {
        [Key]
        public int Id { get; set; }

        //[Required]
        //[StringLength(100)]
        public string CollegeName { get; set; }
        //[StringLength(255)]
        //[EmailAddress]
        public string? ContactEmail { get; set; }

        public string CollegeAddress { get; set; }

        public DateTime CreatedAt { get; set; } //= DateTime.Now;

        public bool IsDeleted { get; set; } //= false;

        public ICollection<CollegeRepresentative> CollegeRepresentatives { get; set; } = new List<CollegeRepresentative>();
        public ICollection<CollegeDocument> Documents { get; set; } = new List<CollegeDocument>();
        public ICollection<StudentProfile> StudentProfiles { get; set; } = new List<StudentProfile>();
        public ICollection<RoleUpgradeRequest> RoleUpgradeRequests { get; set; } = new List<RoleUpgradeRequest>();
        public ICollection<ReportTemplate> ReportTemplates { get; set; } = new List<ReportTemplate>();
    }
}
