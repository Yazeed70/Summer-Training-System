using System;
using summer_training_app.Entities.Enums;

namespace summer_training_app.DTOs.Dashboard
{
    public class StudentTrainingHistoryDto
    {
        public Guid PublicId { get; set; }
        public string CompanyName { get; set; } = string.Empty;
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        public string AcademicYear { get; set; } = string.Empty;
        public enSemesterType Semester { get; set; }
        public enTrainingStatus Status { get; set; }
    }
}
