using System;
using summer_training_app.Entities.Enums;

namespace summer_training_app.DTOs.Dashboard
{
    public class CompanyStudentsListDto
    {
        public Guid StudentPublicId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string? CollegeName { get; set; }
        public string? Major { get; set; }
        public enTrainingStatus TrainingStatus { get; set; }
    }
}
