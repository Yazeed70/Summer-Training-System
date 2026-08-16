using summer_training_app.Entities.Reports;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace summer_training_app.Entities.Core
{
    public class User
    {
        [Key]
        public int Id { get; set; }
        
        public Guid PublicId { get; set; } //= Guid.NewGuid();

        //[Required]
        //[StringLength(100)]
        public string Name { get; set; }
        
        //[Required]
        //[StringLength(50)]
        public string Username { get; set; }
        
        //[Required]
        //[StringLength(255)]
        public string PasswordHash { get; set; }
        
        [Required]
        public int RoleId { get; set; }
        
        [ForeignKey("RoleId")]
        public Role Role { get; set; }
        
        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } //= DateTime.Now;

        public DateTime LastUpdatedAt { get; set;}// = DateTime.Now;

        //[EmailAddress]
        //[StringLength(100)]
        public string? Email { get; set; }
        //[Phone]
        //[StringLength(50)]
        public string? PhoneNumber { get; set; }

        public bool IsDeleted { get; set; } //= false;

        public StudentProfile StudentProfile { get; set; }
        public CollegeRepresentative CollegeRepresentative { get; set; }
        public CompanyRepresentative CompanyRepresentative { get; set; }
        public ICollection<RoleUpgradeRequest> RoleUpgradeRequests { get; set; } = new List<RoleUpgradeRequest>();
        public ICollection<RoleUpgradeRequest> ReviewedRoleUpgradeRequests { get; set; } = new List<RoleUpgradeRequest>();
        public ICollection<ReportTemplate> CreatedReportTemplates { get; set; } = new List<ReportTemplate>();
    }
}
