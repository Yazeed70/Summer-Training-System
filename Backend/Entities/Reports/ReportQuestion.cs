using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using summer_training_app.Entities.Enums;

namespace summer_training_app.Entities.Reports
{
    public class ReportQuestion
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int TemplateId { get; set; }
        [ForeignKey("TemplateId")]
        public ReportTemplate ReportTemplate { get; set; }

        [Required]
        //[StringLength(255)]
        public string QuestionText { get; set; }

        public enQuestionType QuestionType { get; set; } = enQuestionType.Text; // e.g., "text", "multiple-choice", etc.
        public string? OptionsPayload { get; set; } // JSON string for options if QuestionType is multiple-choice

        [Required]
        public int OrderPosition { get; set; } 

        public bool IsRequired { get; set; } = false;

        public ICollection<ReportAnswer> Answers { get; set; } = new List<ReportAnswer>();


    }

}
