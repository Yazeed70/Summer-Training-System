using System;
using System.Collections.Generic;

namespace summer_training_app.DTOs.Reports
{
    public class SaveTemplateDto
    {
        public Guid? TemplatePublicId { get; set; }

        private string? _templateTitle;
        public string TemplateTitle
        {
            get => !string.IsNullOrWhiteSpace(_templateTitle) ? _templateTitle : (Title ?? string.Empty);
            set => _templateTitle = value;
        }

        public string? Title { get; set; }

        public string? Description { get; set; }
        public DateTime? DueDate { get; set; }
        public bool IsAvailable { get; set; } = true;
        public bool IsAvilable { get => IsAvailable; set => IsAvailable = value; }

        public bool RequiresCompanyEvaluation { get; set; } = true;
        public bool RequiresCollegeEvaluation { get; set; } = true;

        public List<CreateQuestionDto> Questions { get; set; } = new List<CreateQuestionDto>();
    }
}
