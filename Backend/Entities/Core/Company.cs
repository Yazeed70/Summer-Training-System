using summer_training_app.Entities.Reports;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace summer_training_app.Entities.Core
{
    public class Company
    {
        [Key]
        public int Id { get; set; }
        
        //[Required]
        //[StringLength(150)]
        public string CompanyName { get; set; }

        public string CompanyAddress { get; set; }

        //[EmailAddress]
        //[StringLength(255)]
        public string? ContactEmail { get; set; }

        public bool IsApproved { get; set; } //= false;
        public bool IsDeleted { get; set; } //= false;

        public DateTime CreatedAt { get; set; } //= DateTime.Now;

        public DateTime? ApprovedAt { get; set; }

        public int? CreatedByUserId { get; set; }
        [ForeignKey("CreatedByUserId")]
        public User? CreatedByUser { get; set; }
        public int? ApprovedByUserId { get; set; }
        [ForeignKey("ApprovedByUserId")]
        public User? ApprovedByUser { get; set; }




        public ICollection<CompanyRepresentative> CompanyRepresentatives { get; set; } = new List<CompanyRepresentative>();
        public ICollection<TrainingRecord> TrainingRecords { get; set; } = new List<TrainingRecord>();
        public ICollection<TrainingRequest> TrainingRequests { get; set; } = new List<TrainingRequest>();
        public ICollection<RoleUpgradeRequest> RoleUpgradeRequests { get; set; } = new List<RoleUpgradeRequest>();
        public ICollection<ReportTemplate> ReportTemplates { get; set; } = new List<ReportTemplate>();

    }
}
