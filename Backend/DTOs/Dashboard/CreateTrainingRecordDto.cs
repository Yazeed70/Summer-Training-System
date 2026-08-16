using summer_training_app.Entities.Enums;

namespace summer_training_app.DTOs.Dashboard
{
    public class CreateTrainingRecordDto
    {
        public Guid StudentPublicId { get; set; }
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        public string AcademicYear { get; set; } = string.Empty;
        public enSemesterType Semester { get; set; }
        public enTrainingStatus Status { get; set; }
    }
}