using System;
using summer_training_app.Entities.Enums;

namespace summer_training_app.DTOs.Reports
{
    public class StudentReportSummaryDto
    {
        public Guid TemplatePublicId { get; set; }
        public Guid? StudentReportPublicId { get; set; }
        public string TemplateTitle { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime DueDate { get; set; }
        public int QuestionsCount { get; set; }
        public enReportStatus Status { get; set; }
        public DateTime? SubmittedAt { get; set; }
        public enEvaluationScore? CompanyScore { get; set; }
        public enEvaluationScore? CollegeScore { get; set; }

        public string? CompanyFeedback { get; set; }
        public string? CollegeFeedback { get; set; }
    }
}
