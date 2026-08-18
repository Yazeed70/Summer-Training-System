using System;
using System.Collections.Generic;
using summer_training_app.Entities.Enums;

namespace summer_training_app.DTOs.Reports
{
    public class StudentReportDetailsDto
    {
        public Guid StudentReportPublicId { get; set; }
        public Guid TemplatePublicId { get; set; }
        public string TemplateTitle { get; set; } = string.Empty;
        public string? TemplateDescription { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime? SubmissionDate { get; set; }
        public enReportStatus Status { get; set; }

        // Student Info
        public int StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string? StudentEmail { get; set; }
        public string? CollegeName { get; set; }
        public string? CompanyName { get; set; }

        // Flags
        public bool RequiresCompanyEvaluation { get; set; }
        public bool RequiresCollegeEvaluation { get; set; }
        public bool CanDelete { get; set; }

        // Answers
        public List<ReportAnswerDetailDto> Answers { get; set; } = new();

        // Company Evaluation
        public enEvaluationScore? CompanyScore { get; set; }
        public string? CompanyFeedback { get; set; }
        public DateTime? CompanyEvaluatedAt { get; set; }
        public string? CompanyEvaluatorName { get; set; }

        // College Evaluation
        public enEvaluationScore? CollegeScore { get; set; }
        public string? CollegeFeedback { get; set; }
        public DateTime? CollegeEvaluatedAt { get; set; }
        public string? CollegeEvaluatorName { get; set; }
    }

    public class ReportAnswerDetailDto
    {
        public int QuestionId { get; set; }
        public string QuestionText { get; set; } = string.Empty;
        public enQuestionType QuestionType { get; set; }
        public int OrderPosition { get; set; }
        public bool IsRequired { get; set; }
        public string? OptionsPayload { get; set; }
        public List<string>? Options { get; set; }
        public string AnswerValue { get; set; } = string.Empty;
        public string? AttachmentPath { get; set; }
    }
}
