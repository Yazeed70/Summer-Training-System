using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using summer_training_app.Entities.Core;
using summer_training_app.Entities.Enums;

namespace summer_training_app.Entities.Reports
{
    public class ReportEvaluation
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int StudentReportId { get; set; }
        [ForeignKey("StudentReportId")]
        public StudentReport StudentReport { get; set; }

        public int? CompanySupervisorId { get; set; }
        [ForeignKey("CompanySupervisorId")]
        public CompanyRepresentative? CompanySupervisor { get; set; }

        public int? CollegeSupervisorId { get; set; }
        [ForeignKey("CollegeSupervisorId")]
        public CollegeRepresentative? CollegeSupervisor { get; set; }

        public enEvaluationPhase Phase { get; set; }

        public string? Comments { get; set; }
        
        public enEvaluationScore Score { get; set; } = enEvaluationScore.Good;

        public DateTime EvaluationDate { get; set; } = DateTime.UtcNow;

    }

}
