using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using summer_training_app.Entities.Reports;

namespace summer_training_app.Entities.Core
{
    public class CollegeRepresentative
    {
        [Key]
        public int UserId { get; set; } // PK & FK
        [ForeignKey("UserId")]
        public User User { get; set; }

        [Required]
        public int CollegeId { get; set; } // FK
        [ForeignKey("CollegeId")]
        public College College { get; set; }


        [StringLength(50)]
        public string? JobTitle { get; set; }
        [StringLength(50)]
        public string? Department { get; set; }

        public ICollection<TrainingRequest> ReviewedTrainingRequests { get; set; } = new List<TrainingRequest>();
        public ICollection<ReportEvaluation> Evaluations { get; set; } = new List<ReportEvaluation>();
    }
}
