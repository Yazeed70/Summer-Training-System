using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using summer_training_app.Entities.Reports;

namespace summer_training_app.Entities.Core
{
    public class CompanyRepresentative
    {
        [Key]
        public int UserId { get; set; } // PK & FK
        [ForeignKey("UserId")]
        public User User { get; set; }

        [Required]
        public int CompanyId { get; set; } // FK
        [ForeignKey("CompanyId")]
        public Company Company { get; set; }

        [StringLength(50)]
        public string? JobTitle { get; set; }

        public ICollection<ReportEvaluation> Evaluations { get; set; } = new List<ReportEvaluation>();
    }
}
