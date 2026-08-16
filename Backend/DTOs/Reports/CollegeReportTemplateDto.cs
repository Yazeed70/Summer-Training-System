using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace summer_training_app.DTOs.Reports
{
    public class CollegeReportTemplateDto
    {
        public Guid TemplatePublicId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsAvailable { get; set; }
        public bool RequiresCompanyEvaluation { get; set; } = true;
        public bool RequiresCollegeEvaluation { get; set; } = true;
        public DateTime CreatedAt { get; set; }
        public string CreatedByUser { get; set; } = string.Empty;
        public DateTime DueDate { get; set; }
        public int QuestionsCount { get; set; }
        public int SubmissionsCount { get; set; }
    }
}
