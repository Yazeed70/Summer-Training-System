using summer_training_app.Entities.Enums;
using System.ComponentModel.DataAnnotations;

namespace summer_training_app.DTOs.Training
{
    public class MyTrainingRequestDto
    {
        public Guid Id { get; set; }
        public string StudentName { get; set; }
        public string CompanyName { get; set; }
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        public string AcademicYear { get; set; } = string.Empty;
        public enSemesterType Semester { get; set; }
        public enRequestStatus Status { get; set; }
        public string AcceptanceLetterPath { get; set; }
        public DateTime CreatedAt { get; set; }

        public string? Comment { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public string? ReviewedByUserName { get; set; }


        private DateOnly _today => DateOnly.FromDateTime(DateTime.UtcNow);
        public int DurationInWeeks => (int)Math.Ceiling((EndDate.DayNumber - StartDate.DayNumber) / 7.0);

        public int? CurrentWeek =>
            _today < StartDate
            ? null :
            (int)((_today.DayNumber - StartDate.DayNumber) / 7) + 1;
    }
}


