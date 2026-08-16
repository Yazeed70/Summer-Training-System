using System;
using System.Collections.Generic;

namespace summer_training_app.DTOs.Reports
{
    public class TemplateDetailsDto
    {
        public Guid TemplatePublicId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime DueDate { get; set; }
        public bool IsAvailable { get; set; } = true;
        public bool RequiresCompanyEvaluation { get; set; } = true;
        public bool RequiresCollegeEvaluation { get; set; } = true;
        public DateTime CreatedAt { get; set; }
        public bool HasSubmissions { get; set; }
        public int SubmissionsCount { get; set; }
        public List<QuestionDto> Questions { get; set; } = new List<QuestionDto>();
    }
}
