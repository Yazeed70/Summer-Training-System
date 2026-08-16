using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace summer_training_app.Entities.Reports
{
    public class ReportAnswer
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int StudentReportId { get; set; }
        [ForeignKey("StudentReportId")]
        public StudentReport StudentReport { get; set; }

        [Required]
        public int QuestionId { get; set; }
        [ForeignKey("QuestionId")]
        public ReportQuestion ReportQuestion { get; set; }

        [Required]
        public string AnswerValue { get; set; }
    }
}