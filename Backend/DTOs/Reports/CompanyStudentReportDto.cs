using System;
using summer_training_app.Entities.Enums;

namespace summer_training_app.DTOs.Reports
{
    public class CompanyStudentReportDto
    {
        public Guid StudentReportPublicId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string ReportTitle { get; set; } = string.Empty;
        public DateTime? SubmissionDate { get; set; }
        public enReportStatus Status { get; set; }
        public enEvaluationScore? EvaluationScore { get; set; }
        public string? EvaluationComments { get; set; }
        public DateTime? EvaluatedAt { get; set; }
    }
}
