using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using summer_training_app.Entities.Core;
using summer_training_app.Entities.Enums;

namespace summer_training_app.Entities.Reports
{
    public class StudentReport
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public Guid PublicId { get; set; }
        [Required]
        public int StudentId { get; set; }
        [ForeignKey("StudentId")]
        public StudentProfile StudentProfile { get; set; }
        [Required]
        public int TrainingRecordId { get; set; }
        [ForeignKey("TrainingRecordId")]
        public TrainingRecord TrainingRecord { get; set; }

        [Required]
        public int TemplateId { get; set; }

        [ForeignKey("TemplateId")]
        public ReportTemplate ReportTemplate { get; set; }


        public enReportStatus Status { get; set; }

        public DateTime? SubmissionDate { get; set; }

        public ICollection<ReportAnswer> Answers { get; set; } = new List<ReportAnswer>();
        public ICollection<ReportEvaluation> Evaluations { get; set; } = new List<ReportEvaluation>();

    }

}